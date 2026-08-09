#import <React/RCTBridgeModule.h>

#if RCT_NEW_ARCH_ENABLED
#import <RNMonextPaymentSpec/RNMonextPaymentSpec.h>

@interface MonextPayment : NSObject
- (void)presentPaymentSheet:(NSString *)sessionToken
                    context:(NSDictionary *)context
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;
@end

@interface MonextPaymentSpecImpl : NSObject <RNMonextPaymentSpec>
@end

@implementation MonextPaymentSpecImpl {
  MonextPayment *_swiftModule;
}

RCT_EXPORT_MODULE(MonextPayment)

- (instancetype)init
{
  if (self = [super init]) {
    _swiftModule = [MonextPayment new];
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
  return std::make_shared<facebook::react::RNMonextPaymentSpecJSI>(params);
}

- (void)presentPaymentSheet:(NSString *)sessionToken
                    context:(NSDictionary *)context
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [_swiftModule presentPaymentSheet:sessionToken context:context resolve:resolve reject:reject];
}

@end

#else

@interface RCT_EXTERN_REMAP_MODULE(MonextPayment, MonextPayment, NSObject)

RCT_EXTERN_METHOD(presentPaymentSheet:(NSString *)sessionToken
                  context:(NSDictionary *)context
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end

#endif
