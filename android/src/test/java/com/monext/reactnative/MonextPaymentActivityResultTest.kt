package com.monext.reactnative

import android.app.Activity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class MonextPaymentActivityResultTest {

    @Test
    fun `a cancellation resolves as a dismissed payment`() {
        assertEquals(
            MonextPaymentActivityOutcome.Resolved("dismissed", "paymentCanceled"),
            mapPaymentActivityResult(Activity.RESULT_CANCELED, "completed", "paymentSuccess", null)
        )
    }

    @Test
    fun `a payment activity error preserves its message`() {
        assertEquals(
            MonextPaymentActivityOutcome.Rejected("Invalid payment context"),
            mapPaymentActivityResult(Activity.RESULT_FIRST_USER, null, null, "Invalid payment context")
        )
    }

    @Test
    fun `a successful result preserves result and state`() {
        assertEquals(
            MonextPaymentActivityOutcome.Resolved("completed", "paymentPending"),
            mapPaymentActivityResult(Activity.RESULT_OK, "completed", "paymentPending", null)
        )
    }

    @Test
    fun `an activity cannot launch once it is finishing or destroyed`() {
        assertTrue(canLaunchPaymentActivity(isFinishing = false, isDestroyed = false))
        assertFalse(canLaunchPaymentActivity(isFinishing = true, isDestroyed = false))
        assertFalse(canLaunchPaymentActivity(isFinishing = false, isDestroyed = true))
    }
}
