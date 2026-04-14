import SwiftUI

struct SignedInShellView: View {
    @Bindable var appModel: AppModel
    @State private var showingSettings = false

    var body: some View {
        TabView {
            NavigationStack {
                BrowseView(
                    browseStore: appModel.browseStore,
                    portfolioStore: appModel.portfolioStore
                )
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("TCG Tracker")
                                .font(.headline)
                            Text(appModel.sessionStore.session?.user.displayName ?? "")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Settings") {
                            showingSettings = true
                        }
                    }
                }
            }
            .tabItem {
                Label("Browse", systemImage: "magnifyingglass")
            }

            NavigationStack {
                PortfolioView(
                    sessionStore: appModel.sessionStore,
                    portfolioStore: appModel.portfolioStore
                )
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Sign Out") {
                            Task {
                                await appModel.sessionStore.signOut()
                            }
                        }
                    }
                }
            }
            .tabItem {
                Label("Portfolio", systemImage: "wallet.pass")
            }
        }
        .sheet(isPresented: $showingSettings) {
            NavigationStack {
                SettingsView(settingsStore: appModel.settingsStore)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Close") {
                                showingSettings = false
                            }
                        }
                    }
            }
        }
    }
}
