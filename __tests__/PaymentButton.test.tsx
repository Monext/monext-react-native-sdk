import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { MnxtSDKContext, PaymentSheetState } from '../src/NativeMonextPayment';

jest.mock('../src/NativeMonextPayment', () => ({
  __esModule: true,
  default: {
    presentPaymentSheet: jest.fn(),
  },
}));

import { PaymentButton } from '../src/PaymentButton';
import NativeMonextPayment from '../src/NativeMonextPayment';

const mockPresentPaymentSheet =
  NativeMonextPayment.presentPaymentSheet as jest.Mock;

const context: MnxtSDKContext = { environment: 'sandbox' };

const ALL_PAYMENT_SHEET_STATES: PaymentSheetState[] = [
  'paymentSuccess',
  'paymentFailure',
  'paymentPending',
  'tokenExpired',
  'paymentCanceled',
  'paymentSheetDismissedByUser',
  'paymentIncomplete',
];

beforeEach(() => {
  mockPresentPaymentSheet.mockReset();
});

function findPressable(root: ReactTestRenderer.ReactTestRenderer): ReactTestInstance {
  return root.root.find((node) => {
    if (typeof node.type !== 'function' && typeof node.type !== 'object') {
      return false;
    }
    const type = node.type as { displayName?: string; name?: string };
    return type.displayName === 'Pressable' || type.name === 'Pressable';
  });
}

function press(root: ReactTestRenderer.ReactTestRenderer): void {
  const pressable = findPressable(root);
  act(() => {
    pressable.props.onPress();
  });
}

describe('PaymentButton disabled state', () => {
  it('is disabled when sessionToken is missing, even with disabled={false}', () => {
    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton context={context} disabled={false} onResult={jest.fn()}>
          Pay
        </PaymentButton>
      );
    });

    expect(findPressable(root).props.disabled).toBe(true);
    expect(findPressable(root).props.accessibilityState.disabled).toBe(true);
  });

  it('is disabled when disabled={true}, regardless of sessionToken', () => {
    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton
          context={context}
          sessionToken="token-123"
          disabled={true}
          onResult={jest.fn()}
        >
          Pay
        </PaymentButton>
      );
    });

    expect(findPressable(root).props.disabled).toBe(true);
  });

  it('is enabled when sessionToken is set and disabled is not forced', () => {
    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton context={context} sessionToken="token-123" onResult={jest.fn()}>
          Pay
        </PaymentButton>
      );
    });

    expect(findPressable(root).props.disabled).toBe(false);
  });

  it('does not allow accessibilityState to override disabled or busy', () => {
    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton
          context={context}
          disabled={true}
          accessibilityState={{ disabled: false, busy: false }}
          onResult={jest.fn()}
        >
          Pay
        </PaymentButton>
      );
    });

    expect(findPressable(root).props.accessibilityState).toMatchObject({
      disabled: true,
      busy: false,
    });
  });
});

describe('PaymentButton in-flight state', () => {
  it('disables the button and sets busy while presenting, then resets on success', async () => {
    let resolvePresent!: (value: { result: 'completed' }) => void;
    mockPresentPaymentSheet.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePresent = resolve;
        })
    );

    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton context={context} sessionToken="token-123" onResult={jest.fn()}>
          Pay
        </PaymentButton>
      );
    });

    press(root);

    expect(findPressable(root).props.disabled).toBe(true);
    expect(findPressable(root).props.accessibilityState.busy).toBe(true);

    await act(async () => {
      resolvePresent({ result: 'completed' });
      await Promise.resolve();
    });

    expect(findPressable(root).props.disabled).toBe(false);
    expect(findPressable(root).props.accessibilityState.busy).toBe(false);
  });

  it('resets the in-flight state after a rejection too', async () => {
    let rejectPresent!: (error: unknown) => void;
    mockPresentPaymentSheet.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPresent = reject;
        })
    );

    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton
          context={context}
          sessionToken="token-123"
          onResult={jest.fn()}
          onError={jest.fn()}
        >
          Pay
        </PaymentButton>
      );
    });

    press(root);
    expect(findPressable(root).props.accessibilityState.busy).toBe(true);

    await act(async () => {
      rejectPresent(new Error('boom'));
      await Promise.resolve();
    });

    expect(findPressable(root).props.disabled).toBe(false);
    expect(findPressable(root).props.accessibilityState.busy).toBe(false);
  });

  it('ignores a second press while already presenting (re-entrancy guard)', () => {
    mockPresentPaymentSheet.mockImplementation(() => new Promise(() => {}));

    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton context={context} sessionToken="token-123" onResult={jest.fn()}>
          Pay
        </PaymentButton>
      );
    });

    press(root);
    press(root);

    expect(mockPresentPaymentSheet).toHaveBeenCalledTimes(1);
  });
});

describe('PaymentButton onResult / PaymentSheetState passthrough', () => {
  it.each(ALL_PAYMENT_SHEET_STATES)(
    'calls onResult with state %s unchanged',
    async (state) => {
      const nativeResult = { result: 'completed' as const, state };
      mockPresentPaymentSheet.mockResolvedValue(nativeResult);
      const onResult = jest.fn();

      let root!: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        root = ReactTestRenderer.create(
          <PaymentButton context={context} sessionToken="token-123" onResult={onResult}>
            Pay
          </PaymentButton>
        );
      });

      await act(async () => {
        press(root);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(onResult).toHaveBeenCalledWith(nativeResult);
    }
  );
});

describe('PaymentButton onError', () => {
  it('calls onError when presenting fails and onError is provided', async () => {
    const error = new Error('native failure');
    mockPresentPaymentSheet.mockRejectedValue(error);
    const onError = jest.fn();

    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton
          context={context}
          sessionToken="token-123"
          onResult={jest.fn()}
          onError={onError}
        >
          Pay
        </PaymentButton>
      );
    });

    await act(async () => {
      press(root);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('falls back to console.error when onError is not provided', async () => {
    const error = new Error('native failure');
    mockPresentPaymentSheet.mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    let root!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <PaymentButton context={context} sessionToken="token-123" onResult={jest.fn()}>
          Pay
        </PaymentButton>
      );
    });

    await act(async () => {
      press(root);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[MonextPayment] PaymentButton failed to present the payment sheet',
      error
    );

    consoleErrorSpy.mockRestore();
  });
});
