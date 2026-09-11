// GENERATED FILE — DO NOT EDIT.
// Run `ravi sdk client generate` to regenerate.
// Drift is detected by `ravi sdk client check` (CI).
/**
 * `RaviClient` exposes every registry command as a typed method.
 *
 * The class is generated 1:1 from `getRegistry()`. Every method calls into
 * the supplied `Transport`, which is responsible for validation, scope
 * enforcement, and audit (see `transport/http.ts` and
 * `transport/in-process.ts`).
 */
export class RaviClient {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    adapters = {
        /** List session adapters with health and bind state */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["adapters"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Show a session adapter debug snapshot */
        show: async (adapterId) => {
            return this.transport.call({
                groupSegments: ["adapters"],
                command: "show",
                body: { adapterId },
            });
        }
    };
    agents = {
        /** Create a new agent */
        create: async (id, cwd, options) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "create",
                body: { id, cwd, ...(options ?? {}) },
            });
        },
        /** Set message debounce time */
        debounce: async (id, ms) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "debounce",
                body: { id, ms },
            });
        },
        /** Show last turns of an agent session (what it received, what it responded) */
        debug: async (id, nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "debug",
                body: { id, nameOrKey, ...(options ?? {}) },
            });
        },
        /** Delete an agent */
        delete: async (id) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "delete",
                body: { id },
            });
        },
        /** List all agents */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Set or show an agent runtime permission profile */
        permissions: async (id, profile, options) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "permissions",
                body: { id, profile, ...(options ?? {}) },
            });
        },
        /** Reset agent session */
        reset: async (id, nameOrKey) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "reset",
                body: { id, nameOrKey },
            });
        },
        /** Show agent session status */
        session: async (id) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "session",
                body: { id },
            });
        },
        /** Set agent property and report active session runtime overrides */
        set: async (id, key, value) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "set",
                body: { id, key, value },
            });
        },
        /** Show agent details */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "show",
                body: { id },
            });
        },
        /** Enable or disable spec mode for an agent */
        specMode: async (id, enabled) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "spec-mode",
                body: { id, enabled },
            });
        },
        /** Migrate agent workspaces to AGENTS.md as the canonical file */
        syncInstructions: async (options) => {
            return this.transport.call({
                groupSegments: ["agents"],
                command: "sync-instructions",
                body: { ...(options ?? {}) },
            });
        }
    };
    apps = {
        /** Validate Ravi app manifests without executing app code */
        check: async (id) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "check",
                body: { id },
            });
        },
        /** Delete scaffold-owned artifacts for a Ravi app */
        delete: async (id, options) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "delete",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Print agent guidance for discovering, scaffolding, and operating Ravi apps */
        guide: async (id) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "guide",
                body: { id },
            });
        },
        /** Create a Ravi app draft from an existing CLI contract */
        importCli: async (command, options) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "import-cli",
                body: { command, ...(options ?? {}) },
            });
        },
        /** List discovered Ravi apps */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Print all built-in Ravi apps agent prompts */
        prompts: async (id) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "prompts",
                body: { id },
            });
        },
        /** Run a Ravi app operation through the runtime app router */
        run: async (id, operation, args) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "run",
                body: { id, operation, args },
            });
        },
        /** Create a Ravi app scaffold from the app contract */
        scaffold: async (id, options) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "scaffold",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Show a Ravi app manifest */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["apps"],
                command: "show",
                body: { id },
            });
        }
    };
    artifacts = {
        /** Soft-archive an artifact */
        archive: async (id) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "archive",
                body: { id },
            });
        },
        /** Attach an artifact to a task, session, message or any target */
        attach: async (id, targetType, targetId, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "attach",
                body: { id, targetType, targetId, ...(options ?? {}) },
            });
        },
        /** Stream raw artifact bytes */
        blob: async (id) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "blob",
                body: { id },
                binary: true,
            });
        },
        /** Create a generic Ravi artifact record */
        create: async (options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "create",
                body: { ...(options ?? {}) },
            });
        },
        /** Append an artifact lifecycle event */
        event: async (id, eventType, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "event",
                body: { id, eventType, ...(options ?? {}) },
            });
        },
        /** List artifact lifecycle events */
        events: async (id) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "events",
                body: { id },
            });
        },
        /** List artifacts */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Upload a local artifact/file/directory to Console and optionally release it to Ravi Pages */
        publish: async (target, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "publish",
                body: { target, ...(options ?? {}) },
            });
        },
        release: {
            /** Activate an existing Pages release for a local artifact */
            activate: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["artifacts", "release"],
                    command: "activate",
                    body: { id, ...(options ?? {}) },
                });
            }
        },
        /** Restore current artifact content from an immutable version */
        restore: async (id, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "restore",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Show artifact details, links and events */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "show",
                body: { id },
            });
        },
        /** Create an immutable version snapshot for an artifact */
        snapshot: async (id, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "snapshot",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Edit artifact metadata and high-level fields */
        update: async (id, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "update",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Show one immutable artifact version */
        version: async (id, options) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "version",
                body: { id, ...(options ?? {}) },
            });
        },
        /** List immutable versions for an artifact */
        versions: async (id) => {
            return this.transport.call({
                groupSegments: ["artifacts"],
                command: "versions",
                body: { id },
            });
        }
    };
    audio = {
        /** Return generated TTS audio bytes */
        blob: async (id) => {
            return this.transport.call({
                groupSegments: ["audio"],
                command: "blob",
                body: { id },
                binary: true,
            });
        },
        /** Generate speech from text using ElevenLabs TTS */
        generate: async (text, options) => {
            return this.transport.call({
                groupSegments: ["audio"],
                command: "generate",
                body: { text, ...(options ?? {}) },
            });
        },
        /** List generated ravi.tts playback items waiting for extension playback */
        pending: async (options) => {
            return this.transport.call({
                groupSegments: ["audio"],
                command: "pending",
                body: { ...(options ?? {}) },
            });
        },
        /** Publish a ravi.tts request for ElevenLabs generation and extension playback */
        tts: async (text, options) => {
            return this.transport.call({
                groupSegments: ["audio"],
                command: "tts",
                body: { text, ...(options ?? {}) },
            });
        },
        /** List available ElevenLabs voices for picker UIs */
        voices: async (options) => {
            return this.transport.call({
                groupSegments: ["audio"],
                command: "voices",
                body: { ...(options ?? {}) },
            });
        }
    };
    bridges = {
        /** Create a Ravi MCP bridge URL for a Console project */
        create: async (options) => {
            return this.transport.call({
                groupSegments: ["bridges"],
                command: "create",
                body: { ...(options ?? {}) },
            });
        },
        /** List Ravi MCP bridges for a Console project */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["bridges"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Revoke a Ravi MCP bridge and its client tokens */
        revoke: async (id, options) => {
            return this.transport.call({
                groupSegments: ["bridges"],
                command: "revoke",
                body: { id, ...(options ?? {}) },
            });
        }
    };
    calendars = {
        /** Return free/busy availability in a bounded time window */
        availability: async (options) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "availability",
                body: { ...(options ?? {}) },
            });
        },
        /** Create or update a local calendar projection */
        create: async (options) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "create",
                body: { ...(options ?? {}) },
            });
        },
        /** Disable a local calendar projection */
        disable: async (calendar) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "disable",
                body: { calendar },
            });
        },
        events: {
            /** Cancel a local calendar event */
            cancel: async (event, options) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "cancel",
                    body: { event, ...(options ?? {}) },
                });
            },
            /** Create a local calendar event and local outbox row */
            create: async (options) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "create",
                    body: { ...(options ?? {}) },
                });
            },
            /** List local calendar events in a bounded time window */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Read one local calendar event */
            read: async (event) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "read",
                    body: { event },
                });
            },
            /** Record an attendee response and enqueue provider delivery */
            respond: async (event, options) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "respond",
                    body: { event, ...(options ?? {}) },
                });
            },
            /** Update a local calendar event and enqueue provider delivery */
            update: async (event, options) => {
                return this.transport.call({
                    groupSegments: ["calendars", "events"],
                    command: "update",
                    body: { event, ...(options ?? {}) },
                });
            }
        },
        /** List local calendars visible to the current requester */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Grant a calendar relation to an agent/contact/system subject */
        share: async (calendar, options) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "share",
                body: { calendar, ...(options ?? {}) },
            });
        },
        /** Show a local calendar */
        show: async (calendar, options) => {
            return this.transport.call({
                groupSegments: ["calendars"],
                command: "show",
                body: { calendar, ...(options ?? {}) },
            });
        }
    };
    channels = {
        backend: {
            /** Accept one idempotent external channel message into a local agent session */
            ingress: async (agentId, request) => {
                return this.transport.call({
                    groupSegments: ["channels", "backend"],
                    command: "ingress",
                    body: { agentId, request },
                });
            },
            runtime: {
                /** Idempotently request interruption of an accepted channel turn */
                interrupt: async (agentId, request) => {
                    return this.transport.call({
                        groupSegments: ["channels", "backend", "runtime"],
                        command: "interrupt",
                        body: { agentId, request },
                    });
                },
                /** Read the provider-neutral state of an accepted channel turn */
                readback: async (agentId, request) => {
                    return this.transport.call({
                        groupSegments: ["channels", "backend", "runtime"],
                        command: "readback",
                        body: { agentId, request },
                    });
                }
            }
        },
        /** Create or update a native channel config */
        create: async (name, options) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "create",
                body: { name, ...(options ?? {}) },
            });
        },
        /** List configured native channels */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Start channel runner infrastructure and print foreground status */
        probe: async () => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "probe",
                body: {},
            });
        },
        /** Restart the channel runner */
        restart: async (options) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "restart",
                body: { ...(options ?? {}) },
            });
        },
        /** Set a native channel config property */
        set: async (name, key, value) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "set",
                body: { name, key, value },
            });
        },
        /** Show one configured native channel */
        show: async (name) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "show",
                body: { name },
            });
        },
        /** Start the channel runner via PM2 */
        start: async (options) => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "start",
                body: { ...(options ?? {}) },
            });
        },
        /** Show channel runner status */
        status: async () => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "status",
                body: {},
            });
        },
        /** Stop the channel runner */
        stop: async () => {
            return this.transport.call({
                groupSegments: ["channels"],
                command: "stop",
                body: {},
            });
        }
    };
    chats = {
        /** Backfill message provider timestamps from raw provenance */
        backfillProviderTimestamps: async (options) => {
            return this.transport.call({
                groupSegments: ["chats"],
                command: "backfill-provider-timestamps",
                body: { ...(options ?? {}) },
            });
        },
        /** Ensure one canonical direct chat between an actor and an agent */
        ensure: async (actorId, agentId, clientRequestId) => {
            return this.transport.call({
                groupSegments: ["chats"],
                command: "ensure",
                body: { actorId, agentId, clientRequestId },
            });
        },
        /** List recent canonical chats */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["chats"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        lists: {
            /** Add a chat to a reading list */
            add: async (list, chat, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "add",
                    body: { list, chat, ...(options ?? {}) },
                });
            },
            /** Create or restore a chat reading list */
            create: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "create",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Read what changed in a chat since this list reader cursor */
            delta: async (list, chat, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "delta",
                    body: { list, chat, ...(options ?? {}) },
                });
            },
            /** List chat reading lists */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Explicitly advance one reading-list cursor */
            markRead: async (list, chat, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "mark-read",
                    body: { list, chat, ...(options ?? {}) },
                });
            },
            /** List chats in a reading list with unread counts */
            members: async (list, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "members",
                    body: { list, ...(options ?? {}) },
                });
            },
            /** Validate a dynamic selector and preview membership diff without writes */
            preview: async (listId, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "preview",
                    body: { listId, ...(options ?? {}) },
                });
            },
            /** Materialize dynamic reading-list selector membership */
            recompute: async (listId, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "recompute",
                    body: { listId, ...(options ?? {}) },
                });
            },
            /** Remove a chat from a reading list without deleting cursor history */
            remove: async (list, chat, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "remove",
                    body: { list, chat, ...(options ?? {}) },
                });
            },
            /** Show one reading list and explain whether its selector is safe */
            show: async (listId, options) => {
                return this.transport.call({
                    groupSegments: ["chats", "lists"],
                    command: "show",
                    body: { listId, ...(options ?? {}) },
                });
            }
        },
        messages: {
            /** Create one idempotent actor-authored message in a canonical chat */
            create: async (chatId, actorId, clientMessageId, content) => {
                return this.transport.call({
                    groupSegments: ["chats", "messages"],
                    command: "create",
                    body: { chatId, actorId, clientMessageId, content },
                });
            }
        },
        /** Read messages from one chat */
        read: async (chat, options) => {
            return this.transport.call({
                groupSegments: ["chats"],
                command: "read",
                body: { chat, ...(options ?? {}) },
            });
        }
    };
    cloud = {
        projects: {
            /** Create a Ravi Cloud project in Console */
            create: async (slug, options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "projects"],
                    command: "create",
                    body: { slug, ...(options ?? {}) },
                });
            },
            /** List Ravi Cloud projects from Console */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "projects"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            }
        },
        scope: {
            /** Clear a default Console project for a session, agent, workspace, or install */
            clear: async (options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "scope"],
                    command: "clear",
                    body: { ...(options ?? {}) },
                });
            },
            /** Explain how the effective Ravi Console scope is resolved */
            explain: async (options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "scope"],
                    command: "explain",
                    body: { ...(options ?? {}) },
                });
            },
            /** Set a default Console project for a session, agent, workspace, or install */
            set: async (options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "scope"],
                    command: "set",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show the effective Ravi Console scope for this process */
            show: async (options) => {
                return this.transport.call({
                    groupSegments: ["cloud", "scope"],
                    command: "show",
                    body: { ...(options ?? {}) },
                });
            }
        }
    };
    commands = {
        /** List Ravi commands */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["commands"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Render a Ravi command into its composed prompt */
        run: async (name, args, options) => {
            return this.transport.call({
                groupSegments: ["commands"],
                command: "run",
                body: { name, args, ...(options ?? {}) },
            });
        },
        /** Show one Ravi command */
        show: async (name, options) => {
            return this.transport.call({
                groupSegments: ["commands"],
                command: "show",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Validate Ravi command files */
        validate: async (options) => {
            return this.transport.call({
                groupSegments: ["commands"],
                command: "validate",
                body: { ...(options ?? {}) },
            });
        }
    };
    connectors = {
        /** List your connectors */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["connectors"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Revoke a connector and delete its stored credentials */
        revoke: async (id, options) => {
            return this.transport.call({
                groupSegments: ["connectors"],
                command: "revoke",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Show details of a single connector */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["connectors"],
                command: "show",
                body: { id },
            });
        }
    };
    contacts = {
        /** Show session activity attributed to a contact */
        activity: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "activity",
                body: { contact, ...(options ?? {}) },
            });
        },
        /** Add/allow a contact */
        add: async (identity, name, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "add",
                body: { identity, name, ...(options ?? {}) },
            });
        },
        /** Allow a contact */
        allow: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "allow",
                body: { contact },
            });
        },
        /** Approve pending contact */
        approve: async (contact, mode, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "approve",
                body: { contact, mode, ...(options ?? {}) },
            });
        },
        /** Backfill canonical contacts from captured chats */
        backfill: async (options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "backfill",
                body: { ...(options ?? {}) },
            });
        },
        /** Block a contact */
        block: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "block",
                body: { contact },
            });
        },
        /** Check contact status (alias for info) */
        check: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "check",
                body: { contact },
            });
        },
        /** Find likely duplicate contacts */
        duplicates: async () => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "duplicates",
                body: {},
            });
        },
        /** Find contacts by tag or search query */
        find: async (query, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "find",
                body: { query, ...(options ?? {}) },
            });
        },
        /** Show canonical contact details */
        get: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "get",
                body: { contact },
            });
        },
        /** Show contact details with all identities */
        info: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "info",
                body: { contact },
            });
        },
        /** Link a platform identity to a contact */
        link: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "link",
                body: { contact, ...(options ?? {}) },
            });
        },
        /** List all contacts */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Merge two contacts (move identities from source to target) */
        merge: async (source, target) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "merge",
                body: { source, target },
            });
        },
        /** Show messages attributed to a contact */
        messages: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "messages",
                body: { contact, ...(options ?? {}) },
            });
        },
        metadata: {
            /** List current scoped metadata for a contact */
            list: async (contact, options) => {
                return this.transport.call({
                    groupSegments: ["contacts", "metadata"],
                    command: "list",
                    body: { contact, ...(options ?? {}) },
                });
            },
            /** Remove scoped metadata from a contact */
            remove: async (contact, key, options) => {
                return this.transport.call({
                    groupSegments: ["contacts", "metadata"],
                    command: "remove",
                    body: { contact, key, ...(options ?? {}) },
                });
            },
            /** Set scoped metadata for a contact */
            set: async (contact, key, value, options) => {
                return this.transport.call({
                    groupSegments: ["contacts", "metadata"],
                    command: "set",
                    body: { contact, key, value, ...(options ?? {}) },
                });
            }
        },
        /** Append a note to a contact timeline */
        note: async (contact, text, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "note",
                body: { contact, text, ...(options ?? {}) },
            });
        },
        /** List pending contacts */
        pending: async (options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "pending",
                body: { ...(options ?? {}) },
            });
        },
        /** Show a contact profile card */
        profile: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "profile",
                body: { contact, ...(options ?? {}) },
            });
        },
        /** Remove a contact */
        remove: async (contact) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "remove",
                body: { contact },
            });
        },
        /** Show session summaries attributed to a contact */
        sessions: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "sessions",
                body: { contact, ...(options ?? {}) },
            });
        },
        /** Set contact property */
        set: async (contact, key, value) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "set",
                body: { contact, key, value },
            });
        },
        /** Add a tag to a contact */
        tag: async (contact, tag) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "tag",
                body: { contact, tag },
            });
        },
        /** Show contact timeline events */
        timeline: async (contact, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "timeline",
                body: { contact, ...(options ?? {}) },
            });
        },
        /** Unlink a platform identity from its contact */
        unlink: async (platformIdentity, options) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "unlink",
                body: { platformIdentity, ...(options ?? {}) },
            });
        },
        /** Remove a tag from a contact */
        untag: async (contact, tag) => {
            return this.transport.call({
                groupSegments: ["contacts"],
                command: "untag",
                body: { contact, tag },
            });
        }
    };
    context = {
        /** Request approval and extend the current runtime context if approved */
        authorize: async (permission, objectType, objectId) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "authorize",
                body: { permission, objectType, objectId },
            });
        },
        /** List inherited capabilities for the current runtime context */
        capabilities: async () => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "capabilities",
                body: {},
            });
        },
        /** Check whether the current runtime context allows an action */
        check: async (permission, objectType, objectId) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "check",
                body: { permission, objectType, objectId },
            });
        },
        /** Dry-run or revoke stale agent-runtime contexts left by old turn-scoped issuance */
        cleanupAgentRuntime: async (options) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "cleanup-agent-runtime",
                body: { ...(options ?? {}) },
            });
        },
        /** Evaluate a Codex PreToolUse Bash hook payload from stdin using the current Ravi context */
        codexBashHook: async () => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "codex-bash-hook",
                body: {},
            });
        },
        credentials: {
            /** Add a runtime context-key to the local credentials store */
            add: async (contextKey, options) => {
                return this.transport.call({
                    groupSegments: ["context", "credentials"],
                    command: "add",
                    body: { contextKey, ...(options ?? {}) },
                });
            },
            /** List entries in the local credentials store */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["context", "credentials"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Remove a stored context-key from the credentials store */
            remove: async (contextKey) => {
                return this.transport.call({
                    groupSegments: ["context", "credentials"],
                    command: "remove",
                    body: { contextKey },
                });
            },
            /** Mark a stored context-key as the default */
            setDefault: async (contextKey) => {
                return this.transport.call({
                    groupSegments: ["context", "credentials"],
                    command: "set-default",
                    body: { contextKey },
                });
            }
        },
        /** Show full runtime context details without exposing the context key */
        info: async (contextId) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "info",
                body: { contextId },
            });
        },
        /** Issue a least-privilege child context for an external CLI */
        issue: async (cliName, options) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "issue",
                body: { cliName, ...(options ?? {}) },
            });
        },
        /** Show ancestor chain and descendant tree for a runtime context */
        lineage: async (contextId) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "lineage",
                body: { contextId },
            });
        },
        /** List issued runtime contexts without exposing context keys */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Compact the context store by deleting inactive (revoked/expired) contexts */
        prune: async (options) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "prune",
                body: { ...(options ?? {}) },
            });
        },
        /** Revoke a runtime context by context ID */
        revoke: async (contextId, options) => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "revoke",
                body: { contextId, ...(options ?? {}) },
            });
        },
        /** Show the current context session visibility */
        visibility: async () => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "visibility",
                body: {},
            });
        },
        /** Resolve the current runtime context */
        whoami: async () => {
            return this.transport.call({
                groupSegments: ["context"],
                command: "whoami",
                body: {},
            });
        }
    };
    costs = {
        /** Show detailed cost summary for one agent */
        agent: async (agentId, options) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "agent",
                body: { agentId, ...(options ?? {}) },
            });
        },
        /** Show cost breakdown by agent */
        agents: async (options) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "agents",
                body: { ...(options ?? {}) },
            });
        },
        /** Audit pricing coverage for recent cost events */
        pricing: async (options) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "pricing",
                body: { ...(options ?? {}) },
            });
        },
        /** Show detailed cost summary for one session */
        session: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "session",
                body: { nameOrKey },
            });
        },
        /** Show total cost summary for a recent window */
        summary: async (options) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "summary",
                body: { ...(options ?? {}) },
            });
        },
        /** Show most expensive sessions */
        topSessions: async (options) => {
            return this.transport.call({
                groupSegments: ["costs"],
                command: "top-sessions",
                body: { ...(options ?? {}) },
            });
        }
    };
    credentials = {
        connections: {
            /** Disable a credential connection */
            disable: async (options) => {
                return this.transport.call({
                    groupSegments: ["credentials", "connections"],
                    command: "disable",
                    body: { ...(options ?? {}) },
                });
            },
            /** Enable a credential connection */
            enable: async (options) => {
                return this.transport.call({
                    groupSegments: ["credentials", "connections"],
                    command: "enable",
                    body: { ...(options ?? {}) },
                });
            },
            /** List provider credential connections without secret values */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["credentials", "connections"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show one credential connection without secret values */
            show: async (options) => {
                return this.transport.call({
                    groupSegments: ["credentials", "connections"],
                    command: "show",
                    body: { ...(options ?? {}) },
                });
            }
        },
        policies: {
            /** Explain capabilities required for a provider credential action */
            explain: async (options) => {
                return this.transport.call({
                    groupSegments: ["credentials", "policies"],
                    command: "explain",
                    body: { ...(options ?? {}) },
                });
            }
        }
    };
    crm = {
        account: {
            /** Create a CRM account */
            create: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "account"],
                    command: "create",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Link a contact to an account */
            linkContact: async (account, contact, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "account"],
                    command: "link-contact",
                    body: { account, contact, ...(options ?? {}) },
                });
            },
            /** Show CRM account */
            show: async (account) => {
                return this.transport.call({
                    groupSegments: ["crm", "account"],
                    command: "show",
                    body: { account },
                });
            }
        },
        /** Show CRM account */
        accountCommand: async (account) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "account",
                body: { account },
            });
        },
        /** Show open opportunity board */
        board: async (options) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "board",
                body: { ...(options ?? {}) },
            });
        },
        contact: {
            /** Set one CRM contact profile field */
            set: async (contact, field, value, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "contact"],
                    command: "set",
                    body: { contact, field, value, ...(options ?? {}) },
                });
            },
            /** Show CRM profile for one contact */
            show: async (contact) => {
                return this.transport.call({
                    groupSegments: ["crm", "contact"],
                    command: "show",
                    body: { contact },
                });
            }
        },
        /** Show CRM profile for one contact */
        contactCommand: async (contact) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "contact",
                body: { contact },
            });
        },
        /** List CRM contact cards */
        contacts: async (options) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "contacts",
                body: { ...(options ?? {}) },
            });
        },
        fact: {
            /** Confirm a CRM fact */
            confirm: async (fact) => {
                return this.transport.call({
                    groupSegments: ["crm", "fact"],
                    command: "confirm",
                    body: { fact },
                });
            },
            /** List CRM facts */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["crm", "fact"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Propose or confirm a CRM fact */
            propose: async (entityType, entity, key, value, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "fact"],
                    command: "propose",
                    body: { entityType, entity, key, value, ...(options ?? {}) },
                });
            },
            /** Reject a CRM fact */
            reject: async (fact) => {
                return this.transport.call({
                    groupSegments: ["crm", "fact"],
                    command: "reject",
                    body: { fact },
                });
            }
        },
        /** List open CRM next actions */
        next: async (options) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "next",
                body: { ...(options ?? {}) },
            });
        },
        opportunity: {
            /** List contacts linked to an opportunity */
            contacts: async (opportunity) => {
                return this.transport.call({
                    groupSegments: ["crm", "opportunity"],
                    command: "contacts",
                    body: { opportunity },
                });
            },
            /** Create a CRM opportunity */
            create: async (title, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "opportunity"],
                    command: "create",
                    body: { title, ...(options ?? {}) },
                });
            },
            /** Link a contact to an opportunity */
            linkContact: async (opportunity, contact, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "opportunity"],
                    command: "link-contact",
                    body: { opportunity, contact, ...(options ?? {}) },
                });
            },
            /** Move an opportunity to another stage */
            move: async (opportunity, stage, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "opportunity"],
                    command: "move",
                    body: { opportunity, stage, ...(options ?? {}) },
                });
            },
            /** Show CRM opportunity */
            show: async (opportunity) => {
                return this.transport.call({
                    groupSegments: ["crm", "opportunity"],
                    command: "show",
                    body: { opportunity },
                });
            }
        },
        /** Show CRM opportunity */
        opportunityCommand: async (opportunity) => {
            return this.transport.call({
                groupSegments: ["crm"],
                command: "opportunity",
                body: { opportunity },
            });
        },
        pipeline: {
            /** Create a CRM pipeline (with optional declarative metadata) */
            create: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "create",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** List CRM pipelines */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            policy: {
                /** Evaluate metadata.hitl_required_when against a JSON context (decide if send needs human approval) */
                hitlCheck: async (pipeline, options) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "policy"],
                        command: "hitl-check",
                        body: { pipeline, ...(options ?? {}) },
                    });
                },
                /** Evaluate metadata.send_window for a pipeline at a given instant (allow / releaseAt) */
                sendWindowCheck: async (pipeline, options) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "policy"],
                        command: "send-window-check",
                        body: { pipeline, ...(options ?? {}) },
                    });
                }
            },
            /** Review pipeline metadata against canonical schema (12 fields, ✓/⚠/✗ + suggestions) */
            review: async (pipeline) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "review",
                    body: { pipeline },
                });
            },
            /** Set a CRM pipeline field (or patch metadata via structured flags) */
            set: async (pipeline, field, value, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "set",
                    body: { pipeline, field, value, ...(options ?? {}) },
                });
            },
            /** Show one CRM pipeline with stages and topics */
            show: async (pipeline, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "show",
                    body: { pipeline, ...(options ?? {}) },
                });
            },
            stage: {
                /** Add a stage to a CRM pipeline */
                add: async (pipeline, key, options) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "add",
                        body: { pipeline, key, ...(options ?? {}) },
                    });
                },
                /** Archive a CRM pipeline stage */
                archive: async (pipeline, stage) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "archive",
                        body: { pipeline, stage },
                    });
                },
                /** List stages in a CRM pipeline */
                list: async (pipeline, options) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "list",
                        body: { pipeline, ...(options ?? {}) },
                    });
                },
                /** Set a CRM pipeline stage field */
                set: async (pipeline, stage, field, value) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "set",
                        body: { pipeline, stage, field, value },
                    });
                },
                /** Show one CRM pipeline stage */
                show: async (pipeline, stage) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "show",
                        body: { pipeline, stage },
                    });
                },
                topic: {
                    /** Add a topic to a CRM pipeline stage */
                    add: async (pipeline, stage, key, options) => {
                        return this.transport.call({
                            groupSegments: ["crm", "pipeline", "stage", "topic"],
                            command: "add",
                            body: { pipeline, stage, key, ...(options ?? {}) },
                        });
                    },
                    /** Archive a CRM pipeline stage topic */
                    archive: async (pipeline, stage, topic) => {
                        return this.transport.call({
                            groupSegments: ["crm", "pipeline", "stage", "topic"],
                            command: "archive",
                            body: { pipeline, stage, topic },
                        });
                    },
                    /** Set a CRM pipeline stage topic field */
                    set: async (pipeline, stage, topic, field, value) => {
                        return this.transport.call({
                            groupSegments: ["crm", "pipeline", "stage", "topic"],
                            command: "set",
                            body: { pipeline, stage, topic, field, value },
                        });
                    }
                },
                /** List topics configured for a CRM pipeline stage */
                topics: async (pipeline, stage, options) => {
                    return this.transport.call({
                        groupSegments: ["crm", "pipeline", "stage"],
                        command: "topics",
                        body: { pipeline, stage, ...(options ?? {}) },
                    });
                }
            },
            /** Validate pipeline metadata against canonical JSON Schema (PASS/WARN/FAIL) */
            validate: async (pipeline, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "pipeline"],
                    command: "validate",
                    body: { pipeline, ...(options ?? {}) },
                });
            }
        },
        task: {
            /** Cancel a CRM task */
            cancel: async (task, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "cancel",
                    body: { task, ...(options ?? {}) },
                });
            },
            /** Create a CRM relationship task */
            create: async (title, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "create",
                    body: { title, ...(options ?? {}) },
                });
            },
            /** Complete a CRM task */
            done: async (task) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "done",
                    body: { task },
                });
            },
            /** List CRM tasks (all statuses) */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show CRM task */
            show: async (task) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "show",
                    body: { task },
                });
            },
            /** Snooze a CRM task to a new due_at */
            snooze: async (task, options) => {
                return this.transport.call({
                    groupSegments: ["crm", "task"],
                    command: "snooze",
                    body: { task, ...(options ?? {}) },
                });
            }
        }
    };
    cron = {
        /** Add a new scheduled job */
        add: async (name, options) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "add",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Disable a job */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable a job */
        enable: async (id) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "enable",
                body: { id },
            });
        },
        /** List scheduled jobs (agent-scoped by default) */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Delete a job */
        rm: async (id) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "rm",
                body: { id },
            });
        },
        /** Manually run a job (ignores schedule) */
        run: async (id) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "run",
                body: { id },
            });
        },
        /** Set job property */
        set: async (id, key, value) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "set",
                body: { id, key, value },
            });
        },
        /** Show job details */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["cron"],
                command: "show",
                body: { id },
            });
        }
    };
    daemon = {
        /** Edit environment file (~/.ravi/.env) */
        env: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "env",
                body: {},
            });
        },
        /** Bootstrap the admin runtime context-key. Refuses to run if any live admin context already exists. */
        initAdminKey: async (options) => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "init-admin-key",
                body: { ...(options ?? {}) },
            });
        },
        /** Save PM2 process list and suggest startup */
        install: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "install",
                body: {},
            });
        },
        /** Show daemon logs (PM2) */
        logs: async (options) => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "logs",
                body: { ...(options ?? {}) },
            });
        },
        /** Restart the daemon */
        restart: async (options) => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "restart",
                body: { ...(options ?? {}) },
            });
        },
        /** Start the daemon via PM2 */
        start: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "start",
                body: {},
            });
        },
        /** Show daemon and infrastructure status */
        status: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "status",
                body: {},
            });
        },
        /** Stop the daemon */
        stop: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "stop",
                body: {},
            });
        },
        /** Remove ravi from PM2 and clean up */
        uninstall: async () => {
            return this.transport.call({
                groupSegments: ["daemon"],
                command: "uninstall",
                body: {},
            });
        }
    };
    devin = {
        auth: {
            /** Validate Devin API credentials */
            check: async () => {
                return this.transport.call({
                    groupSegments: ["devin", "auth"],
                    command: "check",
                    body: {},
                });
            }
        },
        sessions: {
            /** Archive a Devin session */
            archive: async (session) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "archive",
                    body: { session },
                });
            },
            /** List and cache session attachments */
            attachments: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "attachments",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** Create a Devin session */
            create: async (options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "create",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show Devin session insights/activity summary */
            insights: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "insights",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** List local or remote Devin sessions */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** List and cache session messages */
            messages: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "messages",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** Send a message to a Devin session */
            send: async (session, message, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "send",
                    body: { session, message, ...(options ?? {}) },
                });
            },
            /** Show one Devin session */
            show: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "show",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** Sync session status, messages and attachments */
            sync: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "sync",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** Terminate a Devin session */
            terminate: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["devin", "sessions"],
                    command: "terminate",
                    body: { session, ...(options ?? {}) },
                });
            }
        }
    };
    eval = {
        /** Run an eval task spec and persist artifacts */
        run: async (specPath, options) => {
            return this.transport.call({
                groupSegments: ["eval"],
                command: "run",
                body: { specPath, ...(options ?? {}) },
            });
        }
    };
    feedback = {
        /** Submit structured feedback to Ravi Console */
        send: async (message, options) => {
            return this.transport.call({
                groupSegments: ["feedback"],
                command: "send",
                body: { message, ...(options ?? {}) },
            });
        }
    };
    gmail = {
        /** List messages in the connected Gmail mailbox */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["gmail"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Read a single Gmail message */
        read: async (id, options) => {
            return this.transport.call({
                groupSegments: ["gmail"],
                command: "read",
                body: { id, ...(options ?? {}) },
            });
        }
    };
    heartbeat = {
        /** Disable heartbeat for an agent */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable heartbeat for an agent */
        enable: async (id, interval) => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "enable",
                body: { id, interval },
            });
        },
        /** Set heartbeat property */
        set: async (id, key, value) => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "set",
                body: { id, key, value },
            });
        },
        /** Show heartbeat config for an agent */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "show",
                body: { id },
            });
        },
        /** Show heartbeat status for all agents */
        status: async () => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "status",
                body: {},
            });
        },
        /** Manually trigger a heartbeat */
        trigger: async (id) => {
            return this.transport.call({
                groupSegments: ["heartbeat"],
                command: "trigger",
                body: { id },
            });
        }
    };
    hooks = {
        /** Create a new runtime hook */
        create: async (name, options) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "create",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Disable a hook */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable a hook */
        enable: async (id) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "enable",
                body: { id },
            });
        },
        /** List configured hooks */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Delete a hook */
        rm: async (id) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "rm",
                body: { id },
            });
        },
        /** Show hook details */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "show",
                body: { id },
            });
        },
        /** Execute a hook once with a synthetic event */
        test: async (id) => {
            return this.transport.call({
                groupSegments: ["hooks"],
                command: "test",
                body: { id },
            });
        }
    };
    image = {
        atlas: {
            /** Split an image atlas/contact sheet into deterministic crop artifacts */
            split: async (input, options) => {
                return this.transport.call({
                    groupSegments: ["image", "atlas"],
                    command: "split",
                    body: { input, ...(options ?? {}) },
                });
            }
        },
        /** Generate an image from a text prompt */
        generate: async (prompt, options) => {
            return this.transport.call({
                groupSegments: ["image"],
                command: "generate",
                body: { prompt, ...(options ?? {}) },
            });
        }
    };
    inbox = {
        /** Archive a local inbox item */
        archive: async (item) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "archive",
                body: { item },
            });
        },
        /** Disable inbox polling for the current Console+org */
        disable: async () => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "disable",
                body: {},
            });
        },
        /** Mark a local inbox item done */
        done: async (item) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "done",
                body: { item },
            });
        },
        /** Enable inbox polling for the current Console+org */
        enable: async () => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "enable",
                body: {},
            });
        },
        /** List recently delivered inbox items in the local mirror */
        items: async (options) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "items",
                body: { ...(options ?? {}) },
            });
        },
        /** List local inbox items */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Run a single inbox poll cycle (foreground) */
        poll: async (options) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "poll",
                body: { ...(options ?? {}) },
            });
        },
        /** Read one local inbox item and mark it seen */
        read: async (item) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "read",
                body: { item },
            });
        },
        /** Republish a locally stored inbox item to NATS */
        replay: async (ref) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "replay",
                body: { ref },
            });
        },
        /** Snooze a local inbox item until a timestamp */
        snooze: async (item, options) => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "snooze",
                body: { item, ...(options ?? {}) },
            });
        },
        /** List local inbox source domains */
        sources: async () => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "sources",
                body: {},
            });
        },
        /** Show inbox poller status and subscriptions */
        status: async () => {
            return this.transport.call({
                groupSegments: ["inbox"],
                command: "status",
                body: {},
            });
        }
    };
    insights = {
        /** Create a new insight with lineage captured from the current runtime context */
        create: async (summary, options) => {
            return this.transport.call({
                groupSegments: ["insights"],
                command: "create",
                body: { summary, ...(options ?? {}) },
            });
        },
        /** List recent insights with optional filters */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["insights"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Search insights by free text */
        search: async (text, options) => {
            return this.transport.call({
                groupSegments: ["insights"],
                command: "search",
                body: { text, ...(options ?? {}) },
            });
        },
        /** Show one insight with lineage and comments */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["insights"],
                command: "show",
                body: { id },
            });
        }
    };
    instances = {
        /** Create a new instance */
        create: async (name, options) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "create",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Delete an instance (soft-delete, recoverable) */
        delete: async (name) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "delete",
                body: { name },
            });
        },
        /** List soft-deleted instances */
        deleted: async () => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "deleted",
                body: {},
            });
        },
        /** Disable an instance in Ravi without changing omni */
        disable: async (target) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "disable",
                body: { target },
            });
        },
        /** Disconnect an instance from omni */
        disconnect: async (name) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "disconnect",
                body: { name },
            });
        },
        /** Enable an instance in Ravi without changing omni */
        enable: async (target) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "enable",
                body: { target },
            });
        },
        /** Get an instance property */
        get: async (name, key) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "get",
                body: { name, key },
            });
        },
        /** List all instances */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        pending: {
            /** Approve a pending contact or chat */
            approve: async (name, contact, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "pending"],
                    command: "approve",
                    body: { name, contact, ...(options ?? {}) },
                });
            },
            /** List pending contacts and chats for an instance */
            list: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "pending"],
                    command: "list",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Reject and remove a pending contact or chat */
            reject: async (name, contact) => {
                return this.transport.call({
                    groupSegments: ["instances", "pending"],
                    command: "reject",
                    body: { name, contact },
                });
            }
        },
        /** Restore a soft-deleted instance */
        restore: async (name) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "restore",
                body: { name },
            });
        },
        routes: {
            /** Add a route to an instance */
            add: async (name, pattern, agent, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "add",
                    body: { name, pattern, agent, ...(options ?? {}) },
                });
            },
            /** List soft-deleted routes */
            deleted: async (name) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "deleted",
                    body: { name },
                });
            },
            /** List routes for an instance */
            list: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "list",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Remove a route (soft-delete, recoverable) */
            remove: async (name, pattern, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "remove",
                    body: { name, pattern, ...(options ?? {}) },
                });
            },
            /** Restore a soft-deleted route */
            restore: async (name, pattern, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "restore",
                    body: { name, pattern, ...(options ?? {}) },
                });
            },
            /** Set a route property */
            set: async (name, pattern, key, value, options) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "set",
                    body: { name, pattern, key, value, ...(options ?? {}) },
                });
            },
            /** Show route details */
            show: async (name, pattern) => {
                return this.transport.call({
                    groupSegments: ["instances", "routes"],
                    command: "show",
                    body: { name, pattern },
                });
            }
        },
        /** Set an instance property */
        set: async (name, key, value) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "set",
                body: { name, key, value },
            });
        },
        /** Show instance details */
        show: async (name) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "show",
                body: { name },
            });
        },
        /** Show connection status for an instance */
        status: async (name) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "status",
                body: { name },
            });
        },
        /** Explain which runtime, DB, and live instance this CLI would affect */
        target: async (name, options) => {
            return this.transport.call({
                groupSegments: ["instances"],
                command: "target",
                body: { name, ...(options ?? {}) },
            });
        }
    };
    mail = {
        accounts: {
            /** Create or update a local mail provider account */
            create: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "accounts"],
                    command: "create",
                    body: { ...(options ?? {}) },
                });
            },
            /** List local mail accounts */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "accounts"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Run one local provider sync tick for an account */
            sync: async (account, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "accounts"],
                    command: "sync",
                    body: { account, ...(options ?? {}) },
                });
            }
        },
        domains: {
            /** Register a managed Ravi Mail domain in Console */
            create: async (domain, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "domains"],
                    command: "create",
                    body: { domain, ...(options ?? {}) },
                });
            },
            /** List managed Ravi Mail domains through Console */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "domains"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            }
        },
        mailboxes: {
            /** Create or update a local mailbox projection */
            create: async (address, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "mailboxes"],
                    command: "create",
                    body: { address, ...(options ?? {}) },
                });
            },
            /** Disable a local mailbox projection */
            disable: async (mailbox) => {
                return this.transport.call({
                    groupSegments: ["mail", "mailboxes"],
                    command: "disable",
                    body: { mailbox },
                });
            },
            /** List local mailboxes */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "mailboxes"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show a local mailbox */
            show: async (mailbox) => {
                return this.transport.call({
                    groupSegments: ["mail", "mailboxes"],
                    command: "show",
                    body: { mailbox },
                });
            }
        },
        messages: {
            /** Import one normalized provider message into the local mailbox */
            import: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "messages"],
                    command: "import",
                    body: { ...(options ?? {}) },
                });
            },
            /** List local mail messages */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "messages"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Read a local mail message */
            read: async (message, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "messages"],
                    command: "read",
                    body: { message, ...(options ?? {}) },
                });
            },
            /** Search local mail messages */
            search: async (query, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "messages"],
                    command: "search",
                    body: { query, ...(options ?? {}) },
                });
            }
        },
        outbox: {
            /** Inspect a local outbox row */
            inspect: async (outbox) => {
                return this.transport.call({
                    groupSegments: ["mail", "outbox"],
                    command: "inspect",
                    body: { outbox },
                });
            },
            /** List local outbox rows */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "outbox"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Move a failed/dead local outbox row back to pending */
            retry: async (outbox) => {
                return this.transport.call({
                    groupSegments: ["mail", "outbox"],
                    command: "retry",
                    body: { outbox },
                });
            },
            /** Show local mail outbox status */
            status: async () => {
                return this.transport.call({
                    groupSegments: ["mail", "outbox"],
                    command: "status",
                    body: {},
                });
            }
        },
        providers: {
            /** List known mail providers and local account counts */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["mail", "providers"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            raviMail: {
                mailboxes: {
                    /** Create a Ravi Mail provider mailbox through Console */
                    create: async (addressOrLocalPart, options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "mailboxes"],
                            command: "create",
                            body: { addressOrLocalPart, ...(options ?? {}) },
                        });
                    },
                    /** Disable a managed Ravi Mail provider mailbox and active routes */
                    disable: async (mailbox, options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "mailboxes"],
                            command: "disable",
                            body: { mailbox, ...(options ?? {}) },
                        });
                    },
                    /** List Ravi Mail provider mailboxes through Console */
                    list: async (options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "mailboxes"],
                            command: "list",
                            body: { ...(options ?? {}) },
                        });
                    },
                    /** Show Ravi Mail provider mailbox metadata */
                    show: async (mailbox, options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "mailboxes"],
                            command: "show",
                            body: { mailbox, ...(options ?? {}) },
                        });
                    }
                },
                messages: {
                    /** List Ravi Mail provider message metadata */
                    list: async (options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "messages"],
                            command: "list",
                            body: { ...(options ?? {}) },
                        });
                    },
                    /** Read one authorized Ravi Mail provider message body through Console */
                    read: async (message, options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "messages"],
                            command: "read",
                            body: { message, ...(options ?? {}) },
                        });
                    },
                    /** Show Ravi Mail provider message metadata */
                    show: async (message, options) => {
                        return this.transport.call({
                            groupSegments: ["mail", "providers", "ravi-mail", "messages"],
                            command: "show",
                            body: { message, ...(options ?? {}) },
                        });
                    }
                },
                /** Send mail directly through Console Ravi Mail */
                send: async (options) => {
                    return this.transport.call({
                        groupSegments: ["mail", "providers", "ravi-mail"],
                        command: "send",
                        body: { ...(options ?? {}) },
                    });
                }
            }
        },
        /** Queue a local reply in the outbox */
        reply: async (message, options) => {
            return this.transport.call({
                groupSegments: ["mail"],
                command: "reply",
                body: { message, ...(options ?? {}) },
            });
        },
        /** Queue mail in the local outbox */
        send: async (options) => {
            return this.transport.call({
                groupSegments: ["mail"],
                command: "send",
                body: { ...(options ?? {}) },
            });
        },
        threads: {
            /** Read a local mail thread and its safe message timeline */
            read: async (thread, options) => {
                return this.transport.call({
                    groupSegments: ["mail", "threads"],
                    command: "read",
                    body: { thread, ...(options ?? {}) },
                });
            }
        }
    };
    media = {
        /** Send a media file (image, video, audio, document) */
        send: async (filePath, options) => {
            return this.transport.call({
                groupSegments: ["media"],
                command: "send",
                body: { filePath, ...(options ?? {}) },
            });
        }
    };
    meetings = {
        /** Finalize a completed meeting recorder run into a Ravi meeting.raw artifact */
        finalize: async (options) => {
            return this.transport.call({
                groupSegments: ["meetings"],
                command: "finalize",
                body: { ...(options ?? {}) },
            });
        },
        profiles: {
            /** Create a reusable meeting profile scaffold */
            init: async (profileId, options) => {
                return this.transport.call({
                    groupSegments: ["meetings", "profiles"],
                    command: "init",
                    body: { profileId, ...(options ?? {}) },
                });
            },
            /** List resolved meeting profiles */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["meetings", "profiles"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show one resolved meeting profile */
            show: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["meetings", "profiles"],
                    command: "show",
                    body: { profileId },
                });
            },
            /** Validate one meeting profile or the whole catalog */
            validate: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["meetings", "profiles"],
                    command: "validate",
                    body: { profileId },
                });
            }
        },
        /** List meeting voice runtime candidates and current recommendation */
        voiceRuntimes: async () => {
            return this.transport.call({
                groupSegments: ["meetings"],
                command: "voice-runtimes",
                body: {},
            });
        }
    };
    metrics = {
        /** List dates that have already been rolled up */
        dates: async () => {
            return this.transport.call({
                groupSegments: ["metrics"],
                command: "dates",
                body: {},
            });
        },
        /** Aggregate cost_events + session_events into daily_metrics for a date range */
        rollup: async (options) => {
            return this.transport.call({
                groupSegments: ["metrics"],
                command: "rollup",
                body: { ...(options ?? {}) },
            });
        },
        /** Display daily metrics rolled up to date */
        show: async (options) => {
            return this.transport.call({
                groupSegments: ["metrics"],
                command: "show",
                body: { ...(options ?? {}) },
            });
        }
    };
    observers = {
        /** List session observer bindings */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["observers"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        profiles: {
            /** Create a Markdown observer profile scaffold */
            init: async (profileId, options) => {
                return this.transport.call({
                    groupSegments: ["observers", "profiles"],
                    command: "init",
                    body: { profileId, ...(options ?? {}) },
                });
            },
            /** List observer profiles */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["observers", "profiles"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Render an observer profile preview */
            preview: async (profileId, options) => {
                return this.transport.call({
                    groupSegments: ["observers", "profiles"],
                    command: "preview",
                    body: { profileId, ...(options ?? {}) },
                });
            },
            /** Show one observer profile */
            show: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["observers", "profiles"],
                    command: "show",
                    body: { profileId },
                });
            },
            /** Validate observer profiles */
            validate: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["observers", "profiles"],
                    command: "validate",
                    body: { profileId },
                });
            }
        },
        /** Apply observer rules to an existing source session */
        refresh: async (session, options) => {
            return this.transport.call({
                groupSegments: ["observers"],
                command: "refresh",
                body: { session, ...(options ?? {}) },
            });
        },
        rules: {
            /** Disable an observer rule */
            disable: async (id) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "disable",
                    body: { id },
                });
            },
            /** Enable an observer rule */
            enable: async (id) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "enable",
                    body: { id },
                });
            },
            /** Explain observer rule matching for a source session */
            explain: async (session) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "explain",
                    body: { session },
                });
            },
            /** List observer rules */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Delete an observer rule */
            rm: async (id) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "rm",
                    body: { id },
                });
            },
            /** Create or overwrite an observer rule */
            set: async (id, observerAgentId, options) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "set",
                    body: { id, observerAgentId, ...(options ?? {}) },
                });
            },
            /** Show one observer rule */
            show: async (id) => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "show",
                    body: { id },
                });
            },
            /** Validate observer rules */
            validate: async () => {
                return this.transport.call({
                    groupSegments: ["observers", "rules"],
                    command: "validate",
                    body: {},
                });
            }
        },
        /** Show one observer binding */
        show: async (bindingId) => {
            return this.transport.call({
                groupSegments: ["observers"],
                command: "show",
                body: { bindingId },
            });
        }
    };
    pages = {
        /** Compatibility: ensure a Ravi Pages host record; does not upload HTML or assets */
        create: async (args, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "create",
                body: { args, ...(options ?? {}) },
            });
        },
        /** Bind custom hostnames to a Ravi Pages site */
        domains: async (args, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "domains",
                body: { args, ...(options ?? {}) },
            });
        },
        /** List Ravi Pages sites in a Console project */
        list: async (project, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "list",
                body: { project, ...(options ?? {}) },
            });
        },
        /** Publish a directory, file, or local artifact to a project Pages host */
        publish: async (args, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "publish",
                body: { args, ...(options ?? {}) },
            });
        },
        /** List published Ravi Pages URLs in a Console project */
        published: async (project, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "published",
                body: { project, ...(options ?? {}) },
            });
        },
        /** Update a Ravi Pages site in a Console project */
        update: async (args, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "update",
                body: { args, ...(options ?? {}) },
            });
        },
        /** Set a Ravi Pages site default visibility */
        visibility: async (args, options) => {
            return this.transport.call({
                groupSegments: ["pages"],
                command: "visibility",
                body: { args, ...(options ?? {}) },
            });
        }
    };
    permissions = {
        /** Plan or apply a provider-owned permission profile to subjects */
        allow: async (profile, options) => {
            return this.transport.call({
                groupSegments: ["permissions"],
                command: "allow",
                body: { profile, ...(options ?? {}) },
            });
        },
        /** Evaluate a provider-runtime permission request */
        check: async (options) => {
            return this.transport.call({
                groupSegments: ["permissions"],
                command: "check",
                body: { ...(options ?? {}) },
            });
        },
        /** Materialize provider-runtime capabilities for a subject */
        materialize: async (options) => {
            return this.transport.call({
                groupSegments: ["permissions"],
                command: "materialize",
                body: { ...(options ?? {}) },
            });
        },
        /** Plan or apply a provider-owned fix for a recorded permission denial */
        resolve: async (denialId, options) => {
            return this.transport.call({
                groupSegments: ["permissions"],
                command: "resolve",
                body: { denialId, ...(options ?? {}) },
            });
        },
        /** Show the active provider-runtime permission chain */
        status: async () => {
            return this.transport.call({
                groupSegments: ["permissions"],
                command: "status",
                body: {},
            });
        }
    };
    projects = {
        /** Create one project */
        create: async (title, options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "create",
                body: { title, ...(options ?? {}) },
            });
        },
        fixtures: {
            /** Reset and seed the canonical project fixtures used in demos and smoke tests */
            seed: async (options) => {
                return this.transport.call({
                    groupSegments: ["projects", "fixtures"],
                    command: "seed",
                    body: { ...(options ?? {}) },
                });
            }
        },
        /** Materialize a project with cheap links and optional canonical workflows */
        init: async (title, options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "init",
                body: { title, ...(options ?? {}) },
            });
        },
        /** Link workflow/session/agent/resource/spec context to a project */
        link: async (assetType, project, target, options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "link",
                body: { assetType, project, target, ...(options ?? {}) },
            });
        },
        /** List projects */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** List projects as an operational next-work surface */
        next: async (options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "next",
                body: { ...(options ?? {}) },
            });
        },
        resources: {
            /** Add one resource link to a project */
            add: async (project, target, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "resources"],
                    command: "add",
                    body: { project, target, ...(options ?? {}) },
                });
            },
            /** Import multiple cheap resources into a project */
            import: async (project, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "resources"],
                    command: "import",
                    body: { project, ...(options ?? {}) },
                });
            },
            /** List resource links for a project */
            list: async (project, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "resources"],
                    command: "list",
                    body: { project, ...(options ?? {}) },
                });
            },
            /** Show one resource link on a project */
            show: async (project, resource) => {
                return this.transport.call({
                    groupSegments: ["projects", "resources"],
                    command: "show",
                    body: { project, resource },
                });
            }
        },
        /** Show one project with linked context */
        show: async (project) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "show",
                body: { project },
            });
        },
        /** Show one project with workflow runtime rollup */
        status: async (project) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "status",
                body: { project },
            });
        },
        tasks: {
            /** Attach an existing task to a project workflow node */
            attach: async (project, nodeKey, taskId, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "tasks"],
                    command: "attach",
                    body: { project, nodeKey, taskId, ...(options ?? {}) },
                });
            },
            /** Create a task attempt from a project workflow node */
            create: async (project, nodeKey, title, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "tasks"],
                    command: "create",
                    body: { project, nodeKey, title, ...(options ?? {}) },
                });
            },
            /** Dispatch a task using project owner/session defaults */
            dispatch: async (project, taskId, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "tasks"],
                    command: "dispatch",
                    body: { project, taskId, ...(options ?? {}) },
                });
            }
        },
        /** Update one project */
        update: async (project, options) => {
            return this.transport.call({
                groupSegments: ["projects"],
                command: "update",
                body: { project, ...(options ?? {}) },
            });
        },
        workflows: {
            /** Attach one existing workflow run to a project in one step */
            attach: async (project, runId, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "workflows"],
                    command: "attach",
                    body: { project, runId, ...(options ?? {}) },
                });
            },
            /** Start one workflow run from a project and link it in one step */
            start: async (project, specId, options) => {
                return this.transport.call({
                    groupSegments: ["projects", "workflows"],
                    command: "start",
                    body: { project, specId, ...(options ?? {}) },
                });
            }
        }
    };
    prox = {
        calls: {
            /** Cancel a pending call request */
            cancel: async (call_request_id, options) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "cancel",
                    body: { call_request_id, ...(options ?? {}) },
                });
            },
            /** Show event timeline for a call request */
            events: async (call_request_id) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "events",
                    body: { call_request_id },
                });
            },
            profiles: {
                /** Configure a call profile's provider settings */
                configure: async (profile_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "profiles"],
                        command: "configure",
                        body: { profile_id, ...(options ?? {}) },
                    });
                },
                /** List available call profiles */
                list: async (options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "profiles"],
                        command: "list",
                        body: { ...(options ?? {}) },
                    });
                },
                /** Show a call profile by ID */
                show: async (profile_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "profiles"],
                        command: "show",
                        body: { profile_id },
                    });
                }
            },
            /** Request a call to a person */
            request: async (options) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "request",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show active call rules */
            rules: async (options) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "rules",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show details of a call request */
            show: async (call_request_id) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "show",
                    body: { call_request_id },
                });
            },
            tools: {
                /** Bind a tool to a profile */
                bind: async (profile_id, tool_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "bind",
                        body: { profile_id, tool_id, ...(options ?? {}) },
                    });
                },
                /** Configure a call tool */
                configure: async (tool_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "configure",
                        body: { tool_id, ...(options ?? {}) },
                    });
                },
                /** Create a new call tool */
                create: async (tool_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "create",
                        body: { tool_id, ...(options ?? {}) },
                    });
                },
                /** List call tools */
                list: async (options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "list",
                        body: { ...(options ?? {}) },
                    });
                },
                /** Execute a tool (dry-run validates without side effects) */
                run: async (tool_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "run",
                        body: { tool_id, ...(options ?? {}) },
                    });
                },
                /** List tool runs for a call request */
                runs: async (call_request_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "runs",
                        body: { call_request_id },
                    });
                },
                /** Show a call tool by ID */
                show: async (tool_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "show",
                        body: { tool_id },
                    });
                },
                /** Unbind a tool from a profile */
                unbind: async (profile_id, tool_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "tools"],
                        command: "unbind",
                        body: { profile_id, tool_id },
                    });
                }
            },
            /** Show call transcript, syncing provider state when needed */
            transcript: async (call_request_id, options) => {
                return this.transport.call({
                    groupSegments: ["prox", "calls"],
                    command: "transcript",
                    body: { call_request_id, ...(options ?? {}) },
                });
            },
            voiceAgents: {
                /** Bind a tool to a voice agent */
                bindTool: async (voice_agent_id, tool_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "bind-tool",
                        body: { voice_agent_id, tool_id, ...(options ?? {}) },
                    });
                },
                /** Configure a voice agent */
                configure: async (voice_agent_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "configure",
                        body: { voice_agent_id, ...(options ?? {}) },
                    });
                },
                /** Create a new voice agent */
                create: async (voice_agent_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "create",
                        body: { voice_agent_id, ...(options ?? {}) },
                    });
                },
                /** List voice agents */
                list: async (options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "list",
                        body: { ...(options ?? {}) },
                    });
                },
                /** Show a voice agent by ID */
                show: async (voice_agent_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "show",
                        body: { voice_agent_id },
                    });
                },
                /** Sync voice agent to provider (dry-run by default) */
                sync: async (voice_agent_id, options) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "sync",
                        body: { voice_agent_id, ...(options ?? {}) },
                    });
                },
                /** Unbind a tool from a voice agent */
                unbindTool: async (voice_agent_id, tool_id) => {
                    return this.transport.call({
                        groupSegments: ["prox", "calls", "voice-agents"],
                        command: "unbind-tool",
                        body: { voice_agent_id, tool_id },
                    });
                }
            }
        }
    };
    react = {
        /** Send an emoji reaction to a message */
        send: async (messageId, emoji) => {
            return this.transport.call({
                groupSegments: ["react"],
                command: "send",
                body: { messageId, emoji },
            });
        }
    };
    routes = {
        /** Explain how a pattern resolves in config and the live router */
        explain: async (name, pattern, options) => {
            return this.transport.call({
                groupSegments: ["routes"],
                command: "explain",
                body: { name, pattern, ...(options ?? {}) },
            });
        },
        /** List routes across all instances or for one instance */
        list: async (name, options) => {
            return this.transport.call({
                groupSegments: ["routes"],
                command: "list",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Show route details */
        show: async (name, pattern) => {
            return this.transport.call({
                groupSegments: ["routes"],
                command: "show",
                body: { name, pattern },
            });
        }
    };
    rules = {
        /** Import provider rules into .ravi/rules/imported */
        import: async (source, options) => {
            return this.transport.call({
                groupSegments: ["rules"],
                command: "import",
                body: { source, ...(options ?? {}) },
            });
        },
        /** List importable provider rule sources */
        sources: async (source, options) => {
            return this.transport.call({
                groupSegments: ["rules"],
                command: "sources",
                body: { source, ...(options ?? {}) },
            });
        }
    };
    runtime = {
        credentials: {
            /** Add a managed runtime provider credential */
            add: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "add",
                    body: { ...(options ?? {}) },
                });
            },
            /** Classify a provider failure for credential fallback */
            classify: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "classify",
                    body: { ...(options ?? {}) },
                });
            },
            /** Disable a runtime credential immediately */
            disable: async (id) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "disable",
                    body: { id },
                });
            },
            /** Enable a runtime credential */
            enable: async (id) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "enable",
                    body: { id },
                });
            },
            /** Import/reference an existing provider-native credential source */
            import: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "import",
                    body: { ...(options ?? {}) },
                });
            },
            /** List runtime provider credentials */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Refresh or recover credential health before pool selection */
            refresh: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "refresh",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Clear cooldown/error state for a credential */
            resetHealth: async (id) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "reset-health",
                    body: { id },
                });
            },
            /** Preview which credential the pool would select */
            select: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "select",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show credential health and provider health */
            status: async (id) => {
                return this.transport.call({
                    groupSegments: ["runtime", "credentials"],
                    command: "status",
                    body: { id },
                });
            }
        },
        presets: {
            /** Create a runtime model preset */
            create: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "create",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Delete an unreferenced runtime model preset */
            delete: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "delete",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Disable an unreferenced runtime model preset */
            disable: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "disable",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Enable a runtime model preset */
            enable: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "enable",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Show agents/sessions affected by a preset */
            impact: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "impact",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** List runtime model presets */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Update a runtime model preset field (model) */
            set: async (id, field, value, options) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "set",
                    body: { id, field, value, ...(options ?? {}) },
                });
            },
            /** Show a runtime model preset */
            show: async (id) => {
                return this.transport.call({
                    groupSegments: ["runtime", "presets"],
                    command: "show",
                    body: { id },
                });
            }
        }
    };
    sdk = {
        client: {
            /** Compare on-disk @ravi-os/sdk sources to a fresh emit; exit 1 on drift */
            check: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "client"],
                    command: "check",
                    body: { ...(options ?? {}) },
                });
            },
            /** Generate the four @ravi-os/sdk source files from the live registry */
            generate: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "client"],
                    command: "generate",
                    body: { ...(options ?? {}) },
                });
            }
        },
        openapi: {
            /** Diff a stored OpenAPI spec against the live registry */
            check: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "openapi"],
                    command: "check",
                    body: { ...(options ?? {}) },
                });
            },
            /** Emit OpenAPI 3.1 spec from the CLI registry */
            emit: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "openapi"],
                    command: "emit",
                    body: { ...(options ?? {}) },
                });
            }
        },
        swift: {
            /** Compare on-disk Ravi Swift SDK sources to a fresh emit; exit 1 on drift */
            check: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "swift"],
                    command: "check",
                    body: { ...(options ?? {}) },
                });
            },
            /** Generate the Ravi Swift SDK source files from the live registry */
            generate: async (options) => {
                return this.transport.call({
                    groupSegments: ["sdk", "swift"],
                    command: "generate",
                    body: { ...(options ?? {}) },
                });
            }
        }
    };
    self = {
        /** Show the current chat binding and participants */
        chat: async (options) => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "chat",
                body: { ...(options ?? {}) },
            });
        },
        /** Show the full current self-context packet */
        context: async (options) => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "context",
                body: { ...(options ?? {}) },
            });
        },
        /** Explain how Ravi resolved the current self-context */
        explain: async () => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "explain",
                body: {},
            });
        },
        /** Show current knowledge integration status for this context */
        knowledge: async () => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "knowledge",
                body: {},
            });
        },
        /** Show capabilities inherited by the current context */
        permissions: async () => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "permissions",
                body: {},
            });
        },
        /** Show bounded recent message metadata for the current chat */
        recent: async (options) => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "recent",
                body: { ...(options ?? {}) },
            });
        },
        /** Show route information that led to the current session */
        route: async () => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "route",
                body: {},
            });
        },
        /** Show the current agent/session identity */
        whoami: async () => {
            return this.transport.call({
                groupSegments: ["self"],
                command: "whoami",
                body: {},
            });
        }
    };
    sessions = {
        /** Show available chat actions and recent own messages for a session */
        actions: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "actions",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Answer a question from another session (fire-and-forget) */
        answer: async (target, message, sender, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "answer",
                body: { target, message, sender, ...(options ?? {}) },
            });
        },
        /** Ask a question to another session (fire-and-forget) */
        ask: async (target, message, sender, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "ask",
                body: { target, message, sender, ...(options ?? {}) },
            });
        },
        /** Attach a chat as the session output target and input source */
        attach: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "attach",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Delete a session permanently */
        delete: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "delete",
                body: { nameOrKey },
            });
        },
        /** Delete one of this session agent's own channel messages */
        deleteMessage: async (sessionOrMessage, messageRef) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "delete-message",
                body: { sessionOrMessage, messageRef },
            });
        },
        /** Detach a chat/output target from a session */
        detach: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "detach",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Edit one of this session agent's own text channel messages */
        editMessage: async (sessionOrMessage, messageOrText, textArg, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "edit-message",
                body: { sessionOrMessage, messageOrText, textArg, ...(options ?? {}) },
            });
        },
        /** Send an execute command to another session (fire-and-forget) */
        execute: async (target, message, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "execute",
                body: { target, message, ...(options ?? {}) },
            });
        },
        /** Extend an ephemeral session's TTL */
        extend: async (nameOrKey, duration) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "extend",
                body: { nameOrKey, duration },
            });
        },
        followups: {
            /** Create a session followup cadence */
            add: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "add",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Inspect one session followup cadence and recent runs */
            inspect: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "inspect",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** List session followup cadences */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Pause a followup cadence */
            pause: async (id) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "pause",
                    body: { id },
                });
            },
            /** Resume a followup cadence and recalculate next run */
            resume: async (id) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "resume",
                    body: { id },
                });
            },
            /** Retry failed/dead followup runs */
            retry: async (run, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "retry",
                    body: { run, ...(options ?? {}) },
                });
            },
            /** Run a followup cadence now without consuming its next scheduled time */
            run: async (id) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "run",
                    body: { id },
                });
            },
            /** List session followup runs */
            runs: async (options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "runs",
                    body: { ...(options ?? {}) },
                });
            },
            /** Snooze a followup cadence until a timestamp */
            snooze: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "snooze",
                    body: { id, ...(options ?? {}) },
                });
            },
            /** Update a session followup cadence without recreating it */
            update: async (id, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "followups"],
                    command: "update",
                    body: { id, ...(options ?? {}) },
                });
            }
        },
        /** Inspect or mutate persisted session goal state */
        goal: async (action, nameOrKey, objective, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "goal",
                body: { action, nameOrKey, objective, ...(options ?? {}) },
            });
        },
        /** Show unified session inspection details */
        info: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "info",
                body: { nameOrKey },
            });
        },
        /** Send an informational message to another session (fire-and-forget) */
        inform: async (target, message, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "inform",
                body: { target, message, ...(options ?? {}) },
            });
        },
        /** Make an ephemeral session permanent */
        keep: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "keep",
                body: { nameOrKey },
            });
        },
        /** List all sessions */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Keep a subscribed chat as listen-only for a session */
        mute: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "mute",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Prune sessions inactive for a duration (dry-run by default) */
        prune: async (options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "prune",
                body: { ...(options ?? {}) },
            });
        },
        /** Read message history of a session (normalized) */
        read: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "read",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Rename canonical session name */
        rename: async (nameOrKey, newName) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "rename",
                body: { nameOrKey, newName },
            });
        },
        /** Reset a session (fresh start) */
        reset: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "reset",
                body: { nameOrKey },
            });
        },
        runtime: {
            /** Queue a follow-up after the active runtime turn */
            followUp: async (session, text, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "follow-up",
                    body: { session, text, ...(options ?? {}) },
                });
            },
            /** Fork a runtime thread if the provider supports it */
            fork: async (session, threadId, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "fork",
                    body: { session, threadId, ...(options ?? {}) },
                });
            },
            /** Interrupt the active runtime turn */
            interrupt: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "interrupt",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** List runtime threads through an active session */
            list: async (session, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "list",
                    body: { session, ...(options ?? {}) },
                });
            },
            /** Read a runtime thread through an active session */
            read: async (session, threadId, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "read",
                    body: { session, threadId, ...(options ?? {}) },
                });
            },
            /** Rollback completed runtime turns */
            rollback: async (session, turns, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "rollback",
                    body: { session, turns, ...(options ?? {}) },
                });
            },
            /** Steer the active runtime turn */
            steer: async (session, text, options) => {
                return this.transport.call({
                    groupSegments: ["sessions", "runtime"],
                    command: "steer",
                    body: { session, text, ...(options ?? {}) },
                });
            }
        },
        /** Send a prompt to a session (fire-and-forget). Use -w to wait for response, -i for interactive. */
        send: async (nameOrKey, prompt, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "send",
                body: { nameOrKey, prompt, ...(options ?? {}) },
            });
        },
        /** Set session display label */
        setDisplay: async (nameOrKey, displayName) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-display",
                body: { nameOrKey, displayName },
            });
        },
        /** Set session reasoning effort override */
        setEffort: async (nameOrKey, level) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-effort",
                body: { nameOrKey, level },
            });
        },
        /** Set session model override */
        setModel: async (nameOrKey, model) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-model",
                body: { nameOrKey, model },
            });
        },
        /** Set session runtime provider override */
        setProvider: async (nameOrKey, provider) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-provider",
                body: { nameOrKey, provider },
            });
        },
        /** Set session thinking level */
        setThinking: async (nameOrKey, level) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-thinking",
                body: { nameOrKey, level },
            });
        },
        /** Make a session ephemeral with a TTL */
        setTtl: async (nameOrKey, duration) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "set-ttl",
                body: { nameOrKey, duration },
            });
        },
        /** List chats attached to a session */
        subscriptions: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "subscriptions",
                body: { nameOrKey },
            });
        },
        /** Read the SQLite session trace timeline */
        trace: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "trace",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Allow a subscribed chat to receive session responses */
        unmute: async (nameOrKey, options) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "unmute",
                body: { nameOrKey, ...(options ?? {}) },
            });
        },
        /** Show runtime session visibility state */
        visibility: async (nameOrKey) => {
            return this.transport.call({
                groupSegments: ["sessions"],
                command: "visibility",
                body: { nameOrKey },
            });
        }
    };
    settings = {
        /** Delete a setting */
        delete: async (key) => {
            return this.transport.call({
                groupSegments: ["settings"],
                command: "delete",
                body: { key },
            });
        },
        /** Get a setting value */
        get: async (key) => {
            return this.transport.call({
                groupSegments: ["settings"],
                command: "get",
                body: { key },
            });
        },
        /** List live settings (legacy account.* hidden by default) */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["settings"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Set a setting value */
        set: async (key, value) => {
            return this.transport.call({
                groupSegments: ["settings"],
                command: "set",
                body: { key, value },
            });
        }
    };
    skillGates = {
        /** Disable a skill gate rule */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable a configured skill gate rule */
        enable: async (id) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "enable",
                body: { id },
            });
        },
        /** List skill gate rules */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Delete a configured override and restore the default behavior */
        reset: async (id) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "reset",
                body: { id },
            });
        },
        /** Remove a custom gate or disable a default gate */
        rm: async (id) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "rm",
                body: { id },
            });
        },
        /** Create or overwrite a skill gate rule */
        set: async (id, skill, options) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "set",
                body: { id, skill, ...(options ?? {}) },
            });
        },
        /** Show one skill gate rule */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["skill-gates"],
                command: "show",
                body: { id },
            });
        }
    };
    skills = {
        /** Grant a custom skill to an agent (per-agent visibility). System skills follow permissions. */
        grant: async (agent, skill, options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "grant",
                body: { agent, skill, ...(options ?? {}) },
            });
        },
        /** Grant skills to agents in bulk. Reuses the per-agent grant mechanism across many (agent, skill) pairs in one call. Idempotent (upsert). Use --dry-run to preview. */
        grantBatch: async (options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "grant-batch",
                body: { ...(options ?? {}) },
            });
        },
        /** Show the resolved per-agent skill allowlist (baseline ∪ permission-derived ∪ grants) */
        inspect: async (agent) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "inspect",
                body: { agent },
            });
        },
        /** Install Ravi catalog skills or skills from an explicit source */
        install: async (name, options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "install",
                body: { name, ...(options ?? {}) },
            });
        },
        /** List Ravi catalog skills, installed skills or source skills */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Revoke a skill grant from an agent */
        revoke: async (agent, skill) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "revoke",
                body: { agent, skill },
            });
        },
        /** Revoke skill grants from agents in bulk — the retirement counterpart of grant-batch. Same axes (--agent/--all-agents × --skill/--all-skills). Use --dry-run to preview. */
        revokeBatch: async (options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "revoke-batch",
                body: { ...(options ?? {}) },
            });
        },
        /** Show a Ravi catalog skill, installed skill or source skill */
        show: async (name, options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "show",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Sync Ravi plugin skills into the Codex skills directory */
        sync: async () => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "sync",
                body: {},
            });
        },
        /** List agents currently granted a skill (or list all grants for an agent with --agent) */
        who: async (skill, options) => {
            return this.transport.call({
                groupSegments: ["skills"],
                command: "who",
                body: { skill, ...(options ?? {}) },
            });
        }
    };
    slack = {
        /** Send a Slack Block Kit message; dry-run unless --execute is set */
        blocksSend: async (channel, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "blocks-send",
                body: { channel, file, ...(options ?? {}) },
            });
        },
        /** Send a Slack Block Kit showcase; dry-run unless --execute is set */
        blocksShowcase: async (channel, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "blocks-showcase",
                body: { channel, ...(options ?? {}) },
            });
        },
        /** Update a Slack message with Block Kit; dry-run unless --execute is set */
        blocksUpdate: async (channel, ts, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "blocks-update",
                body: { channel, ts, file, ...(options ?? {}) },
            });
        },
        /** Validate Slack Block Kit JSON with Slack blocks.validate */
        blocksValidate: async (file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "blocks-validate",
                body: { file, ...(options ?? {}) },
            });
        },
        /** Delete Slack standalone canvas access; dry-run unless --execute is set */
        canvasAccessDelete: async (canvas, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-access-delete",
                body: { canvas, ...(options ?? {}) },
            });
        },
        /** Set Slack standalone canvas access; dry-run unless --execute is set */
        canvasAccessSet: async (canvas, access, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-access-set",
                body: { canvas, access, ...(options ?? {}) },
            });
        },
        /** Compatibility helper for publishing Markdown to Slack Canvas; prefer native canvas-create/channel-create/edit --artifact */
        canvasArtifactPublish: async (artifactOrFile, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-artifact-publish",
                body: { artifactOrFile, ...(options ?? {}) },
            });
        },
        /** Show local Slack Canvas publish status for a Ravi artifact */
        canvasArtifactStatus: async (artifact) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-artifact-status",
                body: { artifact },
            });
        },
        /** Create a Slack channel canvas; dry-run unless --execute is set */
        canvasChannelCreate: async (channel, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-channel-create",
                body: { channel, ...(options ?? {}) },
            });
        },
        /** Create or reuse a channel canvas and publish the Ravi showcase; dry-run unless --execute is set */
        canvasChannelShowcase: async (channel, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-channel-showcase",
                body: { channel, ...(options ?? {}) },
            });
        },
        /** Create a Slack standalone canvas; dry-run unless --execute is set */
        canvasCreate: async (options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-create",
                body: { ...(options ?? {}) },
            });
        },
        /** Delete a Slack standalone canvas; dry-run unless --execute is set */
        canvasDelete: async (canvas, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-delete",
                body: { canvas, ...(options ?? {}) },
            });
        },
        /** Edit a Slack canvas section or title; dry-run unless --execute is set */
        canvasEdit: async (canvas, operation, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-edit",
                body: { canvas, operation, ...(options ?? {}) },
            });
        },
        /** Lookup Slack canvas section IDs */
        canvasSectionsLookup: async (canvas, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-sections-lookup",
                body: { canvas, ...(options ?? {}) },
            });
        },
        /** Publish the Ravi Slack Canvas showcase into an existing canvas; dry-run unless --execute is set */
        canvasShowcase: async (canvas, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "canvas-showcase",
                body: { canvas, ...(options ?? {}) },
            });
        },
        /** Create a Slack channel; dry-run unless --execute is set */
        channelsCreate: async (name, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-create",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Read Slack conversation history */
        channelsHistory: async (channel, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-history",
                body: { channel, ...(options ?? {}) },
            });
        },
        /** Show Slack conversation metadata */
        channelsInfo: async (channel) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-info",
                body: { channel },
            });
        },
        /** Invite Slack users to a channel; dry-run unless --execute is set */
        channelsInvite: async (channel, users, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-invite",
                body: { channel, users, ...(options ?? {}) },
            });
        },
        /** List Slack conversations visible to the configured bot */
        channelsList: async (options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-list",
                body: { ...(options ?? {}) },
            });
        },
        /** Rename a Slack channel; dry-run unless --execute is set */
        channelsRename: async (channel, name, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "channels-rename",
                body: { channel, name, ...(options ?? {}) },
            });
        },
        /** List Slack files visible to the configured bot */
        filesList: async (options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "files-list",
                body: { ...(options ?? {}) },
            });
        },
        /** Respond to a Slack interaction response handle; dry-run unless --execute is set */
        interactionsRespond: async (responseUrlId, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "interactions-respond",
                body: { responseUrlId, file, ...(options ?? {}) },
            });
        },
        /** List Slack conversation members */
        membersList: async (channel, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "members-list",
                body: { channel, ...(options ?? {}) },
            });
        },
        /** Inspect whether a Slack message exists in Slack and Ravi */
        messagesInspect: async (channel, ts) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "messages-inspect",
                body: { channel, ts },
            });
        },
        /** Replay a Slack message through the native Ravi channel pipeline */
        messagesReplay: async (channel, ts, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "messages-replay",
                body: { channel, ts, ...(options ?? {}) },
            });
        },
        /** Send a Slack message; dry-run unless --execute is set */
        messagesSend: async (channel, text, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "messages-send",
                body: { channel, text, ...(options ?? {}) },
            });
        },
        /** Open a Slack modal from an interaction trigger_id; dry-run unless --execute is set */
        modalsOpen: async (triggerId, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "modals-open",
                body: { triggerId, file, ...(options ?? {}) },
            });
        },
        /** Push a Slack modal view onto an existing modal stack; dry-run unless --execute is set */
        modalsPush: async (triggerId, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "modals-push",
                body: { triggerId, file, ...(options ?? {}) },
            });
        },
        /** Update a Slack modal view; dry-run unless --execute is set */
        modalsUpdate: async (view, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "modals-update",
                body: { view, file, ...(options ?? {}) },
            });
        },
        /** List OAuth scopes granted to the configured Slack bot token */
        permissionsList: async (options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "permissions-list",
                body: { ...(options ?? {}) },
            });
        },
        /** Show Slack channels and Ravi route/session ownership */
        topology: async (options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "topology",
                body: { ...(options ?? {}) },
            });
        },
        /** Present Slack native Work Object flexpane details; dry-run unless --execute is set */
        workObjectsPresentDetails: async (triggerId, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "work-objects-present-details",
                body: { triggerId, file, ...(options ?? {}) },
            });
        },
        /** Send Slack native Work Object metadata with chat.postMessage; dry-run unless --execute is set */
        workObjectsSend: async (channel, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "work-objects-send",
                body: { channel, file, ...(options ?? {}) },
            });
        },
        /** Attach Slack native Work Object metadata with chat.unfurl; dry-run unless --execute is set */
        workObjectsUnfurl: async (channel, ts, url, file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "work-objects-unfurl",
                body: { channel, ts, url, file, ...(options ?? {}) },
            });
        },
        /** Validate Slack native Work Object metadata JSON */
        workObjectsValidate: async (file, options) => {
            return this.transport.call({
                groupSegments: ["slack"],
                command: "work-objects-validate",
                body: { file, ...(options ?? {}) },
            });
        }
    };
    specs = {
        /** Get inherited spec context */
        get: async (id, options) => {
            return this.transport.call({
                groupSegments: ["specs"],
                command: "get",
                body: { id, ...(options ?? {}) },
            });
        },
        /** List specs from .ravi/specs */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["specs"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Create a new spec under .ravi/specs */
        new: async (id, options) => {
            return this.transport.call({
                groupSegments: ["specs"],
                command: "new",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Rebuild the specs SQLite index from Markdown */
        sync: async () => {
            return this.transport.call({
                groupSegments: ["specs"],
                command: "sync",
                body: {},
            });
        }
    };
    stickers = {
        /** Add or update a sticker catalog entry */
        add: async (id, mediaPath, options) => {
            return this.transport.call({
                groupSegments: ["stickers"],
                command: "add",
                body: { id, mediaPath, ...(options ?? {}) },
            });
        },
        /** List stickers in the typed catalog */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["stickers"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Remove a sticker catalog entry */
        remove: async (id) => {
            return this.transport.call({
                groupSegments: ["stickers"],
                command: "remove",
                body: { id },
            });
        },
        /** Send a sticker to the current WhatsApp chat */
        send: async (id, options) => {
            return this.transport.call({
                groupSegments: ["stickers"],
                command: "send",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Show one sticker catalog entry */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["stickers"],
                command: "show",
                body: { id },
            });
        }
    };
    sync = {
        /** Inspect a sync outbox/inbox row by id */
        inspect: async (id) => {
            return this.transport.call({
                groupSegments: ["sync"],
                command: "inspect",
                body: { id },
            });
        },
        /** Download a bounded remote event batch from Console */
        pull: async (options) => {
            return this.transport.call({
                groupSegments: ["sync"],
                command: "pull",
                body: { ...(options ?? {}) },
            });
        },
        /** Upload a bounded outbox batch to Console */
        push: async (options) => {
            return this.transport.call({
                groupSegments: ["sync"],
                command: "push",
                body: { ...(options ?? {}) },
            });
        },
        /** Move failed sync outbox rows back to pending */
        retry: async (options) => {
            return this.transport.call({
                groupSegments: ["sync"],
                command: "retry",
                body: { ...(options ?? {}) },
            });
        },
        /** Show local sync status */
        status: async () => {
            return this.transport.call({
                groupSegments: ["sync"],
                command: "status",
                body: {},
            });
        }
    };
    tagRules = {
        /** Evaluate a rule against a target asset */
        evaluate: async (ruleId, options) => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "evaluate",
                body: { ruleId, ...(options ?? {}) },
            });
        },
        /** Explain which rules currently match a target asset (dry-run) */
        explain: async (options) => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "explain",
                body: { ...(options ?? {}) },
            });
        },
        /** List loaded tag rules from .ravi/tag-rules */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Show a single rule definition */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "show",
                body: { id },
            });
        },
        /** Run all rules against all contacts (use for cron/periodic schedules) */
        tick: async (options) => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "tick",
                body: { ...(options ?? {}) },
            });
        },
        /** Validate all rule files without applying */
        validate: async () => {
            return this.transport.call({
                groupSegments: ["tag-rules"],
                command: "validate",
                body: {},
            });
        }
    };
    tags = {
        /** Attach a tag to a Ravi asset */
        attach: async (slug, options) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "attach",
                body: { slug, ...(options ?? {}) },
            });
        },
        /** Create a new tag definition */
        create: async (slug, options) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "create",
                body: { slug, ...(options ?? {}) },
            });
        },
        /** Detach a tag from a Ravi asset */
        detach: async (slug, options) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "detach",
                body: { slug, ...(options ?? {}) },
            });
        },
        /** List tag definitions */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Search bindings by tag or asset */
        search: async (options) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "search",
                body: { ...(options ?? {}) },
            });
        },
        /** Set tag definition metadata */
        set: async (slug, key, value) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "set",
                body: { slug, key, value },
            });
        },
        /** Show one tag and its bindings */
        show: async (slug) => {
            return this.transport.call({
                groupSegments: ["tags"],
                command: "show",
                body: { slug },
            });
        }
    };
    tasks = {
        /** Archive a task without changing its execution status */
        archive: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "archive",
                body: { taskId, ...(options ?? {}) },
            });
        },
        automations: {
            /** Create a new task automation */
            add: async (name, options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "add",
                    body: { name, ...(options ?? {}) },
                });
            },
            /** Disable a task automation */
            disable: async (id) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "disable",
                    body: { id },
                });
            },
            /** Enable a task automation */
            enable: async (id) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "enable",
                    body: { id },
                });
            },
            /** List configured task automations */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Delete a task automation */
            rm: async (id) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "rm",
                    body: { id },
                });
            },
            /** Show one task automation and its recent runs */
            show: async (id) => {
                return this.transport.call({
                    groupSegments: ["tasks", "automations"],
                    command: "show",
                    body: { id },
                });
            }
        },
        /** Mark a task as blocked */
        block: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "block",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** Add a comment to a task and steer the assignee if it is active */
        comment: async (taskId, body) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "comment",
                body: { taskId, body },
            });
        },
        /** Create a tracked task; unresolved dependencies arm launch plans instead of dispatching early */
        create: async (title, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "create",
                body: { title, ...(options ?? {}) },
            });
        },
        deps: {
            /** Add one gating dependency to a task */
            add: async (taskId, dependencyTaskId) => {
                return this.transport.call({
                    groupSegments: ["tasks", "deps"],
                    command: "add",
                    body: { taskId, dependencyTaskId },
                });
            },
            /** List gating dependencies and dependents for a task */
            ls: async (taskId, options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "deps"],
                    command: "ls",
                    body: { taskId, ...(options ?? {}) },
                });
            },
            /** Remove one gating dependency from a task */
            rm: async (taskId, dependencyTaskId) => {
                return this.transport.call({
                    groupSegments: ["tasks", "deps"],
                    command: "rm",
                    body: { taskId, dependencyTaskId },
                });
            }
        },
        /** Dispatch a task now, or arm a launch plan if dependencies still gate start */
        dispatch: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "dispatch",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** Mark a task as done */
        done: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "done",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** Mark a task as failed */
        fail: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "fail",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** List tasks */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        profiles: {
            /** Create a profile scaffold in the workspace or user catalog */
            init: async (profileId, options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "profiles"],
                    command: "init",
                    body: { profileId, ...(options ?? {}) },
                });
            },
            /** List resolved task profiles from all catalog sources */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "profiles"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Render a profile preview with the resolved template context */
            preview: async (profileId, options) => {
                return this.transport.call({
                    groupSegments: ["tasks", "profiles"],
                    command: "preview",
                    body: { profileId, ...(options ?? {}) },
                });
            },
            /** Show the resolved manifest for one task profile */
            show: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["tasks", "profiles"],
                    command: "show",
                    body: { profileId },
                });
            },
            /** Validate one profile or the whole resolved catalog */
            validate: async (profileId) => {
                return this.transport.call({
                    groupSegments: ["tasks", "profiles"],
                    command: "validate",
                    body: { profileId },
                });
            }
        },
        /** Report task progress from a CLI or agent session */
        report: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "report",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** Show task details and history */
        show: async (taskId, options) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "show",
                body: { taskId, ...(options ?? {}) },
            });
        },
        /** Restore an archived task to the default list */
        unarchive: async (taskId) => {
            return this.transport.call({
                groupSegments: ["tasks"],
                command: "unarchive",
                body: { taskId },
            });
        }
    };
    threads = {
        /** Render the bounded thread brief used for handoff */
        brief: async (thread, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "brief",
                body: { thread, ...(options ?? {}) },
            });
        },
        /** Close a thread */
        close: async (thread, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "close",
                body: { thread, ...(options ?? {}) },
            });
        },
        /** Append a comment to a thread */
        comment: async (thread, body, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "comment",
                body: { thread, body, ...(options ?? {}) },
            });
        },
        /** Create a Ravi-owned thread */
        create: async (slug, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "create",
                body: { slug, ...(options ?? {}) },
            });
        },
        /** List thread entries */
        entries: async (thread, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "entries",
                body: { thread, ...(options ?? {}) },
            });
        },
        /** Link a thread to another Ravi object */
        link: async (thread, target, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "link",
                body: { thread, target, ...(options ?? {}) },
            });
        },
        /** List Ravi threads */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Append a note to a thread */
        note: async (thread, body, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "note",
                body: { thread, body, ...(options ?? {}) },
            });
        },
        /** Show one thread with links and recent entries */
        show: async (thread, options) => {
            return this.transport.call({
                groupSegments: ["threads"],
                command: "show",
                body: { thread, ...(options ?? {}) },
            });
        }
    };
    tools = {
        /** Execute a tool handler (real execution with full authorization) */
        invoke: async (name, args) => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "invoke",
                body: { name, args },
            });
        },
        /** List all available CLI tools */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Export tools as JSON manifest */
        manifest: async () => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "manifest",
                body: {},
            });
        },
        /** Export tools as JSON Schema */
        schema: async () => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "schema",
                body: {},
            });
        },
        /** Search tools by intent, name, description, or metadata */
        search: async (query, options) => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "search",
                body: { query, ...(options ?? {}) },
            });
        },
        /** Show details for a specific tool */
        show: async (name) => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "show",
                body: { name },
            });
        },
        /** Dry-run plan for a tool (does not execute the handler) */
        test: async (name, args) => {
            return this.transport.call({
                groupSegments: ["tools"],
                command: "test",
                body: { name, args },
            });
        }
    };
    transcribe = {
        /** Transcribe a local audio file */
        file: async (path, options) => {
            return this.transport.call({
                groupSegments: ["transcribe"],
                command: "file",
                body: { path, ...(options ?? {}) },
            });
        }
    };
    triggers = {
        /** Add a new event trigger */
        add: async (name, options) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "add",
                body: { name, ...(options ?? {}) },
            });
        },
        /** Disable a trigger */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable a trigger */
        enable: async (id) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "enable",
                body: { id },
            });
        },
        /** List all event triggers */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Delete a trigger */
        rm: async (id) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "rm",
                body: { id },
            });
        },
        /** Set trigger property */
        set: async (id, key, value) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "set",
                body: { id, key, value },
            });
        },
        /** Show trigger details */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "show",
                body: { id },
            });
        },
        /** Test trigger with fake event data */
        test: async (id) => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "test",
                body: { id },
            });
        },
        /** List trigger-ready NATS topics */
        topics: async () => {
            return this.transport.call({
                groupSegments: ["triggers"],
                command: "topics",
                body: {},
            });
        }
    };
    video = {
        /** Analyze a video (YouTube URL or local file) and save to markdown */
        analyze: async (url, options) => {
            return this.transport.call({
                groupSegments: ["video"],
                command: "analyze",
                body: { url, ...(options ?? {}) },
            });
        }
    };
    watch = {
        /** List available watch connectors and event types */
        connectors: async (options) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "connectors",
                body: { ...(options ?? {}) },
            });
        },
        /** Create a watch */
        create: async (provider, resource, options) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "create",
                body: { provider, resource, ...(options ?? {}) },
            });
        },
        /** Disable a watch */
        disable: async (id) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "disable",
                body: { id },
            });
        },
        /** Enable a watch */
        enable: async (id) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "enable",
                body: { id },
            });
        },
        /** Show trigger-ready event subjects for a watch */
        events: async (id) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "events",
                body: { id },
            });
        },
        /** List watches */
        list: async (options) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "list",
                body: { ...(options ?? {}) },
            });
        },
        /** Remove a watch */
        rm: async (id) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "rm",
                body: { id },
            });
        },
        /** Show watch details */
        show: async (id) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "show",
                body: { id },
            });
        },
        /** Create a trigger for a watch event in the current chat */
        trigger: async (id, options) => {
            return this.transport.call({
                groupSegments: ["watch"],
                command: "trigger",
                body: { id, ...(options ?? {}) },
            });
        }
    };
    whatsapp = {
        dm: {
            /** Send read receipt (blue ticks) for a specific message */
            ack: async (contact, messageId, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "dm"],
                    command: "ack",
                    body: { contact, messageId, ...(options ?? {}) },
                });
            },
            /** Read recent messages from a DM chat */
            read: async (contact, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "dm"],
                    command: "read",
                    body: { contact, ...(options ?? {}) },
                });
            },
            /** Send a direct message to a contact */
            send: async (contact, message, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "dm"],
                    command: "send",
                    body: { contact, message, ...(options ?? {}) },
                });
            }
        },
        group: {
            /** Add participants to a group */
            add: async (groupId, participants, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "add",
                    body: { groupId, participants, ...(options ?? {}) },
                });
            },
            /** Create a new group */
            create: async (name, participants, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "create",
                    body: { name, participants, ...(options ?? {}) },
                });
            },
            /** Demote participants from admin */
            demote: async (groupId, participants, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "demote",
                    body: { groupId, participants, ...(options ?? {}) },
                });
            },
            /** Update group description */
            description: async (groupId, text, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "description",
                    body: { groupId, text, ...(options ?? {}) },
                });
            },
            /** Show group metadata */
            info: async (groupId, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "info",
                    body: { groupId, ...(options ?? {}) },
                });
            },
            /** Get group invite link */
            invite: async (groupId, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "invite",
                    body: { groupId, ...(options ?? {}) },
                });
            },
            /** Join a group via invite link/code */
            join: async (code, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "join",
                    body: { code, ...(options ?? {}) },
                });
            },
            /** Leave a group */
            leave: async (groupId, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "leave",
                    body: { groupId, ...(options ?? {}) },
                });
            },
            /** List all groups the bot participates in */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Promote participants to admin */
            promote: async (groupId, participants, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "promote",
                    body: { groupId, participants, ...(options ?? {}) },
                });
            },
            /** Remove participants from a group */
            remove: async (groupId, participants, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "remove",
                    body: { groupId, participants, ...(options ?? {}) },
                });
            },
            /** Rename a group */
            rename: async (groupId, name, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "rename",
                    body: { groupId, name, ...(options ?? {}) },
                });
            },
            /** Revoke current invite link */
            revokeInvite: async (groupId, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "revoke-invite",
                    body: { groupId, ...(options ?? {}) },
                });
            },
            /** Send a message to a WhatsApp group */
            send: async (groupId, message, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "send",
                    body: { groupId, message, ...(options ?? {}) },
                });
            },
            /** Update group settings (announcement, not_announcement, locked, unlocked) */
            settings: async (groupId, setting, options) => {
                return this.transport.call({
                    groupSegments: ["whatsapp", "group"],
                    command: "settings",
                    body: { groupId, setting, ...(options ?? {}) },
                });
            }
        }
    };
    workObjects = {
        /** Execute one Work Object action */
        action: async (type, id, actionId, options) => {
            return this.transport.call({
                groupSegments: ["work-objects"],
                command: "action",
                body: { type, id, actionId, ...(options ?? {}) },
            });
        },
        /** Resolve a Work Object by URL or external reference */
        resolve: async (target, options) => {
            return this.transport.call({
                groupSegments: ["work-objects"],
                command: "resolve",
                body: { target, ...(options ?? {}) },
            });
        },
        /** Suggest selectable options for a Work Object field */
        suggest: async (type, id, fieldId, options) => {
            return this.transport.call({
                groupSegments: ["work-objects"],
                command: "suggest",
                body: { type, id, fieldId, ...(options ?? {}) },
            });
        },
        /** Apply a structured patch to a Work Object */
        update: async (type, id, options) => {
            return this.transport.call({
                groupSegments: ["work-objects"],
                command: "update",
                body: { type, id, ...(options ?? {}) },
            });
        }
    };
    workflows = {
        runs: {
            /** Archive one node run from workflow aggregate state */
            archiveNode: async (runId, nodeKey) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "archive-node",
                    body: { runId, nodeKey },
                });
            },
            /** Cancel one workflow node run */
            cancel: async (runId, nodeKey) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "cancel",
                    body: { runId, nodeKey },
                });
            },
            /** List workflow runs */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Release a manual node transition or gate */
            release: async (runId, nodeKey) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "release",
                    body: { runId, nodeKey },
                });
            },
            /** Show one workflow run with node state */
            show: async (runId) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "show",
                    body: { runId },
                });
            },
            /** Skip one optional workflow node */
            skip: async (runId, nodeKey) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "skip",
                    body: { runId, nodeKey },
                });
            },
            /** Instantiate one workflow run from a spec */
            start: async (specId, options) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "start",
                    body: { specId, ...(options ?? {}) },
                });
            },
            /** Attach an existing task to a workflow task node */
            taskAttach: async (runId, nodeKey, taskId) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "task-attach",
                    body: { runId, nodeKey, taskId },
                });
            },
            /** Create a new task attempt for one workflow task node */
            taskCreate: async (runId, nodeKey, options) => {
                return this.transport.call({
                    groupSegments: ["workflows", "runs"],
                    command: "task-create",
                    body: { runId, nodeKey, ...(options ?? {}) },
                });
            }
        },
        specs: {
            /** Create one workflow spec from narrow JSON definition */
            create: async (specId, options) => {
                return this.transport.call({
                    groupSegments: ["workflows", "specs"],
                    command: "create",
                    body: { specId, ...(options ?? {}) },
                });
            },
            /** List workflow specs */
            list: async (options) => {
                return this.transport.call({
                    groupSegments: ["workflows", "specs"],
                    command: "list",
                    body: { ...(options ?? {}) },
                });
            },
            /** Show one workflow spec */
            show: async (specId) => {
                return this.transport.call({
                    groupSegments: ["workflows", "specs"],
                    command: "show",
                    body: { specId },
                });
            }
        }
    };
    yt = {
        /** Break down recent views and watch time by country */
        analyticsCountries: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-countries",
                body: { ...(options ?? {}) },
            });
        },
        /** Break down viewer percentage by age group and gender */
        analyticsDemographics: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-demographics",
                body: { ...(options ?? {}) },
            });
        },
        /** Break down recent views and watch time by device type */
        analyticsDevices: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-devices",
                body: { ...(options ?? {}) },
            });
        },
        /** Return aggregate channel engagement metrics for a recent period */
        analyticsOverview: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-overview",
                body: { ...(options ?? {}) },
            });
        },
        /** Return a daily time series for one approved YouTube Analytics metric */
        analyticsSeries: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-series",
                body: { ...(options ?? {}) },
            });
        },
        /** Rank channel videos by views for a recent period */
        analyticsTop: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-top",
                body: { ...(options ?? {}) },
            });
        },
        /** Break down recent views and watch time by traffic-source type */
        analyticsTraffic: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "analytics-traffic",
                body: { ...(options ?? {}) },
            });
        },
        /** Download one caption track as text */
        captionDownload: async (captionId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "caption-download",
                body: { captionId, ...(options ?? {}) },
            });
        },
        /** List caption tracks for one video */
        captions: async (videoId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "captions",
                body: { videoId, ...(options ?? {}) },
            });
        },
        /** List top-level comment threads for a video */
        comments: async (videoId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "comments",
                body: { videoId, ...(options ?? {}) },
            });
        },
        /** Inspect YouTube credential metadata without resolving a secret or calling Google */
        health: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "health",
                body: { ...(options ?? {}) },
            });
        },
        /** Return metadata and lifetime counters for the authenticated channel */
        info: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "info",
                body: { ...(options ?? {}) },
            });
        },
        /** List videos and playlist-item IDs from one playlist */
        playlist: async (playlistId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlist",
                body: { playlistId, ...(options ?? {}) },
            });
        },
        /** Add one video to a YouTube playlist */
        playlistAdd: async (playlistId, videoId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlist-add",
                body: { playlistId, videoId, ...(options ?? {}) },
            });
        },
        /** Create a YouTube playlist */
        playlistCreate: async (title, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlist-create",
                body: { title, ...(options ?? {}) },
            });
        },
        /** Permanently delete a YouTube playlist without deleting its videos */
        playlistDelete: async (playlistId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlist-delete",
                body: { playlistId, ...(options ?? {}) },
            });
        },
        /** Remove one playlist item without deleting the video */
        playlistRemove: async (playlistItemId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlist-remove",
                body: { playlistItemId, ...(options ?? {}) },
            });
        },
        /** List playlists owned by the authenticated channel */
        playlists: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "playlists",
                body: { ...(options ?? {}) },
            });
        },
        /** Publish a reply to a top-level YouTube comment */
        reply: async (commentId, text, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "reply",
                body: { commentId, text, ...(options ?? {}) },
            });
        },
        /** Search videos in the authenticated channel */
        search: async (query, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "search",
                body: { query, ...(options ?? {}) },
            });
        },
        /** Calculate lifetime video counters, age and average views per day */
        stats: async (id, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "stats",
                body: { id, ...(options ?? {}) },
            });
        },
        /** List channels followed by the authenticated channel */
        subscriptions: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "subscriptions",
                body: { ...(options ?? {}) },
            });
        },
        /** List recent comment threads with zero replies */
        unanswered: async (videoId, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "unanswered",
                body: { videoId, ...(options ?? {}) },
            });
        },
        /** Get one video by YouTube video ID */
        video: async (id, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "video",
                body: { id, ...(options ?? {}) },
            });
        },
        /** List assignable YouTube video categories for a region */
        videoCategories: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "video-categories",
                body: { ...(options ?? {}) },
            });
        },
        /** Permanently delete an owned YouTube video */
        videoDelete: async (id, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "video-delete",
                body: { id, ...(options ?? {}) },
            });
        },
        /** Update selected metadata on an owned YouTube video */
        videoUpdate: async (id, options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "video-update",
                body: { id, ...(options ?? {}) },
            });
        },
        /** List videos from the authenticated channel uploads playlist */
        videos: async (options) => {
            return this.transport.call({
                groupSegments: ["yt"],
                command: "videos",
                body: { ...(options ?? {}) },
            });
        }
    };
}
//# sourceMappingURL=client.js.map