package com.monext.reactnative

import com.monext.sdk.PaymentResult

internal fun mapTransactionState(state: PaymentResult.TransactionState?): String? {
    return when (state) {
        PaymentResult.TransactionState.PAYMENT_SUCCESS -> "paymentSuccess"
        PaymentResult.TransactionState.PAYMENT_FAILURE -> "paymentFailure"
        PaymentResult.TransactionState.PAYMENT_PENDING -> "paymentPending"
        PaymentResult.TransactionState.TOKEN_EXPIRED -> "tokenExpired"
        PaymentResult.TransactionState.PAYMENT_CANCELED -> "paymentCanceled"
        PaymentResult.TransactionState.PAYMENT_INCOMPLETE -> "paymentIncomplete"
        null -> null
    }
}
