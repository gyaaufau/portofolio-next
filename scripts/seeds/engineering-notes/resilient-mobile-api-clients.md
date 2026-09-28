## Assume every request can stop halfway

A mobile client runs on changing networks, in the background, and on devices that may be suspended while a request is in flight. Build each API call around a clear outcome: success with validated data, a retryable transport failure, an authentication failure, a client validation error, or a server response the app cannot use.

Keep HTTP details at the data boundary. A repository or API client can turn status codes and response shapes into results the rest of the app understands. Screens should not need to know whether a timeout came from a socket, a proxy, or a server gateway.

## Give requests a bounded lifetime

Every request should have a timeout chosen for its job. A small lookup should not keep a loading state alive indefinitely. A large upload may need a longer deadline and progress reporting. Treat a timeout as an unknown outcome for writes: the server may have committed the change even though the response never reached the device.

That uncertainty is why retry policy depends on operation semantics. Retrying a read is usually safe. Retrying a payment, message send, or order creation can duplicate an action unless the server supports an idempotency key. For writes that can be retried, send the same key with each attempt and let the server return the original result.

## Retry only failures that may recover

Do not retry every non-success response. A temporary network error or selected server overload response may recover. A malformed request or permission denial usually needs a user or developer action first. Keep the retry count bounded and increase the delay between attempts with jitter so many clients do not reconnect at the same instant.

Respect server retry guidance when it is available, but cap the wait to the product's interaction needs. A foreground action can offer a retry button after a short bounded policy. Background synchronization can wait longer and persist its work across process restarts.

## Make cancellation and duplicate work explicit

Search-as-you-type requests become stale as the user enters new text. Cancel the previous request when the client can, and also ignore a late response if its query is no longer current. Cancellation saves work but is not a substitute for checking which request owns the visible state.

Likewise, disable or coalesce duplicate submissions while an action is pending. Client-side guards improve the interaction, while server-side idempotency protects against process restarts, retries, and multiple devices.

## Parse responses as untrusted input

The network response is outside the app's control. Validate required fields and types before mapping them into domain objects. Handle missing optional fields with deliberate defaults, but do not convert an invalid required identifier into an empty string and let it travel through the application.

Keep error messages useful without exposing tokens, raw request headers, or personal data. Logs should include a request correlation ID where available, the operation name, status category, and elapsed time. Avoid storing full response bodies by default; they may contain data the user did not intend to put in logs.

## Test the contract at the boundary

Use deterministic tests for success, malformed data, timeout, cancellation, authentication expiry, retryable server responses, and duplicate writes. A fake transport can verify retry count and idempotency headers without depending on a live service. Keep a smaller integration test for the actual serialization and endpoint contract.

A resilient client does not promise that the network will work. It limits how long the user waits, preserves safe work, avoids duplicate effects, and explains the next useful action when a request cannot complete.
