#import <React/RCTBridgeModule.h>

#if RCT_NEW_ARCH_ENABLED
#import <RNMonextPaymentSpec/RNMonextPaymentSpec.h>

@interface MonextPaymentSheetPresenter : NSObject
- (void)presentPaymentSheet:(NSString *)sessionToken
                    context:(NSDictionary *)context
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;
@end

static NSDictionary *RCTMonextAppearanceDictionary(JS::NativeMonextPayment::Appearance &appearance)
{
  NSMutableDictionary *dict = [NSMutableDictionary new];
  [dict setValue:appearance.primaryColor() forKey:@"primaryColor"];
  [dict setValue:appearance.onPrimaryColor() forKey:@"onPrimaryColor"];
  [dict setValue:appearance.secondaryColor() forKey:@"secondaryColor"];
  [dict setValue:appearance.onSecondaryColor() forKey:@"onSecondaryColor"];
  [dict setValue:appearance.backgroundColor() forKey:@"backgroundColor"];
  [dict setValue:appearance.onBackgroundColor() forKey:@"onBackgroundColor"];
  [dict setValue:appearance.surfaceColor() forKey:@"surfaceColor"];
  [dict setValue:appearance.onSurfaceColor() forKey:@"onSurfaceColor"];
  [dict setValue:appearance.confirmationColor() forKey:@"confirmationColor"];
  [dict setValue:appearance.onConfirmationColor() forKey:@"onConfirmationColor"];
  [dict setValue:appearance.errorColor() forKey:@"errorColor"];
  [dict setValue:appearance.pendingColor() forKey:@"pendingColor"];
  [dict setValue:appearance.textfieldLabelColor() forKey:@"textfieldLabelColor"];
  [dict setValue:appearance.textfieldTextColor() forKey:@"textfieldTextColor"];
  [dict setValue:appearance.textfieldBorderColor() forKey:@"textfieldBorderColor"];
  [dict setValue:appearance.textfieldBorderSelectedColor() forKey:@"textfieldBorderSelectedColor"];
  [dict setValue:appearance.textfieldBackgroundColor() forKey:@"textfieldBackgroundColor"];
  [dict setValue:appearance.textfieldAccessoryColor() forKey:@"textfieldAccessoryColor"];
  if (auto v = appearance.buttonRadius()) {
    dict[@"buttonRadius"] = @(*v);
  }
  if (auto v = appearance.cardRadius()) {
    dict[@"cardRadius"] = @(*v);
  }
  if (auto v = appearance.textfieldRadius()) {
    dict[@"textfieldRadius"] = @(*v);
  }
  if (auto v = appearance.textfieldStroke()) {
    dict[@"textfieldStroke"] = @(*v);
  }
  if (auto v = appearance.textfieldStrokeSelected()) {
    dict[@"textfieldStrokeSelected"] = @(*v);
  }
  [dict setValue:appearance.paymentMethodShape() forKey:@"paymentMethodShape"];
  [dict setValue:appearance.headerTitle() forKey:@"headerTitle"];
  [dict setValue:appearance.headerBackgroundColor() forKey:@"headerBackgroundColor"];
  [dict setValue:appearance.onHeaderBackgroundColor() forKey:@"onHeaderBackgroundColor"];
  [dict setValue:appearance.backButtonText() forKey:@"backButtonText"];
  return dict;
}

static NSDictionary *RCTMonextContextDictionary(JS::NativeMonextPayment::MnxtSDKContext &context)
{
  NSMutableDictionary *dict = [NSMutableDictionary new];
  [dict setValue:context.environment() forKey:@"environment"];

  if (auto config = context.config()) {
    [dict setValue:@{@"language": config->language() ?: [NSNull null]} forKey:@"config"];
  }
  if (auto appearance = context.appearance()) {
    [dict setValue:RCTMonextAppearanceDictionary(*appearance) forKey:@"appearance"];
  }
  if (auto googlePay = context.googlePayConfiguration()) {
    NSMutableDictionary *googlePayDict = [NSMutableDictionary new];
    [googlePayDict setValue:googlePay->theme() forKey:@"theme"];
    [googlePayDict setValue:googlePay->type() forKey:@"type"];
    [dict setValue:googlePayDict forKey:@"googlePayConfiguration"];
  }
  if (auto applePay = context.applePayConfiguration()) {
    NSMutableDictionary *applePayDict = [NSMutableDictionary new];
    [applePayDict setValue:applePay->buttonLabel() forKey:@"buttonLabel"];
    [applePayDict setValue:applePay->buttonStyle() forKey:@"buttonStyle"];
    [dict setValue:applePayDict forKey:@"applePayConfiguration"];
  }
  return dict;
}

@interface MonextPaymentSpecImpl : NSObject <NativeMonextPaymentSpec>
@end

@implementation MonextPaymentSpecImpl {
  MonextPaymentSheetPresenter *_swiftModule;
}

RCT_EXPORT_MODULE(MonextPayment)

- (instancetype)init
{
  if (self = [super init]) {
    _swiftModule = [MonextPaymentSheetPresenter new];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeMonextPaymentSpecJSI>(params);
}

- (void)presentPaymentSheet:(NSString *)sessionToken
                    context:(JS::NativeMonextPayment::MnxtSDKContext &)context
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [_swiftModule presentPaymentSheet:sessionToken
                             context:RCTMonextContextDictionary(context)
                             resolve:resolve
                              reject:reject];
}

@end

#else

@interface RCT_EXTERN_REMAP_MODULE(MonextPayment, MonextPaymentSheetPresenter, NSObject)

RCT_EXTERN_METHOD(presentPaymentSheet:(NSString *)sessionToken
                  context:(NSDictionary *)context
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end

#endif
