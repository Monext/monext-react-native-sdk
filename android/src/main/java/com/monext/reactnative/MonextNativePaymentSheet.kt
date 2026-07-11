package com.monext.reactnative

import android.os.Bundle
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.Dp
import com.monext.sdk.PaymentSheet
import com.monext.sdk.MnxtSDKContext
import com.monext.sdk.MnxtEnvironment
import com.monext.sdk.PaymentResult
import com.monext.sdk.Appearance
import com.monext.sdk.Appearance.PaymentMethodShape
import com.monext.sdk.MnxtSDKConfiguration
import com.monext.sdk.GooglePayConfiguration
import com.google.pay.button.ButtonTheme
import com.google.pay.button.ButtonType

data class MonextPaymentSheetResult(
    val result: String,
    val state: String? = null
)

@Composable
internal fun MonextNativePaymentSheet(
    showPaymentSheet: Boolean,
    sessionToken: String,
    contextBundle: Bundle?,
    onResult: (MonextPaymentSheetResult) -> Unit
) {
    if (!showPaymentSheet) {
        return
    }

    val environmentStr = contextBundle?.getString("environment")
    val environment = if (environmentStr?.equals("production", ignoreCase = true) == true) {
        MnxtEnvironment.Production
    } else {
        MnxtEnvironment.Sandbox
    }

    // Config
    val configBundle = contextBundle?.getBundle("config")
    val config = if (configBundle != null) {
        MnxtSDKConfiguration(
            language = configBundle.getString("language") ?: "FR"
        )
    } else {
        MnxtSDKConfiguration()
    }

    // Appearance
    val appearanceBundle = contextBundle?.getBundle("appearance")
    val defaultAppearance = Appearance()
    val appearance = if (appearanceBundle != null) {
        Appearance(
            primaryColor = parseColor(appearanceBundle, "primaryColor") ?: defaultAppearance.primaryColor,
            onPrimaryColor = parseColor(appearanceBundle, "onPrimaryColor") ?: defaultAppearance.onPrimaryColor,
            secondaryColor = parseColor(appearanceBundle, "secondaryColor") ?: defaultAppearance.secondaryColor,
            onSecondaryColor = parseColor(appearanceBundle, "onSecondaryColor") ?: defaultAppearance.onSecondaryColor,
            backgroundColor = parseColor(appearanceBundle, "backgroundColor") ?: defaultAppearance.backgroundColor,
            onBackgroundColor = parseColor(appearanceBundle, "onBackgroundColor") ?: defaultAppearance.onBackgroundColor,
            surfaceColor = parseColor(appearanceBundle, "surfaceColor") ?: defaultAppearance.surfaceColor,
            onSurfaceColor = parseColor(appearanceBundle, "onSurfaceColor") ?: defaultAppearance.onSurfaceColor,
            confirmationColor = parseColor(appearanceBundle, "confirmationColor") ?: defaultAppearance.confirmationColor,
            onConfirmationColor = parseColor(appearanceBundle, "onConfirmationColor") ?: defaultAppearance.onConfirmationColor,
            errorColor = parseColor(appearanceBundle, "errorColor") ?: defaultAppearance.errorColor,
            pendingColor = parseColor(appearanceBundle, "pendingColor") ?: defaultAppearance.pendingColor,

            textfieldLabelColor = parseColor(appearanceBundle, "textfieldLabelColor"),
            textfieldTextColor = parseColor(appearanceBundle, "textfieldTextColor"),
            textfieldBorderColor = parseColor(appearanceBundle, "textfieldBorderColor"),
            textfieldBorderSelectedColor = parseColor(appearanceBundle, "textfieldBorderSelectedColor"),
            textfieldBackgroundColor = parseColor(appearanceBundle, "textfieldBackgroundColor"),
            textfieldAccessoryColor = parseColor(appearanceBundle, "textfieldAccessoryColor"),

            buttonRadius = parseDp(appearanceBundle, "buttonRadius") ?: defaultAppearance.buttonRadius,
            cardRadius = parseDp(appearanceBundle, "cardRadius") ?: defaultAppearance.cardRadius,
            textfieldRadius = parseDp(appearanceBundle, "textfieldRadius") ?: defaultAppearance.textfieldRadius,
            textfieldStroke = parseDp(appearanceBundle, "textfieldStroke") ?: defaultAppearance.textfieldStroke,
            textfieldStrokeSelected = parseDp(appearanceBundle, "textfieldStrokeSelected") ?: defaultAppearance.textfieldStrokeSelected,
            paymentMethodShape = parsePaymentMethodShape(appearanceBundle, "paymentMethodShape") ?: defaultAppearance.paymentMethodShape,

            headerTitle = appearanceBundle.getString("headerTitle"),
            headerBackgroundColor = parseColor(appearanceBundle, "headerBackgroundColor") ?: defaultAppearance.headerBackgroundColor,
            onHeaderBackgroundColor = parseColor(appearanceBundle, "onHeaderBackgroundColor") ?: defaultAppearance.onHeaderBackgroundColor,

            backButtonText = appearanceBundle.getString("backButtonText")
        )
    } else {
        defaultAppearance
    }

    // Google Pay
    val gpayBundle = contextBundle?.getBundle("googlePayConfiguration")
    val googlePayConfiguration = if (gpayBundle != null) {
        GooglePayConfiguration(
            theme = parseGooglePayTheme(gpayBundle.getString("theme")),
            type = parseGooglePayType(gpayBundle.getString("type"))
        )
    } else {
        GooglePayConfiguration()
    }

    PaymentSheet(
        showPaymentSheet, sessionToken ?: "",
        sdkContext = MnxtSDKContext(
            environment = environment,
            config = config,
            appearance = appearance,
            googlePayConfiguration = googlePayConfiguration
        ),
        onResult = { result ->
            val resultObj = when (result) {
                is PaymentResult.SheetDismissed -> MonextPaymentSheetResult(result = "dismissed", state = result.currentState?.toString())
                is PaymentResult.PaymentCompleted -> MonextPaymentSheetResult(result = "completed", state = result.finalState?.toString())
            }
            onResult(resultObj)
        }
    )
}

private fun parseColor(bundle: Bundle?, key: String): Color? {
    val hex = bundle?.getString(key) ?: return null
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (e: Exception) {
        null
    }
}

private fun parseDp(bundle: Bundle?, key: String): Dp? {
    if (bundle == null || !bundle.containsKey(key)) return null
    val value = try {
        bundle.getDouble(key)
    } catch (e: Exception) {
        try {
            bundle.getFloat(key).toDouble()
        } catch (ex: Exception) {
            null
        }
    } ?: return null
    return value.toFloat().dp
}

private fun parsePaymentMethodShape(bundle: Bundle?, key: String): PaymentMethodShape? {
    val value = bundle?.getString(key) ?: return null
    return try {
        PaymentMethodShape.valueOf(value.uppercase())
    } catch (e: Exception) {
        null
    }
}

private fun parseGooglePayTheme(value: String?): ButtonTheme {
    return when (value?.lowercase()) {
        "light" -> ButtonTheme.Light
        else -> ButtonTheme.Dark
    }
}

private fun parseGooglePayType(value: String?): ButtonType {
    return when (value?.lowercase()) {
        "buy" -> ButtonType.Buy
        "donate" -> ButtonType.Donate
        "book" -> ButtonType.Book
        "checkout" -> ButtonType.Checkout
        "order" -> ButtonType.Order
        "subscribe" -> ButtonType.Subscribe
        "pay" -> ButtonType.Pay
        else -> ButtonType.Plain
    }
}
