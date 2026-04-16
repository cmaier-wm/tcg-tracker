#!/usr/bin/env ruby

require 'fileutils'
require 'pathname'
require 'xcodeproj'

ROOT = File.expand_path('..', __dir__)
APP_DIR = File.join(ROOT, 'TCGTracker')
TESTS_DIR = File.join(ROOT, 'TCGTrackerTests')
PROJECT_PATH = File.join(APP_DIR, 'TCGTracker.xcodeproj')

def relative_path(from, to)
  Pathname.new(to).relative_path_from(Pathname.new(from)).to_s
end

def ensure_group(parent, name, path = nil)
  parent[name] || parent.new_group(name, path)
end

def add_source_tree(target, root_group:, root_dir:, project_dir:)
  Dir.glob(File.join(root_dir, '**/*.swift')).sort.each do |absolute_path|
    relative_to_root = relative_path(root_dir, absolute_path)
    directories = File.dirname(relative_to_root).split('/').reject { |segment| segment == '.' }

    group = root_group
    directories.each do |directory|
      group = ensure_group(group, directory, directory)
    end

    file_reference = group.new_file(File.basename(absolute_path))
    target.add_file_references([file_reference])
  end
end

FileUtils.rm_rf(PROJECT_PATH)

project = Xcodeproj::Project.new(PROJECT_PATH)
project.root_object.attributes['LastSwiftUpdateCheck'] = '2600'
project.root_object.attributes['LastUpgradeCheck'] = '2600'

app_target = project.new_target(:application, 'TCGTracker', :ios, '17.0', nil, :swift)
test_target = project.new_target(:unit_test_bundle, 'TCGTrackerTests', :ios, '17.0', nil, :swift)
test_target.add_dependency(app_target)

project.build_configuration_list.build_configurations.each do |config|
  config.build_settings['SWIFT_VERSION'] = '6.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
end

app_target.build_configurations.each do |config|
  settings = config.build_settings
  settings['ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS'] = 'YES'
  settings['CODE_SIGN_STYLE'] = 'Automatic'
  settings['CURRENT_PROJECT_VERSION'] = '1'
  settings['DEVELOPMENT_TEAM'] = ''
  settings['ENABLE_PREVIEWS'] = 'YES'
  settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  settings['INFOPLIST_KEY_CFBundleDisplayName'] = 'TCG Tracker'
  settings['INFOPLIST_KEY_UILaunchScreen_Generation'] = 'YES'
  settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks']
  settings['MARKETING_VERSION'] = '1.0'
  settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.cmaier.TCGTracker'
  settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
  settings['SDKROOT'] = 'iphoneos'
  settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
  settings['SWIFT_EMIT_LOC_STRINGS'] = 'YES'
  settings['SWIFT_VERSION'] = '6.0'
  settings['TARGETED_DEVICE_FAMILY'] = '1,2'
end

test_target.build_configurations.each do |config|
  settings = config.build_settings
  settings['BUNDLE_LOADER'] = '$(TEST_HOST)'
  settings['CODE_SIGN_STYLE'] = 'Automatic'
  settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
  settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@loader_path/Frameworks']
  settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.cmaier.TCGTrackerTests'
  settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
  settings['SDKROOT'] = 'iphoneos'
  settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
  settings['SWIFT_VERSION'] = '6.0'
  settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  settings['TEST_HOST'] = '$(BUILT_PRODUCTS_DIR)/TCGTracker.app/TCGTracker'
end

app_group = ensure_group(project.main_group, 'TCGTracker', '.')
tests_group = ensure_group(project.main_group, 'TCGTrackerTests', '../TCGTrackerTests')

add_source_tree(
  app_target,
  root_group: app_group,
  root_dir: APP_DIR,
  project_dir: APP_DIR
)

add_source_tree(
  test_target,
  root_group: tests_group,
  root_dir: TESTS_DIR,
  project_dir: APP_DIR
)

scheme = Xcodeproj::XCScheme.new
scheme.configure_with_targets(app_target, test_target, launch_target: true)
scheme.save_as(PROJECT_PATH, 'TCGTracker', true)

project.save
