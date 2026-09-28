## Measure the release-shaped app

Performance work is most useful when it starts with a repeatable symptom. A slow first screen, dropped frames while scrolling, a large install, or a hot device each points to a different part of the system. Pick one user-visible problem and capture a baseline before changing code.

Profile a release or profile build on representative hardware. Debug builds add checks and instrumentation that can distort timing, so they are useful for correctness but poor evidence for shipping performance. Keep the device, build mode, route, and test data consistent between runs.

## Separate startup from first useful content

Startup time is not one number. The process may launch quickly while the first useful screen waits for fonts, configuration, authentication, or a large request. Record both process start and the moment the user can complete the first meaningful action.

Move independent work off the critical path when the user does not need it immediately. Defer optional analytics setup or secondary data fetches until after the initial view is usable. Keep required configuration and security checks explicit; hiding them behind a faster splash screen does not make the app ready sooner.

## Find the frame that misses its budget

At 60 frames per second, a frame has roughly 16.7 milliseconds to be produced. Higher refresh rates allow less time per frame. A trace helps distinguish work on Flutter's UI thread from rasterization and GPU work. Look for repeated expensive builds, large image decodes, shader compilation, synchronous parsing, and layout that touches more widgets than expected.

Use Flutter DevTools to inspect frame timing and CPU activity while reproducing the exact interaction. A profile should include enough context to answer: what happened immediately before the slow frame, which thread was busy, and whether the delay repeats?

Do not optimize based on widget count alone. A small tree can trigger expensive work, and a large tree can remain smooth when updates are localized. Check whether state changes rebuild the intended region, then measure again after narrowing the update or moving computation out of the build path.

## Treat images and lists as data problems

Images can cost memory long before they appear large on screen. Decode close to the displayed size, use thumbnails for lists, and avoid retaining many full-resolution images in an unbounded cache. For long lists, build rows lazily and keep row work inexpensive.

If parsing a large response blocks interaction, measure the parse first. Isolates can move CPU-bound work off the UI isolate, but they add message-copying and lifecycle costs. Use them when a measured task is large enough to justify that boundary; ordinary small JSON responses may be faster to handle directly.

## Make measurements comparable

Run the same scenario several times and compare medians or distributions rather than celebrating one unusually fast run. Note device model, OS version, build mode, network conditions, and whether the app was warm or cold. A change that improves a synthetic benchmark but worsens the real route is not a win.

After a change, recheck correctness and resource use. Startup improvements can shift work later; a cache can trade latency for memory; fewer network calls can increase stale data. Performance is a balance across responsiveness, memory, battery, binary size, and reliability.

## Keep a small performance budget

Teams do not need a large observability project to keep regressions visible. Track a few representative user journeys and agree on what counts as a regression for each. Revisit the traces when dependencies, rendering paths, or data volume change.

The repeatable loop is simple: reproduce, measure, identify the bottleneck, change one thing, and measure the same path again. That discipline turns performance tuning from guesswork into engineering evidence.
