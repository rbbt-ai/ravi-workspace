// GENERATED FILE — DO NOT EDIT.
// Run `ravi sdk client generate` to regenerate.
// Drift is detected by `ravi sdk client check` (CI).
import { buildErrorFromGateway, RaviTransportError } from "./errors.js";
import { REGISTRY_HASH, SDK_VERSION } from "./version.js";
export class RaviStreamClient {
    config;
    baseUrl;
    fetchImpl;
    constructor(config) {
        this.config = config;
        this.baseUrl = stripTrailingSlash(config.baseUrl);
        this.fetchImpl = config.fetch ?? globalThis.fetch;
        if (typeof this.fetchImpl !== "function") {
            throw new Error("RaviStreamClient: no global `fetch` available. Pass `config.fetch` explicitly when running in a stripped-down runtime.");
        }
    }
    /**
     * Subscribe to the full NATS event bus. Mirrors `ravi events stream` and suppresses the same noisy topics (message.*, reaction.*, instance.*, presence.typing, chat.unread-updated, .stream, claude stream chunks).
     */
    events(options = {}) {
        const params = new URLSearchParams();
        appendString(params, "subject", options.subject);
        appendString(params, "filter", options.filter);
        appendString(params, "only", options.only);
        appendBool(params, "noClaude", options.noClaude);
        appendBool(params, "noHeartbeat", options.noHeartbeat);
        return this.stream("events", params, options.signal);
    }
    /**
     * Subscribe to task lifecycle events (`ravi.task.<id>.event`).
     */
    tasks(options = {}) {
        const params = new URLSearchParams();
        appendString(params, "taskId", options.taskId);
        return this.stream("tasks", params, options.signal);
    }
    /**
     * Subscribe to runtime debug events for a single session: prompts, responses, streamed chunks, tool calls, provider runtime events, claude SDK events, delivery telemetry, and approval request/response.
     */
    session(name, options = {}) {
        const params = new URLSearchParams();
        appendNumber(params, "timeout", options.timeout);
        return this.stream("sessions/" + encodeURIComponent(name), params, options.signal);
    }
    /**
     * Subscribe to the live event stream for a single chat: new messages, reactions, presence/typing, and unread updates. The server filters by `chatId` against the upstream omni payload — events for other chats are discarded before reaching the client.
     */
    chat(chatId, options = {}) {
        const params = new URLSearchParams();
        return this.stream("chats/" + encodeURIComponent(chatId), params, options.signal);
    }
    /**
     * Subscribe to lifecycle events for a single omni instance: QR code, connected, disconnected. Filtered server-side.
     */
    instance(instanceId, options = {}) {
        const params = new URLSearchParams();
        return this.stream("instances/" + encodeURIComponent(instanceId), params, options.signal);
    }
    /**
     * Subscribe to the global audit event stream (`ravi.audit.>`).
     */
    audit(options = {}) {
        const params = new URLSearchParams();
        return this.stream("audit", params, options.signal);
    }
    async *stream(channelPath, params, signal) {
        const suffix = params.toString();
        const url = `${this.baseUrl}/api/v1/_stream/${channelPath}${suffix ? `?${suffix}` : ""}`;
        const response = await this.fetchStream(url, signal);
        yield* parseSse(response.body);
    }
    async fetchStream(url, signal) {
        let response;
        try {
            response = await this.fetchImpl(url, {
                method: "GET",
                headers: {
                    accept: "text/event-stream",
                    authorization: `Bearer ${this.config.contextKey}`,
                    "x-ravi-sdk-version": SDK_VERSION,
                    "x-ravi-registry-hash": REGISTRY_HASH,
                    ...(this.config.headers ?? {}),
                },
                ...(signal ? { signal } : {}),
            });
        }
        catch (err) {
            throw new RaviTransportError(err instanceof Error ? err.message : "network error opening Ravi stream", err);
        }
        if (!response.ok) {
            const rawText = await safeText(response);
            throw buildErrorFromGateway(response.status, parseJson(rawText), "sdk.stream");
        }
        return response;
    }
}
/**
 * Typed decoders for the sub-events emitted by `ChatStreamPayload`.
 * Each helper re-decodes the raw `data` field into a concrete shape so
 * callers can switch on the SSE `event` name and unwrap with confidence.
 */
export function decodeMessage(envelope) {
    return envelope.data;
}
export function decodeReaction(envelope) {
    return envelope.data;
}
export function decodePresenceTyping(envelope) {
    return envelope.data;
}
export function decodeUnread(envelope) {
    return envelope.data;
}
export function createStreamClient(config) {
    return new RaviStreamClient(config);
}
export async function* parseSse(body) {
    if (!body)
        return;
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";
    let eventId;
    let dataLines = [];
    let completed = false;
    const flush = () => {
        if (dataLines.length === 0) {
            eventName = "message";
            eventId = undefined;
            return null;
        }
        const raw = dataLines.join("\n");
        const out = {
            ...(eventId !== undefined ? { id: eventId } : {}),
            event: eventName,
            data: JSON.parse(raw),
        };
        eventName = "message";
        eventId = undefined;
        dataLines = [];
        return out;
    };
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                completed = true;
                break;
            }
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
            let newlineIndex = buffer.indexOf("\n");
            while (newlineIndex !== -1) {
                const line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);
                if (line === "") {
                    const event = flush();
                    if (event)
                        yield event;
                }
                else if (!line.startsWith(":")) {
                    const colonIndex = line.indexOf(":");
                    const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
                    const valuePart = colonIndex === -1 ? "" : line.slice(colonIndex + 1).replace(/^ /, "");
                    if (field === "event")
                        eventName = valuePart || "message";
                    if (field === "id")
                        eventId = valuePart;
                    if (field === "data")
                        dataLines.push(valuePart);
                }
                newlineIndex = buffer.indexOf("\n");
            }
        }
        const tail = decoder.decode();
        if (tail)
            buffer += tail;
        if (buffer.length > 0) {
            for (const line of buffer.split("\n")) {
                if (line.startsWith("data:"))
                    dataLines.push(line.slice(5).replace(/^ /, ""));
                if (line.startsWith("event:"))
                    eventName = line.slice(6).replace(/^ /, "") || "message";
                if (line.startsWith("id:"))
                    eventId = line.slice(3).replace(/^ /, "");
            }
        }
        const event = flush();
        if (event)
            yield event;
    }
    finally {
        if (!completed) {
            await reader.cancel().catch(() => undefined);
        }
        reader.releaseLock();
    }
}
function appendString(params, key, value) {
    if (value !== undefined && value.trim() !== "")
        params.set(key, value);
}
function appendNumber(params, key, value) {
    if (value !== undefined && Number.isFinite(value))
        params.set(key, String(value));
}
function appendBool(params, key, value) {
    if (value === true)
        params.set(key, "1");
}
function stripTrailingSlash(value) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}
async function safeText(response) {
    try {
        return await response.text();
    }
    catch {
        return "";
    }
}
function parseJson(raw) {
    if (raw.length === 0)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return { error: "MalformedResponse", message: raw.slice(0, 1024) };
    }
}
//# sourceMappingURL=streaming.generated.js.map