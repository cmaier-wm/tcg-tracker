import SwiftUI

private enum AppTab: Hashable {
    case browse
    case portfolio
    case settings
}

struct SignedInShellView: View {
    @Bindable var appModel: AppModel
    @State private var showingSignIn = false
    @State private var selectedTab: AppTab = .browse

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                BrowseView(
                    browseStore: appModel.browseStore,
                    portfolioStore: appModel.portfolioStore,
                    sessionStore: appModel.sessionStore
                )
            }
            .tabItem {
                Label("Browse", systemImage: "magnifyingglass")
            }
            .tag(AppTab.browse)

            NavigationStack {
                Group {
                    if appModel.sessionStore.isAuthenticated {
                        PortfolioView(
                            sessionStore: appModel.sessionStore,
                            portfolioStore: appModel.portfolioStore,
                            browseStore: appModel.browseStore
                        )
                    } else {
                        SignInRequiredView(
                            title: "Sign in to view your portfolio",
                            detail: "Browsing cards stays public. Your saved holdings and alert settings remain account-protected."
                        ) {
                            showingSignIn = true
                        }
                    }
                }
                .toolbar {
                    ToolbarItem {
                        Text("Portfolio")
                            .font(.headline)
                    }

                    ToolbarItemGroup {
                        if appModel.sessionStore.isAuthenticated {
                            Button("Sign Out") {
                                Task {
                                    await appModel.sessionStore.signOut()
                                    appModel.clearProtectedData()
                                }
                            }
                        } else {
                            Button("Sign In") {
                                showingSignIn = true
                            }
                        }
                    }
                }
            }
            .tabItem {
                Label("Portfolio", systemImage: "wallet.pass")
            }
            .tag(AppTab.portfolio)

            NavigationStack {
                SettingsView(
                    settingsStore: appModel.settingsStore,
                    isAuthenticated: appModel.sessionStore.isAuthenticated
                ) {
                    showingSignIn = true
                }
                .toolbar {
                    ToolbarItem {
                        Text("Settings")
                            .font(.headline)
                    }

                    ToolbarItemGroup {
                        if appModel.sessionStore.isAuthenticated {
                            Button("Sign Out") {
                                Task {
                                    await appModel.sessionStore.signOut()
                                    appModel.clearProtectedData()
                                }
                            }
                        } else {
                            Button("Sign In") {
                                showingSignIn = true
                            }
                        }
                    }
                }
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape")
            }
            .tag(AppTab.settings)
        }
        .sheet(isPresented: $showingSignIn) {
            SignInView(sessionStore: appModel.sessionStore) {
                await appModel.refreshProtectedData()
                await MainActor.run {
                    showingSignIn = false
                    if selectedTab == .browse {
                        selectedTab = .portfolio
                    }
                }
            }
        }
    }
}

private struct SignInRequiredView: View {
    let title: String
    let detail: String
    let onSignIn: () -> Void

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "person.crop.circle.badge.exclamationmark")
                .font(.system(size: 42))
                .foregroundStyle(AppTheme.accent)

            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary)

            Text(detail)
                .multilineTextAlignment(.center)
                .foregroundStyle(AppTheme.textSecondary)

            Button("Sign In", action: onSignIn)
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppTheme.background.ignoresSafeArea())
    }
}
