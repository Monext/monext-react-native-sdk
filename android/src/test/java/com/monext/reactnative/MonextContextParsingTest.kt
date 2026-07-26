package com.monext.reactnative

import android.os.Bundle
import androidx.compose.ui.graphics.toArgb
import com.google.pay.button.ButtonTheme
import com.google.pay.button.ButtonType
import com.monext.sdk.Appearance
import com.monext.sdk.MnxtEnvironment
import com.monext.sdk.MnxtSDKConfiguration
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.`when`
import org.mockito.MockedStatic

class MonextContextParsingTest {

    private lateinit var colorStatic: MockedStatic<android.graphics.Color>

    @BeforeEach
    fun setUpColorParsing() {
        colorStatic = mockStatic(android.graphics.Color::class.java)
        colorStatic.`when`<Int> { android.graphics.Color.parseColor(anyString()) }
            .thenAnswer { invocation -> parseHexColorArgb(invocation.getArgument(0)) }
    }

    @AfterEach
    fun tearDownColorParsing() {
        colorStatic.close()
    }

    private fun mockBundle(vararg entries: Pair<String, Any?>): Bundle {
        val values = entries.toMap()
        val bundle = mock(Bundle::class.java)
        `when`(bundle.getString(anyString())).thenAnswer { invocation ->
            values[invocation.getArgument<String>(0)] as? String
        }
        `when`(bundle.getBundle(anyString())).thenAnswer { invocation ->
            values[invocation.getArgument<String>(0)] as? Bundle
        }
        `when`(bundle.get(anyString())).thenAnswer { invocation ->
            values[invocation.getArgument<String>(0)]
        }
        return bundle
    }

    /** Reimplements AOSP's `Color.parseColor` for the "#RRGGBB"/"#AARRGGBB" formats this SDK relies on. */
    private fun parseHexColorArgb(colorString: String): Int {
        if (colorString.isEmpty() || colorString[0] != '#') {
            throw IllegalArgumentException("Unknown color: $colorString")
        }
        val color = colorString.substring(1).toLong(16)
        return when (colorString.length) {
            7 -> (color or 0x00000000ff000000L).toInt()
            9 -> color.toInt()
            else -> throw IllegalArgumentException("Unknown color: $colorString")
        }
    }

    @Test
    fun `parseEnvironment defaults to Sandbox when bundle is null`() {
        assertEquals(MnxtEnvironment.Sandbox, parseEnvironment(null))
    }

    @Test
    fun `parseEnvironment defaults to Sandbox when environment key is missing`() {
        assertEquals(MnxtEnvironment.Sandbox, parseEnvironment(mockBundle()))
    }

    @Test
    fun `parseEnvironment resolves Production case-insensitively`() {
        val bundle = mockBundle(MonextBundleKeys.ENVIRONMENT to "PRODUCTION")
        assertEquals(MnxtEnvironment.Production, parseEnvironment(bundle))
    }

    @Test
    fun `parseEnvironment falls back to Sandbox on an unrecognized value`() {
        val bundle = mockBundle(MonextBundleKeys.ENVIRONMENT to "prod")
        assertEquals(MnxtEnvironment.Sandbox, parseEnvironment(bundle))
    }

    @Test
    fun `isValidEnvironment accepts a missing value`() {
        assertEquals(true, isValidEnvironment(null))
    }

    @Test
    fun `isValidEnvironment accepts production and sandbox case-insensitively`() {
        assertEquals(true, isValidEnvironment("production"))
        assertEquals(true, isValidEnvironment("PRODUCTION"))
        assertEquals(true, isValidEnvironment("Sandbox"))
    }

    @Test
    fun `isValidEnvironment rejects an unrecognized value`() {
        assertEquals(false, isValidEnvironment("prod"))
        assertEquals(false, isValidEnvironment(""))
    }

    @Test
    fun `parseConfig defaults to the SDK's default language when config bundle is missing`() {
        assertEquals(MnxtSDKConfiguration().language, parseConfig(null).language)
    }

    @Test
    fun `parseConfig reads language from the config bundle`() {
        val bundle = mockBundle(MonextBundleKeys.CONFIG to mockBundle(MonextBundleKeys.LANGUAGE to "EN"))
        assertEquals("EN", parseConfig(bundle).language)
    }

    @Test
    fun `parseAppearance returns SDK defaults when appearance bundle is missing`() {
        val defaultAppearance = Appearance()
        val appearance = parseAppearance(null)
        assertEquals(defaultAppearance.primaryColor, appearance.primaryColor)
        assertEquals(defaultAppearance.headerTitle, appearance.headerTitle)
        assertEquals(defaultAppearance.backButtonText, appearance.backButtonText)
    }

    @Test
    fun `parseAppearance parses a valid hex color`() {
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(MonextBundleKeys.PRIMARY_COLOR to "#112233")
        )
        val appearance = parseAppearance(bundle)
        assertEquals(parseHexColorArgb("#112233"), appearance.primaryColor.toArgb())
    }

    @Test
    fun `parseAppearance falls back to the SDK default on a malformed hex color`() {
        val defaultAppearance = Appearance()
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(MonextBundleKeys.PRIMARY_COLOR to "not-a-color")
        )
        assertEquals(defaultAppearance.primaryColor, parseAppearance(bundle).primaryColor)
    }

    @Test
    fun `parseAppearance falls back to the SDK default on a malformed radius`() {
        val defaultAppearance = Appearance()
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(MonextBundleKeys.BUTTON_RADIUS to "not-a-number")
        )
        assertEquals(defaultAppearance.buttonRadius, parseAppearance(bundle).buttonRadius)
    }

    @Test
    fun `parseAppearance reads a numeric radius`() {
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(MonextBundleKeys.BUTTON_RADIUS to 12.0)
        )
        assertEquals(12f, parseAppearance(bundle).buttonRadius.value)
    }

    @Test
    fun `parseAppearance falls back to the SDK default on an unrecognized paymentMethodShape`() {
        val defaultAppearance = Appearance()
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(MonextBundleKeys.PAYMENT_METHOD_SHAPE to "triangle")
        )
        assertEquals(defaultAppearance.paymentMethodShape, parseAppearance(bundle).paymentMethodShape)
    }

    @Test
    fun `parseAppearance uses the SDK's default textfieldLabelColor when not provided`() {
        val bundle = mockBundle(MonextBundleKeys.APPEARANCE to mockBundle())
        assertEquals(Appearance().textfieldLabelColor, parseAppearance(bundle).textfieldLabelColor)
    }

    @Test
    fun `parseAppearance reads headerTitle and backButtonText when provided`() {
        val bundle = mockBundle(
            MonextBundleKeys.APPEARANCE to mockBundle(
                MonextBundleKeys.HEADER_TITLE to "Checkout",
                MonextBundleKeys.BACK_BUTTON_TEXT to "Back"
            )
        )
        val appearance = parseAppearance(bundle)
        assertEquals("Checkout", appearance.headerTitle)
        assertEquals("Back", appearance.backButtonText)
    }

    @Test
    fun `parseGooglePayConfiguration defaults when bundle is missing`() {
        val config = parseGooglePayConfiguration(null)
        assertEquals(ButtonTheme.Dark, config.theme)
        assertEquals(ButtonType.Plain, config.type)
    }

    @Test
    fun `parseGooglePayConfiguration maps known theme and type values`() {
        val bundle = mockBundle(
            MonextBundleKeys.GOOGLE_PAY_CONFIGURATION to mockBundle(
                MonextBundleKeys.GOOGLE_PAY_THEME to "light",
                MonextBundleKeys.GOOGLE_PAY_TYPE to "buy"
            )
        )
        val config = parseGooglePayConfiguration(bundle)
        assertEquals(ButtonTheme.Light, config.theme)
        assertEquals(ButtonType.Buy, config.type)
    }

    @Test
    fun `parseGooglePayConfiguration falls back to Plain on an unrecognized type`() {
        val bundle = mockBundle(
            MonextBundleKeys.GOOGLE_PAY_CONFIGURATION to mockBundle(MonextBundleKeys.GOOGLE_PAY_TYPE to "byu")
        )
        assertEquals(ButtonType.Plain, parseGooglePayConfiguration(bundle).type)
    }
}
