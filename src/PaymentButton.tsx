import React, { useCallback, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import type { MnxtSDKContext, PaymentSheetResult } from './NativeMonextPayment';
import { presentPaymentSheet } from './presentPaymentSheet';

export type PaymentButtonRenderProps = {
  disabled: boolean;
  isPresenting: boolean;
};

export type PaymentButtonProps = {
  /**
   * The sessionId returned when creating a new session via the Monext Retail API.
   * The button is inactive until this is set.
   */
  sessionToken?: string;

  /**
   * Configuration and presentation context for the Monext payment sheet.
   */
  context: MnxtSDKContext;

  /**
   * Callback invoked when the payment sheet completes or is dismissed by the user.
   */
  onResult: (result: PaymentSheetResult) => void;

  /**
   * Callback invoked when presenting the payment sheet fails.
   * Strongly recommended in production to handle failures gracefully (defaults to `console.error`).
   */
  onError?: (error: unknown) => void;

  /**
   * Content of the button. Can be standard React nodes or a render prop `({ disabled, isPresenting }) => ReactNode`.
   */
  children:
    | React.ReactNode
    | ((state: PaymentButtonRenderProps) => React.ReactNode);

  /**
   * Style forwarded to the underlying `Pressable`.
   */
  style?: PressableProps['style'];

  /**
   * Forces the button inactive in addition to the `sessionToken` check.
   */
  disabled?: boolean;

  /**
   * Optional test ID forwarded to the underlying `Pressable`.
   */
  testID?: string;

  /**
   * Optional accessibility role override. Defaults to `'button'`.
   */
  accessibilityRole?: PressableProps['accessibilityRole'];

  /**
   * Optional accessibility state overrides. Merged with `{ disabled, busy: isPresenting }`.
   */
  accessibilityState?: PressableProps['accessibilityState'];

  /**
   * Optional accessibility label forwarded to the underlying `Pressable`.
   */
  accessibilityLabel?: PressableProps['accessibilityLabel'];

  /**
   * Optional accessibility hint forwarded to the underlying `Pressable`.
   */
  accessibilityHint?: PressableProps['accessibilityHint'];
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
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityLabel,
  accessibilityHint,
}: PaymentButtonProps): React.JSX.Element {
  const [isPresenting, setIsPresenting] = useState(false);
  const isPresentingRef = useRef(false);

  const isButtonDisabled = Boolean(disabled || !sessionToken || isPresenting);

  const handlePress = useCallback(() => {
    if (!sessionToken || isPresentingRef.current) {
      return;
    }

    isPresentingRef.current = true;
    setIsPresenting(true);

    presentPaymentSheet(sessionToken, context)
      .then(onResult)
      .catch((error: unknown) => {
        if (onError) {
          onError(error);
        } else {
          console.error(
            '[MonextPayment] PaymentButton failed to present the payment sheet',
            error
          );
        }
      })
      .finally(() => {
        isPresentingRef.current = false;
        setIsPresenting(false);
      });
  }, [sessionToken, context, onResult, onError]);

  const renderedChildren =
    typeof children === 'function'
      ? children({ disabled: isButtonDisabled, isPresenting })
      : children;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        ...accessibilityState,
        disabled: isButtonDisabled,
        busy: isPresenting,
      }}
      disabled={isButtonDisabled}
      onPress={handlePress}
      style={style}
      testID={testID}
    >
      {renderedChildren}
    </Pressable>
  );
}
