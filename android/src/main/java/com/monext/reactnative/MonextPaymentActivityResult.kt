package com.monext.reactnative

import android.app.Activity

internal sealed interface MonextPaymentActivityOutcome {
    data class Resolved(val result: String, val state: String?) : MonextPaymentActivityOutcome
    data class Rejected(val message: String) : MonextPaymentActivityOutcome
}

internal fun mapPaymentActivityResult(
    resultCode: Int,
    result: String?,
    state: String?,
    errorMessage: String?
): MonextPaymentActivityOutcome {
    return when {
        resultCode == Activity.RESULT_CANCELED -> {
            MonextPaymentActivityOutcome.Resolved("dismissed", "paymentCanceled")
        }
        resultCode != Activity.RESULT_OK -> {
            MonextPaymentActivityOutcome.Rejected(errorMessage ?: "Payment sheet failed")
        }
        else -> MonextPaymentActivityOutcome.Resolved(result ?: "unknown", state)
    }
}

internal fun canLaunchPaymentActivity(isFinishing: Boolean, isDestroyed: Boolean): Boolean {
    return !isFinishing && !isDestroyed
}
