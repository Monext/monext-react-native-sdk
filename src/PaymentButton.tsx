import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import NativeMonextPayment, {
  type MnxtSDKContext,
  type PaymentSheetResult,
} from './NativeMonextPayment';

export type PaymentButtonProps = {
  // The sessionId returned when creating a new session via the Monext Retail API. The button is inactive until this is set.
  sessionToken?: string;
  context: MnxtSDKContext;
  onResult: (result: PaymentSheetResult) => void;
  onError?: (error: unknown) => void;
  children: React.ReactNode;
  style?: PressableProps['style'];
  disabled?: boolean;
  testID?: string;
};

export function PaymentButton({
  sessionToken,
  context,
  onResult,
  onError,
  children,
  style,
  disabled,
  testID,
}: PaymentButtonProps): React.JSX.Element {
  const [isPresenting, setIsPresenting] = useState(false);

  const handlePress = useCallback(() => {
    if (!sessionToken || isPresenting) {
      return;
    }

    setIsPresenting(true);
    NativeMonextPayment.presentPaymentSheet(sessionToken, context)
      .then(onResult)
      .catch((error: unknown) => {
        if (onError) {
          onError(error);
        } else {
          console.error('[MonextPayment] PaymentButton failed to present the payment sheet', error);
        }
      })
      .finally(() => setIsPresenting(false));
  }, [sessionToken, context, isPresenting, onResult, onError]);

  return (
    <Pressable
      disabled={disabled || !sessionToken || isPresenting}
      onPress={handlePress}
      style={style}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}
