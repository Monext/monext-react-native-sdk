import type { MnxtSDKContext, PaymentSheetState } from '../src/NativeMonextPayment';

jest.mock('../src/NativeMonextPayment', () => ({
  __esModule: true,
  default: {
    presentPaymentSheet: jest.fn(),
  },
}));

import { presentPaymentSheet } from '../src/index';
import NativeMonextPayment from '../src/NativeMonextPayment';
import { MonextError } from '../src/MonextError';

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

  it('rejects a whitespace-only sessionToken with a stable code, without calling native', async () => {
    const error = await presentPaymentSheet('   ', context).catch((e) => e);

    expect(error).toBeInstanceOf(MonextError);
    expect(error.code).toBe('E_INVALID_SESSION_TOKEN');
    expect(error.message).toBe('sessionToken is required');
    expect(mockPresentPaymentSheet).not.toHaveBeenCalled();
  });

  it('trims the sessionToken before delegating to native', async () => {
    mockPresentPaymentSheet.mockResolvedValue({ result: 'completed' });

    await presentPaymentSheet('  token-123  ', context);

    expect(mockPresentPaymentSheet).toHaveBeenCalledWith('token-123', context);
  });

  it.each([undefined, '', 'prod'])(
    'rejects an invalid environment (%p) with a stable code, without calling native',
    async (environment) => {
      const invalidContext = { environment } as unknown as MnxtSDKContext;
      const error = await presentPaymentSheet('token-123', invalidContext).catch((e) => e);

      expect(error).toBeInstanceOf(MonextError);
      expect(error.code).toBe('E_INVALID_ENVIRONMENT');
      expect(mockPresentPaymentSheet).not.toHaveBeenCalled();
    }
  );

  it.each(['production', 'SANDBOX', 'Production'])(
    'accepts a case-insensitive valid environment (%p) and delegates to native',
    async (environment) => {
      mockPresentPaymentSheet.mockResolvedValue({ result: 'completed' });

      await presentPaymentSheet('token-123', { environment } as MnxtSDKContext);

      expect(mockPresentPaymentSheet).toHaveBeenCalledWith('token-123', { environment });
    }
  );
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
