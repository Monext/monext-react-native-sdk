package com.monext.reactnative

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier

class MonextPaymentActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val sessionToken = intent.getStringExtra(MonextPaymentModule.EXTRA_SESSION_TOKEN).orEmpty()
    if (sessionToken.isBlank()) {
      finishWithError("Missing sessionToken")
      return
    }

    val contextBundle = intent.getBundleExtra(MonextPaymentModule.EXTRA_CONTEXT)

    setContent {
      var showPaymentSheet by rememberSaveable { mutableStateOf(true) }

      Box(modifier = Modifier.fillMaxSize()) {
        MonextNativePaymentSheet(
          showPaymentSheet = showPaymentSheet,
          sessionToken = sessionToken,
          contextBundle = contextBundle,
          onResult = { result ->
            showPaymentSheet = false
            finishWithResult(result)
          }
        )
      }
    }
  }

  private fun finishWithResult(result: MonextPaymentSheetResult) {
    setResult(
      Activity.RESULT_OK,
      Intent().apply {
        putExtra(MonextPaymentModule.EXTRA_RESULT, result.result)
        putExtra(MonextPaymentModule.EXTRA_STATE, result.state)
      }
    )
    finish()
  }

  private fun finishWithError(message: String) {
    setResult(
      Activity.RESULT_FIRST_USER,
      Intent().putExtra(MonextPaymentModule.EXTRA_ERROR, message)
    )
    finish()
  }
}
