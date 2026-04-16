import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    let sessionStore: SessionStore
    let browseStore: BrowseStore
    let portfolioStore: PortfolioStore
    let settingsStore: SettingsStore
    var isBootstrapping = true

    init(apiClient: APIClientProtocol = APIClient()) {
        sessionStore = SessionStore(apiClient: apiClient)
        browseStore = BrowseStore(apiClient: apiClient)
        portfolioStore = PortfolioStore(apiClient: apiClient)
        settingsStore = SettingsStore(apiClient: apiClient)

        portfolioStore.onMutation = { [weak self] in
            await self?.sessionStore.refreshHome()
        }
    }

    func start() async {
        defer { isBootstrapping = false }
        await sessionStore.restoreSession()
        async let browseLoad: Void = browseStore.search()

        guard sessionStore.isAuthenticated else {
            _ = await browseLoad
            return
        }

        async let portfolioLoad: Void = portfolioStore.load()
        async let settingsLoad: Void = settingsStore.load()
        _ = await (browseLoad, portfolioLoad, settingsLoad)
    }

    func refreshProtectedData() async {
        guard sessionStore.isAuthenticated else { return }

        async let homeLoad: Void = sessionStore.refreshHome()
        async let browseLoad: Void = browseStore.search()
        async let portfolioLoad: Void = portfolioStore.load()
        async let settingsLoad: Void = settingsStore.load()
        _ = await (homeLoad, browseLoad, portfolioLoad, settingsLoad)
    }

    func clearProtectedData() {
        portfolioStore.portfolio = nil
        portfolioStore.errorMessage = nil
        settingsStore.accountSettings = nil
        settingsStore.settings = nil
        settingsStore.history = []
        settingsStore.previewThemeMode = nil
        settingsStore.errorMessage = nil
    }
}
