"""Drain read-only Ravi JSON through a PTY on CLIs that truncate pipe output.

No environment/identity changes, shell, persistent raw data, or secret logging.
The parent process still validates and projects the result before exposing it.
"""
import errno
import json
import os
import pty
import select
import subprocess
import sys
import time

ALLOWED = {('sessions', 'read'), ('artifacts', 'show'), ('artifacts', 'list')}

def main():
    args = sys.argv[1:]
    if tuple(args[:2]) not in ALLOWED or '--json' not in args:
        raise ValueError('READ_COMMAND_REQUIRED')
    master, slave = pty.openpty()
    proc = None
    try:
        proc = subprocess.Popen(['ravi', *args], stdin=subprocess.DEVNULL,
                                stdout=slave, stderr=subprocess.DEVNULL)
        os.close(slave)
        slave = -1
        output = bytearray()
        deadline = time.monotonic() + 25
        while True:
            if time.monotonic() >= deadline:
                raise ValueError('SOURCE_TIMEOUT')
            ready, _, _ = select.select([master], [], [], .2)
            if not ready:
                if proc.poll() is not None:
                    break
                continue
            try:
                part = os.read(master, 65536)
            except OSError as exc:
                if exc.errno == errno.EIO:
                    break
                raise
            if not part:
                break
            output.extend(part)
            if len(output) > 4000000:
                raise ValueError('SOURCE_TOO_LARGE')
        if proc.wait(timeout=2) != 0:
            raise ValueError('SOURCE_UNAVAILABLE')
        value = json.loads(output.decode('utf-8'))
        # Python drains stdout before exit; no raw content is written to disk.
        json.dump(value, sys.stdout, ensure_ascii=True)
        sys.stdout.flush()
    finally:
        if slave != -1:
            os.close(slave)
        os.close(master)
        if proc is not None and proc.poll() is None:
            proc.kill()
            proc.wait()

if __name__ == '__main__':
    try:
        main()
    except Exception:
        sys.stderr.write('SOURCE_CONTRACT_CHANGED\n')
        sys.exit(1)
