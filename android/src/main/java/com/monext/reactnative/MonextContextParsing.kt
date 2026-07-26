package com.monext.reactnative

import android.os.Bundle
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.google.pay.button.ButtonTheme
import com.google.pay.button.ButtonType
import com.monext.sdk.Appearance
import com.monext.sdk.Appearance.PaymentMethodShape
import com.monext.sdk.GooglePayConfiguration
import com.monext.sdk.MnxtEnvironment
import com.monext.sdk.MnxtSDKConfiguration

internal object MonextBundleKeys {
    const val ENVIRONMENT = "environment"
    const val CONFIG = "config"
    const val LANGUAGE = "language"
    const val APPEARANCE = "appearance"
    const val PRIMARY_COLOR = "primaryColor"
    const val ON_PRIMARY_COLOR = "onPrimaryColor"
    const val SECONDARY_COLOR = "secondaryColor"
    const val ON_SECONDARY_COLOR = "onSecondaryColor"
    const val BACKGROUND_COLOR = "backgroundColor"
    const val ON_BACKGROUND_COLOR = "onBackgroundColor"
    const val SURFACE_COLOR = "surfaceColor"
    const val ON_SURFACE_COLOR = "onSurfaceColor"
    const val CONFIRMATION_COLOR = "confirmationColor"
    const val ON_CONFIRMATION_COLOR = "onConfirmationColor"
    const val ERROR_COLOR = "errorColor"
    const val PENDING_COLOR = "pendingColor"
    const val TEXTFIELD_LABEL_COLOR = "textfieldLabelColor"
    const val TEXTFIELD_TEXT_COLOR = "textfieldTextColor"
    const val TEXTFIELD_BORDER_COLOR = "textfieldBorderColor"
    const val TEXTFIELD_BORDER_SELECTED_COLOR = "textfieldBorderSelectedColor"
    const val TEXTFIELD_BACKGROUND_COLOR = "textfieldBackgroundColor"
    const val TEXTFIELD_ACCESSORY_COLOR = "textfieldAccessoryColor"
    const val BUTTON_RADIUS = "buttonRadius"
    const val CARD_RADIUS = "cardRadius"
    const val TEXTFIELD_RADIUS = "textfieldRadius"
    const val TEXTFIELD_STROKE = "textfieldStroke"
    const val TEXTFIELD_STROKE_SELECTED = "textfieldStrokeSelected"
    const val PAYMENT_METHOD_SHAPE = "paymentMethodShape"
    const val HEADER_TITLE = "headerTitle"
    const val HEADER_BACKGROUND_COLOR = "headerBackgroundColor"
    const val ON_HEADER_BACKGROUND_COLOR = "onHeaderBackgroundColor"
    const val BACK_BUTTON_TEXT = "backButtonText"
    const val GOOGLE_PAY_CONFIGURATION = "googlePayConfiguration"
    const val GOOGLE_PAY_THEME = "theme"
    const val GOOGLE_PAY_TYPE = "type"
}

internal fun isValidEnvironment(value: String?): Boolean {
    return value == null ||
        value.equals("production", ignoreCase = true) ||
        value.equals("sandbox", ignoreCase = true)
}

internal fun parseEnvironment(contextBundle: Bundle?): MnxtEnvironment {
    val environmentStr = contextBundle?.getString(MonextBundleKeys.ENVIRONMENT)
    return if (environmentStr?.equals("production", ignoreCase = true) == true) {
        MnxtEnvironment.Production
    } else {
        MnxtEnvironment.Sandbox
    }
}

internal fun parseConfig(contextBundle: Bundle?): MnxtSDKConfiguration {
    val configBundle = contextBundle?.getBundle(MonextBundleKeys.CONFIG)
        ?: return MnxtSDKConfiguration()

    return MnxtSDKConfiguration(
        language = configBundle.getString(MonextBundleKeys.LANGUAGE) ?: "FR"
    )
}

internal fun parseAppearance(contextBundle: Bundle?): Appearance {
    val appearanceBundle = contextBundle?.getBundle(MonextBundleKeys.APPEARANCE)
        ?: return Appearance()

    val defaultAppearance = Appearance()
    return Appearance(
        primaryColor = parseColor(appearanceBundle, MonextBundleKeys.PRIMARY_COLOR) ?: defaultAppearance.primaryColor,
        onPrimaryColor = parseColor(appearanceBundle, MonextBundleKeys.ON_PRIMARY_COLOR) ?: defaultAppearance.onPrimaryColor,
        secondaryColor = parseColor(appearanceBundle, MonextBundleKeys.SECONDARY_COLOR) ?: defaultAppearance.secondaryColor,
        onSecondaryColor = parseColor(appearanceBundle, MonextBundleKeys.ON_SECONDARY_COLOR) ?: defaultAppearance.onSecondaryColor,
        backgroundColor = parseColor(appearanceBundle, MonextBundleKeys.BACKGROUND_COLOR) ?: defaultAppearance.backgroundColor,
        onBackgroundColor = parseColor(appearanceBundle, MonextBundleKeys.ON_BACKGROUND_COLOR) ?: defaultAppearance.onBackgroundColor,
        surfaceColor = parseColor(appearanceBundle, MonextBundleKeys.SURFACE_COLOR) ?: defaultAppearance.surfaceColor,
        onSurfaceColor = parseColor(appearanceBundle, MonextBundleKeys.ON_SURFACE_COLOR) ?: defaultAppearance.onSurfaceColor,
        confirmationColor = parseColor(appearanceBundle, MonextBundleKeys.CONFIRMATION_COLOR) ?: defaultAppearance.confirmationColor,
        onConfirmationColor = parseColor(appearanceBundle, MonextBundleKeys.ON_CONFIRMATION_COLOR) ?: defaultAppearance.onConfirmationColor,
        errorColor = parseColor(appearanceBundle, MonextBundleKeys.ERROR_COLOR) ?: defaultAppearance.errorColor,
        pendingColor = parseColor(appearanceBundle, MonextBundleKeys.PENDING_COLOR) ?: defaultAppearance.pendingColor,

        textfieldLabelColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_LABEL_COLOR),
        textfieldTextColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_TEXT_COLOR),
        textfieldBorderColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_BORDER_COLOR),
        textfieldBorderSelectedColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_BORDER_SELECTED_COLOR),
        textfieldBackgroundColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_BACKGROUND_COLOR),
        textfieldAccessoryColor = parseColor(appearanceBundle, MonextBundleKeys.TEXTFIELD_ACCESSORY_COLOR),

        buttonRadius = parseDp(appearanceBundle, MonextBundleKeys.BUTTON_RADIUS) ?: defaultAppearance.buttonRadius,
        cardRadius = parseDp(appearanceBundle, MonextBundleKeys.CARD_RADIUS) ?: defaultAppearance.cardRadius,
        textfieldRadius = parseDp(appearanceBundle, MonextBundleKeys.TEXTFIELD_RADIUS) ?: defaultAppearance.textfieldRadius,
        textfieldStroke = parseDp(appearanceBundle, MonextBundleKeys.TEXTFIELD_STROKE) ?: defaultAppearance.textfieldStroke,
        textfieldStrokeSelected = parseDp(appearanceBundle, MonextBundleKeys.TEXTFIELD_STROKE_SELECTED) ?: defaultAppearance.textfieldStrokeSelected,
        paymentMethodShape = parsePaymentMethodShape(appearanceBundle, MonextBundleKeys.PAYMENT_METHOD_SHAPE) ?: defaultAppearance.paymentMethodShape,

        headerTitle = appearanceBundle.getString(MonextBundleKeys.HEADER_TITLE) ?: defaultAppearance.headerTitle,
        headerBackgroundColor = parseColor(appearanceBundle, MonextBundleKeys.HEADER_BACKGROUND_COLOR) ?: defaultAppearance.headerBackgroundColor,
        onHeaderBackgroundColor = parseColor(appearanceBundle, MonextBundleKeys.ON_HEADER_BACKGROUND_COLOR) ?: defaultAppearance.onHeaderBackgroundColor,

        backButtonText = appearanceBundle.getString(MonextBundleKeys.BACK_BUTTON_TEXT) ?: defaultAppearance.backButtonText
    )
}

internal fun parseGooglePayConfiguration(contextBundle: Bundle?): GooglePayConfiguration {
    val gpayBundle = contextBundle?.getBundle(MonextBundleKeys.GOOGLE_PAY_CONFIGURATION)
        ?: return GooglePayConfiguration()

    return GooglePayConfiguration(
        theme = parseGooglePayTheme(gpayBundle.getString(MonextBundleKeys.GOOGLE_PAY_THEME)),
        type = parseGooglePayType(gpayBundle.getString(MonextBundleKeys.GOOGLE_PAY_TYPE))
    )
}

private fun parseColor(bundle: Bundle?, key: String): Color? {
    val hex = bundle?.getString(key) ?: return null
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (e: IllegalArgumentException) {
        null
    }
}

private fun parseDp(bundle: Bundle?, key: String): Dp? {
    val value = bundle?.get(key) as? Number ?: return null
    return value.toFloat().dp
}

private fun parsePaymentMethodShape(bundle: Bundle?, key: String): PaymentMethodShape? {
    val value = bundle?.getString(key) ?: return null
    return try {
        PaymentMethodShape.valueOf(value.uppercase())
    } catch (e: IllegalArgumentException) {
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
