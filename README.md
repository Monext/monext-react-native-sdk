# monext-react-native-sdk

React Native library exposing the Monext native payment sheet on Android and iOS through a TurboModule.

## Install

```sh
npm install monext-react-native-sdk
```

Enable the New Architecture in the host React Native app because this module is implemented as a TurboModule.

## Native SDK dependencies

Add the Monext Android SDK dependency to the host app or expose it to this library with Gradle:

```properties
# android/gradle.properties in the host app
MonextSdkDependency=com.monext:payment-sheet:<version>
```

If the SDK uses a private Maven repository, add that repository in the host app `android/build.gradle` or `settings.gradle`.

For iOS, the podspec registers the Monext Swift package automatically with React Native's SPM integration:

```
https://github.com/Monext/monext-ios-sdk-spm
```

Run `pod install` in the host application's `ios` directory. It resolves the `Monext` product at version `1.0.7-1` (the package release tag for SDK 1.0.7), including its 3DS dependency. The SDK requires iOS 16 or later.

The iOS bridge supports `environment`, `config.language`, `applePayConfiguration`, and all React Native `Appearance` fields that exist in the iOS SDK. `pendingColor` is Android-only; SwiftUI image fields are not serializable from JavaScript.

## Usage

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

## API

```ts
presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult>
```

The Android implementation opens a native Compose Activity; iOS presents the SwiftUI payment sheet. Both resolve the Promise when the native SDK returns a result.
