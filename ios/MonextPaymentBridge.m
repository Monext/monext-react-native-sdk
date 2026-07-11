#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(MonextPayment, MonextPayment, NSObject)

RCT_EXTERN_METHOD(presentPaymentSheet:(NSString *)sessionToken
                  context:(NSDictionary *)context
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
