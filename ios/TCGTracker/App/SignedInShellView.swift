import SwiftUI

private enum AppTab: Hashable {
    case browse
    case portfolio
}

struct SignedInShellView: View {
    @Bindable var appModel: AppModel
    @Binding var themeMode: ThemeMode
    @State private var showingSettings = false
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
                .toolbar {
                    ToolbarItem {
                        Label {
                            Text("TCG Tracker")
                                .font(.headline)
                        } icon: {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(
                                        LinearGradient(
                                            colors: [AppTheme.accent, .purple],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 34, height: 34)
                                Image(systemName: "magnifyingglass")
                                    .font(.headline.weight(.bold))
                                    .foregroundStyle(.white)
                            }
                        }
                    }

                    ToolbarItemGroup {
                        Menu {
                            ForEach(ThemeMode.allCases) { mode in
                                Button {
                                    themeMode = mode
                                } label: {
                                    Label(mode.displayName, systemImage: mode.symbolName)
                                }
                            }
                        } label: {
                            Image(systemName: themeMode.symbolName)
                        }

                        if appModel.sessionStore.isAuthenticated {
                            Button {
                                showingSettings = true
                            } label: {
                                Image(systemName: "gearshape.fill")
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
                        SignInRequiredView {
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
        }
        .sheet(isPresented: $showingSettings) {
            NavigationStack {
                SettingsView(settingsStore: appModel.settingsStore, themeMode: $themeMode)
                    .toolbar {
                        ToolbarItem {
                            Button("Close") {
                                showingSettings = false
                            }
                        }
                    }
            }
        }
        .sheet(isPresented: $showingSignIn) {
            SignInView(sessionStore: appModel.sessionStore) {
                await appModel.refreshProtectedData()
                await MainActor.run {
                    showingSignIn = false
                    selectedTab = .portfolio
                }
            }
        }
    }
}

private struct SignInRequiredView: View {
    let onSignIn: () -> Void

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "person.crop.circle.badge.exclamationmark")
                .font(.system(size: 42))
                .foregroundStyle(AppTheme.accent)

            Text("Sign in to view your portfolio")
                .font(.title3.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary)

            Text("Browsing cards stays public. Your saved holdings and alert settings remain account-protected.")
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
