package com.monext.reactnative

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = MonextPaymentModule.NAME)
class MonextPaymentModule(
  private val reactContext: ReactApplicationContext
) : NativeMonextPaymentSpec(reactContext) {
  private var pendingPromise: Promise? = null

  private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(
      activity: Activity,
      requestCode: Int,
      resultCode: Int,
      data: Intent?
    ) {
      if (requestCode != REQUEST_PAYMENT_SHEET) {
        return
      }

      val promise = pendingPromise ?: return
      pendingPromise = null

      if (resultCode == Activity.RESULT_CANCELED) {
        promise.resolve(
          WritableNativeMap().apply {
            putString("status", "cancelled")
          }
        )
        return
      }

      if (resultCode != Activity.RESULT_OK) {
        promise.reject("E_PAYMENT_SHEET", data?.getStringExtra(EXTRA_ERROR) ?: "Payment sheet failed")
        return
      }

      promise.resolve(
        WritableNativeMap().apply {
          putString("result", data?.getStringExtra(EXTRA_RESULT) ?: "unknown")
          data?.getStringExtra(EXTRA_STATE)?.let { putString("state", it) }
        }
      )
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = NAME

  override fun presentPaymentSheet(sessionToken: String, context: ReadableMap, promise: Promise) {
    if (pendingPromise != null) {
      promise.reject("E_PAYMENT_IN_PROGRESS", "A Monext payment sheet is already open")
      return
    }

    val activity = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No Android Activity is available")
      return
    }

    if (sessionToken.isNullOrBlank()) {
      promise.reject("E_INVALID_SESSION_TOKEN", "sessionToken is required")
      return
    }

    val contextBundle = context?.let { com.facebook.react.bridge.Arguments.toBundle(it) }
    pendingPromise = promise

    val intent = Intent(activity, MonextPaymentActivity::class.java).apply {
      putExtra(EXTRA_SESSION_TOKEN, sessionToken)
      putExtra(EXTRA_CONTEXT, contextBundle)
    }

    activity.startActivityForResult(intent, REQUEST_PAYMENT_SHEET)
  }

  private fun ReadableMap?.getOptionalString(key: String): String? {
    if (this == null || !hasKey(key) || isNull(key)) {
      return null
    }

    return getString(key)
  }

  companion object {
    const val NAME = "MonextPayment"
    const val REQUEST_PAYMENT_SHEET = 42101
    const val EXTRA_SESSION_TOKEN = "com.monext.reactnative.SESSION_TOKEN"
    const val EXTRA_CONTEXT = "com.monext.reactnative.CONTEXT"
    const val EXTRA_RESULT = "com.monext.reactnative.RESULT"
    const val EXTRA_STATE = "com.monext.reactnative.STATE"
    const val EXTRA_ERROR = "com.monext.reactnative.ERROR"
  }
}
