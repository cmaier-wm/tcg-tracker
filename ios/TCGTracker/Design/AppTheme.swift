import SwiftUI

#if canImport(UIKit)
import UIKit
private typealias PlatformColor = UIColor
#elseif canImport(AppKit)
import AppKit
private typealias PlatformColor = NSColor
#endif

enum ThemeMode: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }

    var symbolName: String {
        switch self {
        case .system: "circle.lefthalf.filled"
        case .light: "sun.max.fill"
        case .dark: "moon.fill"
        }
    }
}

enum AppTheme {
    static let surface = Color(light: PlatformColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0), dark: PlatformColor(red: 0.10, green: 0.10, blue: 0.12, alpha: 1.0))
    static let background = Color(light: PlatformColor(red: 0.95, green: 0.96, blue: 0.98, alpha: 1.0), dark: PlatformColor(red: 0.04, green: 0.04, blue: 0.05, alpha: 1.0))
    static let accent = Color(red: 0.16, green: 0.41, blue: 0.95)
    static let accentSoft = Color(light: PlatformColor(red: 0.91, green: 0.95, blue: 1.0, alpha: 1.0), dark: PlatformColor(red: 0.13, green: 0.22, blue: 0.36, alpha: 1.0))
    static let positive = Color(red: 0.14, green: 0.59, blue: 0.31)
    static let negative = Color(red: 0.82, green: 0.24, blue: 0.22)
    static let textPrimary = Color(light: .black, dark: .white)
    static let textSecondary = Color(light: PlatformColor(red: 0.42, green: 0.44, blue: 0.51, alpha: 1.0), dark: PlatformColor(red: 0.63, green: 0.64, blue: 0.70, alpha: 1.0))
    static let border = Color(light: PlatformColor(red: 0.88, green: 0.89, blue: 0.93, alpha: 1.0), dark: PlatformColor(red: 0.18, green: 0.18, blue: 0.21, alpha: 1.0))
    static let inputBackground = Color(light: PlatformColor(red: 0.95, green: 0.95, blue: 0.96, alpha: 1.0), dark: PlatformColor(red: 0.14, green: 0.14, blue: 0.17, alpha: 1.0))
    static let tabBarBackground = Color(light: .white, dark: PlatformColor(red: 0.08, green: 0.08, blue: 0.10, alpha: 1.0))
}

private extension Color {
    init(light: PlatformColor, dark: PlatformColor) {
        #if canImport(UIKit)
        self = Color(PlatformColor { traits in
            traits.userInterfaceStyle == .dark ? dark : light
        })
        #elseif canImport(AppKit)
        self = Color(PlatformColor(name: nil) { appearance in
            appearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? dark : light
        })
        #else
        self = Color.white
        #endif
    }
}
