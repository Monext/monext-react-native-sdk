# CLAUDE.md

## What this is

`monext-react-native-sdk` is a React Native TurboModule that wraps the native Monext payment sheet (Android/Kotlin + iOS/Swift) so JS callers can do a single thing: `presentPaymentSheet(sessionToken, context)` and get back a `PaymentSheetResult`. There is no business logic on the JS side beyond argument validation and marshalling — all payment flow logic lives in the native Monext SDKs (Android `com.monext.sdk`, iOS `Monext` SPM package), which this repo only bridges to.

The New Architecture (TurboModules + Codegen) is required in any host app; there is no legacy-bridge fallback.

## Repository layout

- `src/index.ts` — public JS/TS API (`presentPaymentSheet`) and re-exported types. Validates `sessionToken` and delegates to the native module.
- `src/NativeMonextPayment.ts` — the Codegen `Spec` (TurboModule interface) and all shared types (`MnxtSDKContext`, `Appearance`, `GooglePayConfiguration`, `ApplePayConfiguration`, `PaymentSheetResult`). This is the single source of truth for the JS↔native contract — Codegen reads it to generate native interfaces (`android.javaPackageName: com.monext.reactnative`, spec name `RNMonextPaymentSpec`).
- `android/src/main/java/com/monext/reactnative/`
  - `MonextPaymentModule.kt` — the TurboModule implementation (`NativeMonextPaymentSpec`). Guards against concurrent presentations (`pendingPromise`), launches `MonextPaymentActivity` via `startActivityForResult`, and resolves/rejects the JS promise from an `ActivityEventListener` when that activity finishes.
  - `MonextPaymentActivity.kt` — a dedicated `ComponentActivity` that hosts the Compose payment sheet full-screen and returns a result `Intent` (`RESULT_OK`/`RESULT_CANCELED`/`RESULT_FIRST_USER` for errors) back to the module.
  - `MonextNativePaymentSheet.kt` — Compose function that unpacks the `Bundle` context (converted from the JS object via `Arguments.toBundle`) into the native SDK's `MnxtSDKContext`/`Appearance`/`GooglePayConfiguration`, and renders `PaymentSheet(...)` from `com.monext.sdk`.
  - `MonextPaymentPackage.kt` — `BaseReactPackage` registration (`ReactModuleInfoProvider`).
- `ios/MonextPayment.swift` — the `@objc(MonextPayment)` bridge class. Presents a `UIHostingController` wrapping a SwiftUI view over the current top view controller (found by walking `connectedScenes` → key window → `presentedViewController` chain). `PaymentSheetCompletion` sequences the SwiftUI `onResult` callback against the async `present(animated:)` completion to avoid a present/dismiss race — a result arriving before the presentation transition finishes is queued (`pendingResult`) and only completed once `markPresented()` fires.
- `ios/MonextPaymentBridge.m` — Objective-C `RCT_EXTERN_REMAP_MODULE`/`RCT_EXTERN_METHOD` declarations exposing the Swift class to the bridge.
- `monext-react-native-sdk.podspec` — declares the CocoaPods spec and pulls in the native `Monext` Swift package via SPM (`spm_dependency`, pinned to `1.0.7-1`), plus its 3DS dependency. iOS 16+ only.
- `example-app/` — a real React Native app (own `android/`, `ios/`, `node_modules`) that depends on this package via `file:..` and is the integration target for manual/E2E testing. Its Jest tests live in `example-app/__tests__/`.
- `lib/` — build output from `react-native-builder-bob` (commonjs/module/typescript). Generated; do not hand-edit.

Two other directories under the parent folder (`Example/`, top-level `monext-react-native-sdk/`) are unrelated/stale scaffolding, not part of this package — ignore them unless explicitly asked about them.

## Commands

Run from the package root (`sdk/monext-react-native-sdk/`) unless noted.

- `npm install` — installs deps and runs `prepare` (build via Builder Bob).
- `npm run typecheck` — `tsc --noEmit` against `src/` with `strict`, `noUnusedLocals`, `noUnusedParameters`.
- `npm run prepare` — builds `src/` into `lib/` (commonjs, esm, and `.d.ts` via `tsconfig.build.json`).
- `npm run start` / `npm run android` / `npm run ios` — proxy to `example-app`'s Metro/launch commands (`npm --prefix example-app run ...`).
- `npm --prefix example-app run lint` — ESLint for the example app.
- `npm --prefix example-app test` — Jest (react-native preset) for the example app; single test: `npm --prefix example-app test -- App.test` (or any `-t`/path filter Jest supports).
- For iOS native dependency changes: `pod install` from `example-app/ios/` before relaunching the example.

There is no test suite for the package itself (`src/`) — JS-facing behavior is covered via `example-app/__tests__/`. There is no repo-wide coverage threshold.

## Coding conventions

- TypeScript: two-space indent, single quotes, explicit exported types, camelCase functions (e.g. `presentPaymentSheet`).
- Kotlin: four-space indent, `PascalCase` types, `camelCase` members.
- Swift: four-space indent, standard Swift naming.
- Keep the TS module spec, the Android module name, and the iOS `@objc` bridge name all aligned as `MonextPayment` — Codegen and the bridge depend on this name matching exactly across `NativeMonextPayment.ts`, `MonextPaymentModule.NAME`, and `@objc(MonextPayment)`.
- When adding a new field to `MnxtSDKContext`/`Appearance`/etc., it must be threaded through three places in lockstep: the TS type in `src/NativeMonextPayment.ts`, the Kotlin `Bundle` parsing in `MonextNativePaymentSheet.kt`, and the Swift `PaymentContext`/`Appearance` construction in `MonextPayment.swift`. `pendingColor` is Android-only by design (no iOS equivalent); SwiftUI image-typed appearance fields are not serializable from JS — do not add JS-facing fields for them.

## Testing changes

For bridge or payment-flow changes, validate through `example-app` on both platforms, explicitly including cancellation and error paths (not just the happy path) — the native side has non-obvious state handling (Android's single-`pendingPromise` guard and activity-result mapping; iOS's present/dismiss race handling in `PaymentSheetCompletion`) that's easy to regress silently.

## Commits & PRs

Use short, scoped, imperative commit subjects (e.g. `Fix Android payment cancellation`). PRs should state user-visible/native impact, list tests run, and call out any changes to SDK versions, CocoaPods/SPM, Gradle repositories, or payment configuration explicitly.
