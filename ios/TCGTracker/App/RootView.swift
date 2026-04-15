import SwiftUI

struct RootView: View {
    @State private var appModel = AppModel()

    var body: some View {
        Group {
            if appModel.isBootstrapping {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(AppTheme.background.ignoresSafeArea())
            } else {
                SignedInShellView(
                    appModel: appModel
                )
            }
        }
        .task {
            await appModel.start()
        }
        .preferredColorScheme(appModel.settingsStore.currentThemeMode.colorScheme)
    }
}
