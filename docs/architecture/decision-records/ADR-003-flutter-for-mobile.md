# ADR-003: Flutter for Mobile Application

## Status

**Accepted**

## Date

2026-03-11

## Context

The ILoveBerlin platform requires a mobile application for iOS and Android to complement the web experience. The mobile app serves both tourists exploring Berlin and residents discovering local businesses, events, and experiences. Key requirements include:

- **Cross-platform availability**: The app must be available on both iOS and Android from launch. Berlin's population and tourist base use both platforms in significant numbers.
- **Performance**: The app must deliver smooth scrolling through image-heavy listings, fluid map interactions, and snappy transitions. Users compare the experience to established apps like Google Maps, Yelp, and TripAdvisor.
- **Rich UI**: Custom animations, branded visual identity, interactive maps with custom markers, image galleries, and polished micro-interactions are essential for the brand experience.
- **Offline capability**: Tourists may have limited data connectivity. The app should cache key content (saved places, downloaded guides, maps) for offline use.
- **Platform features**: Push notifications, camera access (for reviews/photos), location services, deep linking, and biometric authentication are required.
- **Development velocity**: The team is small. Maintaining two separate native codebases (Swift/Kotlin) would strain resources and slow feature delivery.
- **Feature parity**: Features must ship to both platforms simultaneously to avoid user frustration and support complexity.

## Decision

We will use **Flutter** (with Dart) to build the ILoveBerlin mobile application for iOS and Android from a single codebase.

Flutter's compiled-to-native approach using the Skia/Impeller rendering engine delivers near-native performance while allowing the team to maintain a single codebase. Its rich widget library and composable UI system enable the custom, branded experience the platform requires without depending on platform-specific UI components that may look or behave differently across iOS and Android.

## Alternatives Considered

| Criterion | Flutter | React Native | Native (Swift + Kotlin) | Kotlin Multiplatform |
|---|---|---|---|---|
| Codebase | Single (Dart) | Single (TypeScript/JS) | Two separate codebases | Shared logic (Kotlin), native UI |
| Language | Dart | TypeScript/JavaScript | Swift (iOS), Kotlin (Android) | Kotlin |
| UI rendering | Own engine (Skia/Impeller) | Native platform widgets | Native platform widgets | Native platform widgets |
| Performance | Near-native (compiled AOT) | Good (JS bridge / new arch) | Native | Native |
| UI consistency across platforms | Pixel-perfect identical | Platform-dependent differences | Platform-native (different) | Platform-native (different) |
| Custom UI / animations | Excellent (widget composition) | Good (Reanimated, but complex) | Excellent (per platform) | Depends on native UI layer |
| Hot reload | Excellent (stateful hot reload) | Good (Fast Refresh) | Xcode/AS incremental builds | Partial |
| Developer pool | Growing rapidly | Very large (JS/TS developers) | Large (per platform) | Small but growing |
| Type sharing with backend | Requires code generation | Direct sharing (TypeScript) | Requires code generation | Requires code generation |
| Maturity | Mature (stable since 2018) | Mature (stable since 2015) | Most mature | Maturing (stable since 2023) |
| Platform API access | Via plugins (large ecosystem) | Via native modules | Direct | Direct (Kotlin), bridged (iOS) |
| App size | ~15-20 MB base | ~10-15 MB base | ~5-10 MB base | ~8-12 MB base |

### Why not React Native?

React Native would allow the team to share TypeScript code and potentially React components with the Next.js frontend. This is a significant advantage. However, several factors tipped the decision toward Flutter:

- **UI consistency**: React Native renders using platform-native widgets, meaning the app looks and behaves subtly differently on iOS and Android. For a brand-driven platform, pixel-perfect consistency across platforms is preferred. Flutter's own rendering engine guarantees identical output everywhere.
- **Animation and custom UI**: Flutter's widget composition model makes complex custom animations and UI elements more straightforward. React Native requires libraries like Reanimated and Gesture Handler, which add complexity and are common sources of issues during upgrades.
- **Performance predictability**: React Native's new architecture (Fabric, TurboModules, JSI) has improved performance significantly, but the JavaScript bridge (legacy) or JSI layer still introduces overhead for complex interactions. Flutter compiles Dart to native ARM code with no bridge.
- **Developer experience**: Flutter's stateful hot reload preserves widget state during development, enabling faster iteration on UI. The Dart DevTools provide integrated performance profiling, widget inspection, and memory analysis.

The tradeoff is that the mobile team must work in Dart rather than TypeScript, and type sharing with the backend requires code generation (e.g., OpenAPI-generated Dart clients) rather than direct imports.

### Why not native iOS + Android?

Native development delivers the best possible performance, full access to platform APIs, and the most "platform-native" user experience. However:

- **Double the development effort**: Every feature must be implemented twice -- once in Swift/SwiftUI for iOS and once in Kotlin/Jetpack Compose for Android. With a small team, this halves feature velocity.
- **Divergence risk**: Over time, the two codebases inevitably diverge in behavior, bugs, and feature completeness, creating inconsistent user experiences and complicating support.
- **Specialized hiring**: The team would need developers proficient in both Swift and Kotlin ecosystems, or separate iOS and Android teams.

Native development would be reconsidered if the platform's scale and team size grow to a point where platform-specific optimizations and experiences justify the cost.

### Why not Kotlin Multiplatform?

Kotlin Multiplatform (KMP) offers an interesting middle ground: shared business logic in Kotlin with native UI on each platform. This preserves platform-native look and feel while reducing logic duplication. However:

- **UI still separate**: The UI layer must be built twice using SwiftUI and Jetpack Compose, which is where most of the development effort lies for a UI-rich application like ILoveBerlin.
- **iOS friction**: Kotlin Multiplatform on iOS requires Kotlin/Native compilation and interop with Swift, which adds build complexity and can introduce performance overhead for certain patterns.
- **Smaller ecosystem**: KMP's library ecosystem for mobile is still maturing. Many common mobile libraries (maps, image loading, local storage) require platform-specific implementations or wrappers.
- **Team expertise**: The team does not have deep Kotlin expertise, making Flutter's Dart (which is straightforward to learn for TypeScript developers) a more accessible choice.

## Consequences

### Positive

- **Single codebase**: One codebase for iOS and Android means features ship simultaneously with identical behavior. Bug fixes apply to both platforms at once.
- **Consistent brand experience**: Flutter's rendering engine ensures the ILoveBerlin brand identity -- colors, typography, animations, layouts -- looks identical on every device.
- **Rapid UI development**: Flutter's widget composition model and stateful hot reload enable fast iteration on UI designs. Custom components (e.g., branded cards, interactive map markers, animated transitions) are built from composable primitives.
- **Strong performance**: Compiled Dart with the Impeller rendering engine delivers 60/120fps scrolling and animations without the overhead of a JavaScript bridge.
- **Growing ecosystem**: Flutter's package ecosystem covers maps (google_maps_flutter, flutter_map), local storage (Hive, Isar), state management (Riverpod, Bloc), and HTTP clients (Dio) with mature, well-maintained options.
- **Future flexibility**: Flutter also supports web and desktop targets. While the primary web experience will be Next.js (for SEO), Flutter Web could be used for specific internal tools or PWA experiments in the future.

### Negative

- **Language split**: The mobile team works in Dart while the web and backend teams work in TypeScript. This prevents direct code sharing and means type definitions must be synchronized via code generation (OpenAPI-to-Dart).
- **Separate repository**: The Flutter app will live in a separate repository outside the TypeScript monorepo, adding overhead for cross-cutting changes that span mobile and backend.
- **Platform-specific work still required**: Push notifications, deep linking, biometric auth, and background location require platform-specific configuration (Xcode/Gradle) and testing on physical devices, even with Flutter.
- **App size**: Flutter apps have a larger base size (~15-20 MB) compared to native apps, due to the bundled rendering engine. This is acceptable but worth noting for markets with download-size sensitivity.
- **Dart learning curve**: While Dart is accessible (similar to TypeScript/Java), it is an additional language for the team to learn and maintain expertise in.

## References

- [Flutter Documentation](https://docs.flutter.dev/)
- [Dart Language](https://dart.dev/)
- [Impeller Rendering Engine](https://docs.flutter.dev/perf/impeller)
- [Flutter vs React Native (2025 comparison)](https://docs.flutter.dev/resources/faq)
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)
- [OpenAPI Generator - Dart](https://openapi-generator.tech/docs/generators/dart)
