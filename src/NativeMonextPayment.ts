import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type MnxtSDKConfiguration = {
  language?: string;
};

export type Appearance = {
  primaryColor?: string;
  onPrimaryColor?: string;
  secondaryColor?: string;
  onSecondaryColor?: string;
  backgroundColor?: string;
  onBackgroundColor?: string;
  surfaceColor?: string;
  onSurfaceColor?: string;
  confirmationColor?: string;
  onConfirmationColor?: string;
  errorColor?: string;
  pendingColor?: string;
  textfieldLabelColor?: string;
  textfieldTextColor?: string;
  textfieldBorderColor?: string;
  textfieldBorderSelectedColor?: string;
  textfieldBackgroundColor?: string;
  textfieldAccessoryColor?: string;
  buttonRadius?: number;
  cardRadius?: number;
  textfieldRadius?: number;
  textfieldStroke?: number;
  textfieldStrokeSelected?: number;
  paymentMethodShape?: string; // "ROUND" | "SQUARE"
  headerTitle?: string;
  headerBackgroundColor?: string;
  onHeaderBackgroundColor?: string;
  backButtonText?: string;
};

export type GooglePayConfiguration = {
  theme?: string; // e.g. "Dark", "Light"
  type?: string;  // e.g. "Plain", "Buy"
};

export type ApplePayConfiguration = {
  buttonLabel?: string; // e.g. "plain", "buy", "checkout"
  buttonStyle?: string; // "black" | "white" | "whiteOutline"
};

export type MnxtSDKContext = {
  environment: string;
  config?: MnxtSDKConfiguration;
  appearance?: Appearance;
  googlePayConfiguration?: GooglePayConfiguration;
  applePayConfiguration?: ApplePayConfiguration;
};

export type PaymentSheetResult = {
  result: 'completed' | 'dismissed';
  state?: string;
};

export interface Spec extends TurboModule {
  presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MonextPayment');
