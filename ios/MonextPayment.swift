import Foundation
import PassKit
import SwiftUI
import UIKit
import Monext
import React

@objc(MonextPaymentSheetPresenter)
final class MonextPaymentSheetPresenter: NSObject {
    private var isPresenting = false
    
    @objc
    func presentPaymentSheet(
        _ sessionToken: String,
        context: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard !sessionToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            reject(MonextErrorCodes.invalidSessionToken, "sessionToken is required", nil)
            return
        }

        let environmentValue = context[MonextContextKeys.environment] as? String
        guard isValidEnvironmentValue(environmentValue) else {
            let message = environmentValue == nil
                ? "environment is required and must be \"production\" or \"sandbox\""
                : "environment must be \"production\" or \"sandbox\", got \"\(environmentValue!)\""
            reject(MonextErrorCodes.invalidEnvironment, message, nil)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            guard !self.isPresenting else {
                reject(MonextErrorCodes.paymentInProgress, "A Monext payment sheet is already open", nil)
                return
            }
            guard let presenter = Self.topViewController() else {
                reject(MonextErrorCodes.noViewController, "No iOS view controller is available", nil)
                return
            }
            
            self.isPresenting = true
            let completion = PaymentSheetCompletion { [weak self] result in
                self?.isPresenting = false
                resolve(result)
            }
            let paymentView = MonextPaymentSheetView(
                sessionToken: sessionToken,
                context: PaymentContext(dictionary: context),
                onResult: completion.complete
            )
            let controller = UIHostingController(rootView: paymentView)
            completion.controller = controller
            controller.view.backgroundColor = .clear
            controller.modalPresentationStyle = .overFullScreen
            presenter.present(controller, animated: true) {
                completion.markPresented()
            }
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        true
    }
    
    private static func topViewController() -> UIViewController? {
        let windowScene = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }
        let root = windowScene?.windows.first(where: { $0.isKeyWindow })?.rootViewController
        var controller = root
        while let presented = controller?.presentedViewController {
            controller = presented
        }
        return controller
    }
}

private final class PaymentSheetCompletion {
    weak var controller: UIViewController?
    private let resolve: ([String: String]) -> Void
    private var didComplete = false
    private var hasFinishedPresenting = false
    private var queuedResult: [String: String]?

    init(resolve: @escaping ([String: String]) -> Void) {
        self.resolve = resolve
    }

    func markPresented() {
        hasFinishedPresenting = true
        if let pending = queuedResult {
            queuedResult = nil
            complete(pending)
        }
    }

    func complete(_ result: [String: String]) {
        guard !didComplete else { return }

        guard hasFinishedPresenting else {
            // A result arrived before present() finished its transition.
            // Queue it to avoid a present/dismiss race.
            queuedResult = result
            return
        }
        didComplete = true
        
        controller?.dismiss(animated: true) { [resolve] in
            resolve(result)
        }
    }
}

private struct PaymentContext {
    let environment: String
    let language: String?
    let appearance: NSDictionary?
    let applePayButtonLabel: String?
    let applePayButtonStyle: String?
    
    init(dictionary: NSDictionary) {
        environment = dictionary[MonextContextKeys.environment] as? String ?? "sandbox"
        let config = dictionary[MonextContextKeys.config] as? NSDictionary
        language = config?[MonextContextKeys.language] as? String
        appearance = dictionary[MonextContextKeys.appearance] as? NSDictionary
        let applePay = dictionary[MonextContextKeys.applePayConfiguration] as? NSDictionary
        applePayButtonLabel = applePay?[MonextContextKeys.applePayButtonLabel] as? String
        applePayButtonStyle = applePay?[MonextContextKeys.applePayButtonStyle] as? String
    }

    func color(_ key: String) -> Color? {
        Color(hex: appearance?[key] as? String)
    }

    func color(_ key: String, default fallback: Color) -> Color {
        color(key) ?? fallback
    }

    func number(_ key: String) -> CGFloat? {
        (appearance?[key] as? NSNumber).map { CGFloat($0.doubleValue) }
    }

    func number(_ key: String, default fallback: CGFloat) -> CGFloat {
        number(key) ?? fallback
    }

    func string(_ key: String) -> String? {
        appearance?[key] as? String
    }
}

private struct MonextPaymentSheetView: View {
    let sessionToken: String
    let context: PaymentContext
    let onResult: ([String: String]) -> Void
    
    @State private var isPresented = true
    @State private var pendingDismissResult: [String: String]?

    var body: some View {
        let appearance: Appearance = Appearance(
            primaryColor: context.color(MonextContextKeys.primaryColor, default: Appearance.Defaults.primaryColor),
            onPrimaryColor: context.color(MonextContextKeys.onPrimaryColor, default: Appearance.Defaults.onPrimaryColor),
            secondaryColor: context.color(MonextContextKeys.secondaryColor, default: Appearance.Defaults.secondaryColor),
            onSecondaryColor: context.color(MonextContextKeys.onSecondaryColor, default: Appearance.Defaults.onSecondaryColor),
            backgroundColor: context.color(MonextContextKeys.backgroundColor, default: Appearance.Defaults.backgroundColor),
            onBackgroundColor: context.color(MonextContextKeys.onBackgroundColor, default: Appearance.Defaults.onBackgroundColor),
            surfaceColor: context.color(MonextContextKeys.surfaceColor, default: Appearance.Defaults.surfaceColor),
            onSurfaceColor: context.color(MonextContextKeys.onSurfaceColor, default: Appearance.Defaults.onSurfaceColor),
            confirmationColor: context.color(MonextContextKeys.confirmationColor, default: Appearance.Defaults.confirmationColor),
            onConfirmationColor: context.color(MonextContextKeys.onConfirmationColor, default: Appearance.Defaults.onConfirmationColor),
            errorColor: context.color(MonextContextKeys.errorColor, default: Appearance.Defaults.errorColor),
            textfieldLabelColor: context.color(MonextContextKeys.textfieldLabelColor),
            textfieldTextColor: context.color(MonextContextKeys.textfieldTextColor),
            textfieldBorderColor: context.color(MonextContextKeys.textfieldBorderColor),
            textfieldBorderSelectedColor: context.color(MonextContextKeys.textfieldBorderSelectedColor),
            textfieldBackgroundColor: context.color(MonextContextKeys.textfieldBackgroundColor),
            textfieldAccessoryColor: context.color(MonextContextKeys.textfieldAccessoryColor),
            buttonRadius: context.number(MonextContextKeys.buttonRadius, default: Appearance.Defaults.buttonRadius),
            cardRadius: context.number(MonextContextKeys.cardRadius, default: Appearance.Defaults.cardRadius),
            textfieldRadius: context.number(MonextContextKeys.textfieldRadius, default: Appearance.Defaults.textfieldRadius),
            textfieldStroke: context.number(MonextContextKeys.textfieldStroke, default: Appearance.Defaults.textfieldStroke),
            textfieldStrokeSelected: context.number(MonextContextKeys.textfieldStrokeSelected, default: Appearance.Defaults.textfieldStrokeSelected),
            paymentMethodShape: paymentMethodShape(from: context.string(MonextContextKeys.paymentMethodShape)),
            headerTitle: context.string(MonextContextKeys.headerTitle),
            headerBackgroundColor: context.color(MonextContextKeys.headerBackgroundColor, default: Appearance.Defaults.headerBackgroundColor),
            onHeaderBackgroundColor: context.color(MonextContextKeys.onHeaderBackgroundColor, default: Appearance.Defaults.onHeaderBackgroundColor),
            backButtonText: context.string(MonextContextKeys.backButtonText)
        )

        Color.clear
            .presentPaymentSheet(
                isPresented: $isPresented,
                sessionToken: sessionToken,
                context: MnxtSDKContext(
                    environment: context.environment.caseInsensitiveCompare("production") == .orderedSame ? .production : .sandbox,
                    config: MnxtSDKConfiguration(language: context.language ?? "FR"),
                    appearance: appearance,
                    applePayConfiguration: ApplePayConfiguration(
                        buttonLabel: applePayButtonLabel(from: context.applePayButtonLabel),
                        buttonStyle: applePayButtonStyle(from: context.applePayButtonStyle)
                    )
                ),
                onResult: { result in
                    pendingDismissResult = mapResult(result)
                }
            )
            .onChange(of: isPresented) { presented in
                guard !presented else { return }
                let result = pendingDismissResult
                pendingDismissResult = nil
                onResult(result ?? Self.dismissedByUserResult)
            }
    }

    private static let dismissedByUserResult = ["result": "dismissed", "state": "paymentCanceled"]

    private func mapResult(_ result: PaymentSheetResult) -> [String: String] {
        switch result {
        case .tokenExpired: return ["result": "completed", "state": "tokenExpired"]
        case .paymentPending: return ["result": "completed", "state": "paymentPending"]
        case .paymentSuccess: return ["result": "completed", "state": "paymentSuccess"]
        case .paymentFailure: return ["result": "completed", "state": "paymentFailure"]
        case .paymentSheetDismissedByUser: return ["result": "dismissed", "state": "paymentSheetDismissedByUser"]
        case .paymentCanceled: return Self.dismissedByUserResult
        }
    }
}

private extension Color {
    init?(hex: String?) {
        guard let hex else { return nil }
        let value = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        guard value.count == 6 || value.count == 8, let number = UInt64(value, radix: 16) else {
            return nil
        }
        
        let red: Double
        let green: Double
        let blue: Double
        let alpha: Double
        if value.count == 8 {
            red = Double((number >> 24) & 0xff) / 255
            green = Double((number >> 16) & 0xff) / 255
            blue = Double((number >> 8) & 0xff) / 255
            alpha = Double(number & 0xff) / 255
        } else {
            red = Double((number >> 16) & 0xff) / 255
            green = Double((number >> 8) & 0xff) / 255
            blue = Double(number & 0xff) / 255
            alpha = 1
        }
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }
}
