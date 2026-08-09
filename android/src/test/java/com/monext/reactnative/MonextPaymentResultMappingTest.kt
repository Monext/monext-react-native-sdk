package com.monext.reactnative

import com.monext.sdk.PaymentResult
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class MonextPaymentResultMappingTest {

    @Test
    fun `mapTransactionState returns null when state is null`() {
        assertNull(mapTransactionState(null))
    }

    @Test
    fun `mapTransactionState maps PAYMENT_SUCCESS to paymentSuccess`() {
        assertEquals("paymentSuccess", mapTransactionState(PaymentResult.TransactionState.PAYMENT_SUCCESS))
    }

    @Test
    fun `mapTransactionState maps PAYMENT_FAILURE to paymentFailure`() {
        assertEquals("paymentFailure", mapTransactionState(PaymentResult.TransactionState.PAYMENT_FAILURE))
    }

    @Test
    fun `mapTransactionState maps PAYMENT_PENDING to paymentPending`() {
        assertEquals("paymentPending", mapTransactionState(PaymentResult.TransactionState.PAYMENT_PENDING))
    }

    @Test
    fun `mapTransactionState maps TOKEN_EXPIRED to tokenExpired`() {
        assertEquals("tokenExpired", mapTransactionState(PaymentResult.TransactionState.TOKEN_EXPIRED))
    }

    @Test
    fun `mapTransactionState maps PAYMENT_CANCELED to paymentCanceled`() {
        assertEquals("paymentCanceled", mapTransactionState(PaymentResult.TransactionState.PAYMENT_CANCELED))
    }

    @Test
    fun `mapTransactionState maps PAYMENT_INCOMPLETE to paymentIncomplete`() {
        assertEquals("paymentIncomplete", mapTransactionState(PaymentResult.TransactionState.PAYMENT_INCOMPLETE))
    }

    @Test
    fun `all TransactionState enum entries are explicitly mapped`() {
        for (enumState in PaymentResult.TransactionState.entries) {
            val mapped = mapTransactionState(enumState)
            org.junit.jupiter.api.Assertions.assertNotNull(
                mapped,
                "TransactionState $enumState should map to a non-null camelCase string"
            )
        }
    }
}
