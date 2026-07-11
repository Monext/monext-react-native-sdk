import Foundation
import PassKit
import SwiftUI
import UIKit
import Monext
import React

@objc(MonextPayment)
final class MonextPayment: NSObject {
  private var isPresenting = false

  @objc
  func presentPaymentSheet(
    _ sessionToken: String,
    context: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !sessionToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
      reject("E_INVALID_SESSION_TOKEN", "sessionToken is required", nil)
      return
    }

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      guard !self.isPresenting else {
        reject("E_PAYMENT_IN_PROGRESS", "A Monext payment sheet is already open", nil)
        return
      }
      guard let presenter = Self.topViewController() else {
        reject("E_NO_VIEW_CONTROLLER", "No iOS view controller is available", nil)
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
      presenter.present(controller, animated: false)
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

  init(resolve: @escaping ([String: String]) -> Void) {
    self.resolve = resolve
  }

  func complete(_ result: [String: String]) {
    guard !didComplete else { return }
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
    environment = dictionary["environment"] as? String ?? "sandbox"
    let config = dictionary["config"] as? NSDictionary
    language = config?["language"] as? String
    appearance = dictionary["appearance"] as? NSDictionary
    let applePay = dictionary["applePayConfiguration"] as? NSDictionary
    applePayButtonLabel = applePay?["buttonLabel"] as? String
    applePayButtonStyle = applePay?["buttonStyle"] as? String
  }

  func color(_ key: String) -> Color? {
    Color(hex: appearance?[key] as? String)
  }

  func number(_ key: String) -> CGFloat? {
    (appearance?[key] as? NSNumber).map { CGFloat($0.doubleValue) }
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

  var body: some View {
    Color.clear
      .presentPaymentSheet(
        isPresented: $isPresented,
        sessionToken: sessionToken,
        context: MnxtSDKContext(
          environment: context.environment.caseInsensitiveCompare("production") == .orderedSame ? .production : .sandbox,
          config: MnxtSDKConfiguration(language: context.language ?? "FR"),
          appearance: Appearance(
            primaryColor: context.color("primaryColor") ?? Appearance.Defaults.primaryColor,
            onPrimaryColor: context.color("onPrimaryColor") ?? Appearance.Defaults.onPrimaryColor,
            secondaryColor: context.color("secondaryColor") ?? Appearance.Defaults.secondaryColor,
            onSecondaryColor: context.color("onSecondaryColor") ?? Appearance.Defaults.onSecondaryColor,
            backgroundColor: context.color("backgroundColor") ?? Appearance.Defaults.backgroundColor,
            onBackgroundColor: context.color("onBackgroundColor") ?? Appearance.Defaults.onBackgroundColor,
            surfaceColor: context.color("surfaceColor") ?? Appearance.Defaults.surfaceColor,
            onSurfaceColor: context.color("onSurfaceColor") ?? Appearance.Defaults.onSurfaceColor,
            confirmationColor: context.color("confirmationColor") ?? Appearance.Defaults.confirmationColor,
            onConfirmationColor: context.color("onConfirmationColor") ?? Appearance.Defaults.onConfirmationColor,
            errorColor: context.color("errorColor") ?? Appearance.Defaults.errorColor,
            textfieldLabelColor: context.color("textfieldLabelColor"),
            textfieldTextColor: context.color("textfieldTextColor"),
            textfieldBorderColor: context.color("textfieldBorderColor"),
            textfieldBorderSelectedColor: context.color("textfieldBorderSelectedColor"),
            textfieldBackgroundColor: context.color("textfieldBackgroundColor"),
            textfieldAccessoryColor: context.color("textfieldAccessoryColor"),
            buttonRadius: context.number("buttonRadius") ?? Appearance.Defaults.buttonRadius,
            cardRadius: context.number("cardRadius") ?? Appearance.Defaults.cardRadius,
            textfieldRadius: context.number("textfieldRadius") ?? Appearance.Defaults.textfieldRadius,
            textfieldStroke: context.number("textfieldStroke") ?? Appearance.Defaults.textfieldStroke,
            textfieldStrokeSelected: context.number("textfieldStrokeSelected") ?? Appearance.Defaults.textfieldStrokeSelected,
            paymentMethodShape: paymentMethodShape(context.string("paymentMethodShape")),
            headerTitle: context.string("headerTitle"),
            headerBackgroundColor: context.color("headerBackgroundColor") ?? Appearance.Defaults.headerBackgroundColor,
            onHeaderBackgroundColor: context.color("onHeaderBackgroundColor") ?? Appearance.Defaults.onHeaderBackgroundColor,
            backButtonText: context.string("backButtonText")
          ),
          applePayConfiguration: ApplePayConfiguration(
            buttonLabel: applePayButtonLabel(context.applePayButtonLabel),
            buttonStyle: applePayButtonStyle(context.applePayButtonStyle)
          )
        ),
        onResult: { result in
          switch result {
          case .tokenExpired:
            onResult(["result": "completed", "state": "tokenExpired"])
          case .paymentPending:
            onResult(["result": "completed", "state": "paymentPending"])
          case .paymentSuccess:
            onResult(["result": "completed", "state": "paymentSuccess"])
          case .paymentFailure:
            onResult(["result": "completed", "state": "paymentFailure"])
          case .paymentCanceled:
            onResult(["result": "dismissed", "state": "paymentCanceled"])
          }
        }
      )
  }

  private func applePayButtonLabel(_ value: String?) -> PayWithApplePayButtonLabel {
    switch value?.lowercased() {
    case "buy": return .buy
    case "book": return .book
    case "checkout": return .checkout
    case "donate": return .donate
    case "subscribe": return .subscribe
    case "set_up", "setup": return .setUp
    default: return .plain
    }
  }

  private func paymentMethodShape(_ value: String?) -> Appearance.PaymentMethodShape {
    value?.lowercased() == "square" ? .square : .round
  }

  private func applePayButtonStyle(_ value: String?) -> PayWithApplePayButtonStyle {
    switch value?.lowercased() {
    case "white": return .white
    case "whiteoutline", "white_outline": return .whiteOutline
    default: return .black
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
