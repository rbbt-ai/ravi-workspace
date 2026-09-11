// Reproduce the vendored subset from the pinned official archive without npm
// lifecycle execution. Verification is offline. No Ravi configuration or
// environment is changed.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../src/apps/workspace-hub/vendor/ravi-sdk/',import.meta.url);
const notice=await readFile(new URL('NOTICE.md',root),'utf8');
const entries=[...notice.matchAll(/- `([^`]+)`: `([a-f0-9]{64})`/g)];
if(entries.length!==7)throw Error('SDK_PIN_INVALID');
for(const [,name,hash] of entries){if(createHash('sha256').update(await readFile(new URL(name,root))).digest('hex')!==hash)throw Error('SDK_VENDOR_CHANGED');}
console.log(JSON.stringify({status:'verified',package:'@ravi-os/sdk',version:'0.260725.1',files:entries.length}));
