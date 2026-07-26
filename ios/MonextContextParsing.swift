import Monext
import PassKit
import SwiftUI

enum MonextErrorCodes {
    static let invalidSessionToken = "E_INVALID_SESSION_TOKEN"
    static let paymentInProgress = "E_PAYMENT_IN_PROGRESS"
    static let noViewController = "E_NO_VIEW_CONTROLLER"
    static let invalidEnvironment = "E_INVALID_ENVIRONMENT"
}

enum MonextContextKeys {
    static let environment = "environment"
    static let config = "config"
    static let language = "language"
    static let appearance = "appearance"
    static let applePayConfiguration = "applePayConfiguration"
    static let applePayButtonLabel = "buttonLabel"
    static let applePayButtonStyle = "buttonStyle"

    static let primaryColor = "primaryColor"
    static let onPrimaryColor = "onPrimaryColor"
    static let secondaryColor = "secondaryColor"
    static let onSecondaryColor = "onSecondaryColor"
    static let backgroundColor = "backgroundColor"
    static let onBackgroundColor = "onBackgroundColor"
    static let surfaceColor = "surfaceColor"
    static let onSurfaceColor = "onSurfaceColor"
    static let confirmationColor = "confirmationColor"
    static let onConfirmationColor = "onConfirmationColor"
    static let errorColor = "errorColor"
    static let textfieldLabelColor = "textfieldLabelColor"
    static let textfieldTextColor = "textfieldTextColor"
    static let textfieldBorderColor = "textfieldBorderColor"
    static let textfieldBorderSelectedColor = "textfieldBorderSelectedColor"
    static let textfieldBackgroundColor = "textfieldBackgroundColor"
    static let textfieldAccessoryColor = "textfieldAccessoryColor"
    static let buttonRadius = "buttonRadius"
    static let cardRadius = "cardRadius"
    static let textfieldRadius = "textfieldRadius"
    static let textfieldStroke = "textfieldStroke"
    static let textfieldStrokeSelected = "textfieldStrokeSelected"
    static let paymentMethodShape = "paymentMethodShape"
    static let headerTitle = "headerTitle"
    static let headerBackgroundColor = "headerBackgroundColor"
    static let onHeaderBackgroundColor = "onHeaderBackgroundColor"
    static let backButtonText = "backButtonText"
}

func isValidEnvironmentValue(_ value: String?) -> Bool {
    guard let value else { return true }
    return value.caseInsensitiveCompare("production") == .orderedSame
        || value.caseInsensitiveCompare("sandbox") == .orderedSame
}

func applePayButtonLabel(from value: String?) -> PayWithApplePayButtonLabel {
    switch value?.lowercased().replacingOccurrences(of: "_", with: "") {
    case "buy": return .buy
    case "book": return .book
    case "checkout": return .checkout
    case "donate": return .donate
    case "subscribe": return .subscribe
    case "setup": return .setUp
    default: return .plain
    }
}

func applePayButtonStyle(from value: String?) -> PayWithApplePayButtonStyle {
    switch value?.lowercased().replacingOccurrences(of: "_", with: "") {
    case "white": return .white
    case "whiteoutline": return .whiteOutline
    default: return .black
    }
}

func paymentMethodShape(from value: String?) -> Appearance.PaymentMethodShape {
    value?.lowercased() == "square" ? .square : .round
}
