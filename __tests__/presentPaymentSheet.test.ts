import type { MnxtSDKContext, PaymentSheetState } from '../src/NativeMonextPayment';

jest.mock('../src/NativeMonextPayment', () => ({
  __esModule: true,
  default: {
    presentPaymentSheet: jest.fn(),
  },
}));

import { presentPaymentSheet } from '../src/index';
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

describe('presentPaymentSheet validation', () => {
  it('rejects without calling the native module for falsy sessionToken values', async () => {
    for (const sessionToken of ['', undefined, null] as const) {
      await expect(
        presentPaymentSheet(sessionToken as unknown as string, context)
      ).rejects.toThrow('sessionToken is required');
    }

    expect(mockPresentPaymentSheet).not.toHaveBeenCalled();
  });
});

describe('presentPaymentSheet delegation', () => {
  it('calls the native module with the exact sessionToken and context', async () => {
    const result = { result: 'completed' as const };
    mockPresentPaymentSheet.mockResolvedValue(result);

    const resolved = await presentPaymentSheet('token-123', context);

    expect(mockPresentPaymentSheet).toHaveBeenCalledTimes(1);
    expect(mockPresentPaymentSheet).toHaveBeenCalledWith('token-123', context);
    expect(resolved).toBe(result);
  });

  it('propagates a native rejection unchanged', async () => {
    const error = new Error('E_INVALID_ENVIRONMENT');
    mockPresentPaymentSheet.mockRejectedValue(error);

    await expect(presentPaymentSheet('token-123', context)).rejects.toBe(
      error
    );
  });
});

describe('presentPaymentSheet PaymentSheetState passthrough', () => {
  it.each(ALL_PAYMENT_SHEET_STATES)(
    'delivers state %s unchanged',
    async (state) => {
      const nativeResult = { result: 'completed' as const, state };
      mockPresentPaymentSheet.mockResolvedValue(nativeResult);

      const resolved = await presentPaymentSheet('token-123', context);

      expect(resolved).toEqual(nativeResult);
      expect(resolved.state).toBe(state);
    }
  );
});
