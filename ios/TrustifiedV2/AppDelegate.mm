#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <Firebase/Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  @try {
    [FIRApp configure];
  } @catch (NSException *exception) {
    NSLog(@"[AppDelegate] FIRApp configure failed: %@", exception);
  }

  self.moduleName = @"TrustifiedV2";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
#if TARGET_IPHONE_SIMULATOR
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  NSURL *bundle = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  if (bundle != nil) {
    return bundle;
  }
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#endif
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
