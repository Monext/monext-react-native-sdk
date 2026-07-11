require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'monext-react-native-sdk'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/monext/monext-react-native-sdk'
  s.license      = package['license']
  s.authors      = { 'Monext' => 'support@monext.com' }
  s.platforms    = { :ios => '16.0' }
  s.source       = { :git => 'https://github.com/monext/monext-react-native-sdk.git', :tag => s.version.to_s }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.swift_version = '5.9'

  s.dependency 'React-Core'
  install_modules_dependencies(s)
  spm_dependency(
    s,
    url: 'https://github.com/Monext/monext-ios-sdk-spm',
    requirement: { kind: 'exactVersion', version: '1.0.7' },
    products: ['Monext']
  )
end
