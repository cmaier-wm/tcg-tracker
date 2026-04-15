import SwiftUI

struct RootView: View {
    @State private var appModel = AppModel()
    @AppStorage("tcgtracker.theme-mode") private var themeModeRawValue = ThemeMode.system.rawValue

    var body: some View {
        SignedInShellView(
            appModel: appModel,
            themeMode: bindingThemeMode
        )
        .task {
            await appModel.start()
        }
        .preferredColorScheme(bindingThemeMode.wrappedValue.colorScheme)
    }

    private var bindingThemeMode: Binding<ThemeMode> {
        Binding(
            get: { ThemeMode(rawValue: themeModeRawValue) ?? .system },
            set: { themeModeRawValue = $0.rawValue }
        )
    }
}
