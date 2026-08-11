# monext-react-native-sdk

> **⚠️ Beta / work in progress** — this wrapper is under active development. APIs, native dependency versions, and behavior may still change without notice. Avoid using it in production until a stable release is announced.

React Native library exposing the Monext native payment sheet on Android and iOS through a TurboModule. There is no payment logic on the JS side — this package only validates arguments and bridges to the native Monext SDKs (`com.monext.sdk` on Android, `Monext` SPM package on iOS), which own the actual payment flow.

## Overview

Both native SDKs ship a drop-in payment sheet that handles the full checkout flow (card entry, 3DS, Apple Pay/Google Pay) once your backend has created a session — this package exposes that same sheet to React Native, imperatively (`presentPaymentSheet`) or declaratively (`<PaymentButton>`):

![Monext payment sheet](https://github.com/user-attachments/assets/abb278fd-c8c4-4ec1-a29a-c4fc9cae980d)

## Requirements

- React Native with the **New Architecture** enabled (TurboModules + Codegen). There is no legacy-bridge fallback.
- Android 8.0 (API 26)+.
- iOS 16.0+.
- `react`/`react-native` as peer dependencies (any version compatible with the New Architecture).
- An active Monext merchant account and a backend able to call the Monext Retail API — see [Backend integration](#backend-integration).

## Install

```sh
npm install monext-react-native-sdk
```

Enable the New Architecture in the host React Native app because this module is implemented as a TurboModule.


### Apple Pay setup (optional)

To offer Apple Pay through `applePayConfiguration`, configure it once in the host app before it can be used:

1. Create a Merchant ID in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list/merchant).
2. Generate a Payment Processing Certificate for that Merchant ID (submit the CSR) and send it to Monext, following Monext's own onboarding documentation.
3. In Xcode, enable the **Apple Pay** capability under **Signing & Capabilities** for the iOS app target, and select the Merchant ID created above.
4. Pass `applePayConfiguration` (`buttonLabel`/`buttonStyle`) in `MnxtSDKContext` to control the button's appearance — see [`ApplePayConfiguration`](#applepayconfiguration-ios).

## Backend integration

There is no payment logic on the JS or native side beyond presenting the sheet and reporting its result — session creation and final status checks happen on your backend, which is the only place allowed to hold Monext credentials:

1. Your backend creates a payment session through the Monext Retail API ([`Session Create`](https://api-docs.retail.monext.com/reference/sessioncreate)) using your `BasicToken`/merchant ID. **Never** call the Monext Retail API directly from the app, and never ship those credentials in the app bundle.
2. Your backend returns the resulting `sessionToken` to the app, which passes it to `presentPaymentSheet`/`PaymentButton`.
3. After the sheet resolves, treat its `PaymentSheetResult` as a UI-level hint only; confirm the final outcome from your backend via the Retail API's [`GET Session`](https://api-docs.retail.monext.com/reference/sessionget) (or your webhook/notification flow) before granting the purchase.

## Usage

There are two ways to present the payment sheet: imperatively with `presentPaymentSheet`, or declaratively with the `<PaymentButton>` component.

### Imperative

```ts
import { presentPaymentSheet } from 'monext-react-native-sdk';

const result = await presentPaymentSheet(sessionToken, {
  environment: 'sandbox',
  config: { language: 'FR' },
});

if (result.result === 'completed' && result.state === 'paymentSuccess') {
  // payment completed
}
```

### Declarative

```tsx
import { PaymentButton } from 'monext-react-native-sdk';

<PaymentButton
  sessionToken={sessionToken}
  context={{ environment: 'sandbox', config: { language: 'FR' } }}
  onResult={(result) => {
    if (result.result === 'completed' && result.state === 'paymentSuccess') {
      // payment completed
    }
  }}
  onError={(error) => {
    // Strongly recommended: handle presentation errors gracefully
    console.error('Payment sheet failed:', error);
  }}
>
  {({ isPresenting }) => (
    <Text>{isPresenting ? 'Processing...' : 'Checkout'}</Text>
  )}
</PaymentButton>;
```

## API

### `presentPaymentSheet`

```ts
presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult>
```

Presents the native payment sheet full-screen (a dedicated Activity on Android, a modal `UIHostingController` on iOS) and resolves once the user completes, cancels, or the native SDK returns an error. Only one payment sheet can be presented at a time; calling this again while one is already open rejects with `E_PAYMENT_IN_PROGRESS`.

Before calling native, `presentPaymentSheet` validates `sessionToken` (trimmed, must be non-empty) and `context.environment` (must be `'production'`/`'sandbox'`, case-insensitive) itself and rejects with a `MonextError` — see [Errors](#errors) — without a native round-trip if either is invalid.

### `PaymentButton`

```tsx
<PaymentButton
  sessionToken={sessionToken}
  context={context}
  onResult={(result: PaymentSheetResult) => void}
  onError={(error: unknown) => void}
  style={pressableStyle}
  disabled={boolean}
  testID={string}
  accessibilityLabel={string}
>
  {({ disabled, isPresenting }) => content}
</PaymentButton>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `sessionToken` | `string` | no | The button is inactive (tap is a no-op) while empty/unset. |
| `context` | `MnxtSDKContext` | yes | |
| `onResult` | `(result: PaymentSheetResult) => void` | yes | Called when the sheet resolves (completed or dismissed). |
| `onError` | `(error: unknown) => void` | no | Called if `presentPaymentSheet` rejects. **Strongly recommended** in production to avoid silent failure handling (defaults to `console.error`). |
| `children` | `ReactNode \| (state: PaymentButtonRenderProps) => ReactNode` | yes | The button's content or a render prop `({ disabled, isPresenting }) => ReactNode` for loading/disabled UX. |
| `style` | `PressableProps['style']` | no | Forwarded to the underlying `Pressable`. |
| `disabled` | `boolean` | no | Forces the button inactive in addition to the `sessionToken` check. |
| `testID` | `string` | no | Forwarded to the underlying `Pressable`. |
| `accessibilityRole` | `AccessibilityRole` | no | Defaults to `'button'`. |
| `accessibilityState` | `AccessibilityState` | no | Merged with the button state; `disabled` and `busy` always reflect the actual presentation state. |
| `accessibilityLabel` | `string` | no | Forwarded to the underlying `Pressable`. |
| `accessibilityHint` | `string` | no | Forwarded to the underlying `Pressable`. |

While a sheet is being presented, further taps are ignored until it resolves — `presentPaymentSheet` itself rejects with `E_PAYMENT_IN_PROGRESS` for genuinely concurrent calls (e.g. from a second, independent `PaymentButton`). The button updates `accessibilityState={{ disabled: true, busy: true }}` while presenting.

### `MnxtSDKContext`

| Field | Type | Required | Notes |
|---|---|---|---|
| `environment` | `'production' \| 'sandbox'` | yes | Case-insensitive. Rejects with `E_INVALID_ENVIRONMENT` if set to any other value. |
| `config` | `MnxtSDKConfiguration` | no | |
| `appearance` | `Appearance` | no | |
| `googlePayConfiguration` | `GooglePayConfiguration` | no | Android only. |
| `applePayConfiguration` | `ApplePayConfiguration` | no | iOS only. |

### `MnxtSDKConfiguration`

| Field | Type | Notes |
|---|---|---|
| `language` | `string` | e.g. `'FR'`, `'EN'`. |

### `Appearance`

All fields are optional; omitted fields fall back to the native SDK's defaults.

| Field | Type | Notes |
|---|---|---|
| `primaryColor` / `onPrimaryColor` | `string` | Hex color, e.g. `'#0057FF'`. |
| `secondaryColor` / `onSecondaryColor` | `string` | |
| `backgroundColor` / `onBackgroundColor` | `string` | |
| `surfaceColor` / `onSurfaceColor` | `string` | |
| `confirmationColor` / `onConfirmationColor` | `string` | |
| `errorColor` | `string` | |
| `pendingColor` | `string` | **Android only** — no iOS equivalent. |
| `textfieldLabelColor` | `string` | |
| `textfieldTextColor` | `string` | |
| `textfieldBorderColor` | `string` | |
| `textfieldBorderSelectedColor` | `string` | |
| `textfieldBackgroundColor` | `string` | |
| `textfieldAccessoryColor` | `string` | |
| `buttonRadius` | `number` | |
| `cardRadius` | `number` | |
| `textfieldRadius` | `number` | |
| `textfieldStroke` | `number` | |
| `textfieldStrokeSelected` | `number` | |
| `paymentMethodShape` | `PaymentMethodShape` (`'round'` \| `'square'`) | Case-insensitive. Any other value falls back to `'round'`. |
| `headerTitle` | `string` | |
| `headerBackgroundColor` / `onHeaderBackgroundColor` | `string` | |
| `backButtonText` | `string` | |

### `GooglePayConfiguration` (Android)

| Field | Type | Notes |
|---|---|---|
| `theme` | `GooglePayTheme` (`'light'` \| `'dark'`) | Case-insensitive. Any other value falls back to `'dark'`. |
| `type` | `GooglePayButtonType` (`'buy'` \| `'donate'` \| `'book'` \| `'checkout'` \| `'order'` \| `'subscribe'` \| `'pay'` \| `'plain'`) | Case-insensitive. Any other value falls back to `'plain'`. |

### `ApplePayConfiguration` (iOS)

| Field | Type | Notes |
|---|---|---|
| `buttonLabel` | `ApplePayButtonLabel` (`'buy'` \| `'book'` \| `'checkout'` \| `'donate'` \| `'subscribe'` \| `'setup'` \| `'plain'`) | Case-insensitive, `'_'` ignored. Any other value falls back to `'plain'`. |
| `buttonStyle` | `ApplePayButtonStyle` (`'black'` \| `'white'` \| `'whiteOutline'` \| `'whiteoutline'`) | Case-insensitive, `'_'` ignored. Any other value falls back to `'black'`. |

### `PaymentSheetResult`

| Field | Type | Notes |
|---|---|---|
| `result` | `'completed' \| 'dismissed'` | Whether the user completed a flow or dismissed the sheet before finishing. |
| `state` | `PaymentSheetState?` | Native SDK payment state (e.g. `'paymentSuccess'`). |

### `PaymentSheetState`

Canonical union of possible native payment states across Android and iOS:

```ts
export type PaymentSheetState =
  | 'paymentSuccess'
  | 'paymentFailure'
  | 'paymentPending'
  | 'tokenExpired'
  | 'paymentCanceled'
  | 'paymentSheetDismissedByUser'
  | 'paymentIncomplete';
```

| State | Platform | Description |
|---|---|---|
| `'paymentSuccess'` | Both | Payment completed successfully. |
| `'paymentFailure'` | Both | Payment process failed. |
| `'paymentPending'` | Both | Payment is pending asynchronous confirmation. |
| `'tokenExpired'` | Both | The payment session token has expired. |
| `'paymentCanceled'` | Both | Payment was canceled. |
| `'paymentSheetDismissedByUser'` | iOS | Payment sheet was explicitly dismissed by the user (iOS native event). |
| `'paymentIncomplete'` | Android | Payment process is incomplete (**Android only**). |

All types are re-exported from the package entry point alongside `presentPaymentSheet`.

## Errors

`presentPaymentSheet` rejects the returned Promise (instead of resolving) for programmer errors and unrecoverable native failures. Every rejection is a `MonextError` (also passed to `PaymentButton`'s `onError`) exposing the same `{ code, message }` shape regardless of whether it originated in JS or natively. Unknown native failures are normalized to `E_PAYMENT_SHEET`; `code` is one of the exported `MonextErrorCodes`:

| Code | Origin | Meaning |
|---|---|---|
| `E_INVALID_SESSION_TOKEN` | JS | `sessionToken` was empty or whitespace-only, checked before any native call. |
| `E_INVALID_ENVIRONMENT` | JS | `context.environment` was missing or not `'production'`/`'sandbox'` (case-insensitive), checked before any native call. |
| `E_PAYMENT_IN_PROGRESS` | Native (Android + iOS) | A payment sheet is already being presented. |
| `E_NO_ACTIVITY` | Native (Android only) | No host Activity was available to present on. |
| `E_NO_VIEW_CONTROLLER` | Native (iOS only) | No view controller was available to present on. |
| `E_PAYMENT_SHEET` | Native (Android only) | The native payment sheet reported an unrecoverable error. **iOS has no equivalent path today**: a failing iOS payment resolves the Promise with `result: 'completed', state: 'paymentFailure'` instead of rejecting. |

Import `MonextErrorCodes` for typed comparisons instead of hardcoding strings:

```ts
import { presentPaymentSheet, MonextErrorCodes } from 'monext-react-native-sdk';

try {
  await presentPaymentSheet(sessionToken, context);
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === MonextErrorCodes.PAYMENT_IN_PROGRESS) {
    // ...
  }
}
```

## Platform notes

- **Android** — `presentPaymentSheet` launches a dedicated Compose `Activity` (`startActivityForResult`) that renders the native `PaymentSheet(...)`. The Promise resolves/rejects from an `ActivityEventListener` once that Activity finishes.
- **iOS** — `presentPaymentSheet` presents a SwiftUI view wrapped in a `UIHostingController` over the current top view controller. Presentation and the SwiftUI result callback are sequenced to avoid a present/dismiss race.

## Development

This repository includes Jest unit tests for the JS API and `PaymentButton`. The `example-app/`, which depends on this package via `file:..`, is the integration target for manual native testing:

```sh
npm install         # installs deps and builds this package
npm run typecheck   # tsc --noEmit against src/
npm test            # unit tests for the JS API and PaymentButton
npm run android     # runs example-app on Android
npm run ios         # runs example-app on iOS (run `pod install` in example-app/ios first)
npm --prefix example-app test
```

The Android bridge also has JVM unit tests for context parsing, payment-result mapping, cancellation, native errors and the delayed-launch lifecycle guard. For bridge or payment-flow changes, test both platforms manually through `example-app`, including cancellation and error paths, not just the happy path.
