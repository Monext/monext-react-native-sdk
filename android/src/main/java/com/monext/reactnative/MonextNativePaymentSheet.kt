package com.monext.reactnative

import androidx.compose.runtime.Composable
import com.monext.sdk.MnxtSDKContext
import com.monext.sdk.PaymentResult
import com.monext.sdk.PaymentSheet

data class MonextPaymentSheetResult(
    val result: String,
    val state: String? = null
)

@Composable
internal fun MonextNativePaymentSheet(
    showPaymentSheet: Boolean,
    sessionToken: String,
    sdkContext: MnxtSDKContext,
    onResult: (MonextPaymentSheetResult) -> Unit
) {
    if (!showPaymentSheet) {
        return
    }

    PaymentSheet(
        showPaymentSheet, sessionToken,
        sdkContext = sdkContext,
        onResult = { result ->
            val resultObj = when (result) {
                is PaymentResult.SheetDismissed -> MonextPaymentSheetResult(result = "dismissed", state = mapTransactionState(result.currentState))
                is PaymentResult.PaymentCompleted -> MonextPaymentSheetResult(result = "completed", state = mapTransactionState(result.finalState))
            }
            onResult(resultObj)
        }
    )
}
