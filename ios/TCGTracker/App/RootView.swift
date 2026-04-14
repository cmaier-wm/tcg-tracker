import SwiftUI

struct RootView: View {
    @State private var appModel = AppModel()

    var body: some View {
        Group {
            if appModel.sessionStore.isAuthenticated {
                SignedInShellView(appModel: appModel)
            } else {
                SignInView(sessionStore: appModel.sessionStore) {
                    await appModel.refreshProtectedData()
                }
            }
        }
        .task {
            await appModel.start()
        }
    }
}
