import SwiftUI

struct RootView: View {
    @State private var appModel = AppModel()

    var body: some View {
        SignedInShellView(
            appModel: appModel
        )
        .task {
            await appModel.start()
        }
        .preferredColorScheme(appModel.settingsStore.currentThemeMode.colorScheme)
    }
}
