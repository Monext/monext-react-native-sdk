# Repository Guidelines

## Project Structure & Module Organization

This package is a React Native TurboModule that exposes the Monext native payment sheet. Keep the public TypeScript API and Codegen spec in `src/` (`src/index.ts` and `src/NativeMonextPayment.ts`). Native Android code is under `android/src/main/java/com/monext/reactnative/`; the iOS bridge is in `ios/`. The package definition and build settings live in `package.json`, `tsconfig*.json`, and `monext-react-native-sdk.podspec`. Use `example-app/` as the integration app and place its Jest tests in `example-app/__tests__/`.

## Build, Test, and Development Commands

- `npm install` installs library dependencies and runs the `prepare` build.
- `npm run typecheck` checks the public TypeScript source with strict compiler settings.
- `npm run prepare` runs Builder Bob and emits distributable files to `lib/`.
- `npm run start`, `npm run android`, and `npm run ios` run the example app’s Metro server or platform launch command.
- `npm --prefix example-app run lint` runs ESLint for the example app.
- `npm --prefix example-app test` runs Jest tests using the React Native preset.

For iOS native dependency changes, run `pod install` from `example-app/ios/` before launching the example.

## Coding Style & Naming Conventions

Follow the existing local style. TypeScript uses two-space indentation, single quotes, explicit exported types, and camelCase functions (for example, `presentPaymentSheet`). Native Kotlin follows four-space indentation, `PascalCase` types, and `camelCase` members. Swift also uses four spaces and Swift naming conventions. Keep the TypeScript module spec, Android module name, and iOS `@objc` bridge name aligned with `MonextPayment`; Codegen depends on those names.

Avoid unused declarations: the root TypeScript configuration enables `strict`, `noUnusedLocals`, and `noUnusedParameters`.

## Testing Guidelines

Add unit or integration coverage in `example-app/__tests__/` for JavaScript-facing behavior; name files `*.test.tsx` (for example, `App.test.tsx`). Run the relevant Jest suite and `npm run typecheck` before submitting. For bridge or payment-flow changes, validate both Android and iOS through the example app, including cancellation and error paths. No repository-wide coverage threshold is configured.

## Commit & Pull Request Guidelines

Recent history uses short imperative subjects such as `Fix ios` and `Fix 'npm run ios'`. Use similarly concise, scoped messages (for example, `Fix Android payment cancellation`). Keep each commit focused. Pull requests should explain the user-visible/native impact, list tests run, link the related issue when available, and include screenshots or recordings for example-app UI changes. Flag changes to SDK versions, CocoaPods/SPM, Gradle repositories, or payment configuration explicitly.
