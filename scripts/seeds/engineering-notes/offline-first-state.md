## Offline-first starts with a local source of truth

An app does not become offline-capable just because it caches the last response. The important decision is where the UI gets its current state. For a screen that should remain useful without a connection, let a local store provide the data the interface renders. Network requests then update that store instead of becoming a prerequisite for every screen build.

In Flutter, a repository is a useful place to keep this boundary. A screen-facing method can subscribe to a local query, while a refresh method fetches remote data and writes the result locally. The widget sees one stream of domain data whether the last update came from disk or the network.

```dart
Stream<List<Task>> watchTasks() => localStore.watchTasks();

Future<void> refreshTasks() async {
  final remoteTasks = await api.fetchTasks();
  await localStore.replaceTasks(remoteTasks);
}
```

The local store is now the UI's source of truth. That keeps rendering predictable and means a failed refresh does not erase data the user already has.

## Decide what a write means before implementing sync

Reads and writes have different failure semantics. A cached read can be old and still useful. A write that looks successful but disappears later breaks trust. Decide whether each action is allowed offline and communicate that state clearly.

For an offline-capable action, persist an operation locally with a stable identifier, its payload, and a sync state. Show the local change immediately, then retry the operation when connectivity returns. A server acknowledgement marks it complete. A validation error should become a visible conflict or correction request, not an endless retry.

Avoid treating connectivity as proof that a request will succeed. A device may report a network interface while DNS, TLS, authentication, or the service itself is unavailable. Attempt the operation and handle its result.

## Make ordering and retries safe

Retries can deliver the same operation more than once. Use an idempotency key when the API supports one, or design the operation around a stable client-generated ID so the server can recognize duplicates. Keep retry policy bounded and use backoff with jitter; immediately retrying every failure can drain battery and add pressure to a recovering service.

When operations depend on order, record that order explicitly. For example, creating a list and then adding an item to it cannot safely sync as two unrelated jobs if the server has not received the list yet. A small dependency or aggregate queue can preserve the required sequence.

## Treat conflicts as a product decision

Two devices can edit the same record while disconnected. “Last write wins” is simple, but it can silently discard a meaningful change. For fields that can be merged independently, field-level updates may work. For collaborative text or inventory, the product may need a conflict screen or a domain-specific merge rule.

Include enough metadata to make the choice possible: server version, local update time, operation ID, and the fields changed. Do not use device time alone as a universal ordering rule; clocks can drift and users can change them.

## Test the state transitions

Test an empty local store, a successful refresh, a refresh that fails while cached data exists, queued writes, duplicate acknowledgements, and a server rejection. These cases define the actual offline contract more clearly than a single airplane-mode test.

Offline-first work is useful when it protects a real user task. Start with the screens and actions that must survive a weak connection, choose their local source of truth, then add synchronization rules that match the data rather than applying one generic cache policy everywhere.
