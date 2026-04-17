import Foundation
import Observation

@MainActor
@Observable
final class SettingsStore {
    private enum StorageKey {
        static let themeMode = "settings.theme-mode"
    }

    private let apiClient: APIClientProtocol
    private let userDefaults: UserDefaults

    var accountSettings: AccountSettings?
    var settings: TeamsAlertSettings?
    var history: [TeamsAlertHistoryEntry] = []
    var isLoading = false
    var isSaving = false
    var errorMessage: String?
    var previewThemeMode: ThemeMode?
    private(set) var localThemeMode: ThemeMode

    init(apiClient: APIClientProtocol, userDefaults: UserDefaults = .standard) {
        self.apiClient = apiClient
        self.userDefaults = userDefaults
        self.localThemeMode = ThemeMode(
            rawValue: userDefaults.string(forKey: StorageKey.themeMode) ?? ""
        ) ?? .dark
    }

    var currentThemeMode: ThemeMode {
        previewThemeMode ?? accountSettings?.themeMode ?? localThemeMode
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            async let accountSettingsRequest = apiClient.fetchAccountSettings()
            async let settingsRequest = apiClient.fetchSettings()
            async let historyRequest = apiClient.fetchSettingsHistory(page: 1, pageSize: 5)
            let fetchedAccountSettings = try await accountSettingsRequest
            let fetchedSettings = try await settingsRequest
            let fetchedHistory = try await historyRequest
            accountSettings = fetchedAccountSettings
            persistThemeMode(fetchedAccountSettings.themeMode)
            settings = fetchedSettings
            history = fetchedHistory.items
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func save(
        isAuthenticated: Bool,
        themeMode: ThemeMode? = nil,
        destinationLabel: String? = nil,
        triggerAmountUsd: Int? = nil,
        webhookURL: String? = nil,
        enabled: Bool? = nil
    ) async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        do {
            if let themeMode {
                persistThemeMode(themeMode)

                if isAuthenticated, themeMode != accountSettings?.themeMode {
                    accountSettings = try await apiClient.updateAccountSettings(themeMode: themeMode)
                }
            }

            if isAuthenticated, shouldUpdateTeamsSettings(
                destinationLabel: destinationLabel,
                triggerAmountUsd: triggerAmountUsd,
                webhookURL: webhookURL,
                enabled: enabled
            ) {
                settings = try await apiClient.updateSettings(
                    TeamsAlertSettingsUpdate(
                        enabled: enabled,
                        destinationLabel: destinationLabel,
                        triggerAmountUsd: triggerAmountUsd,
                        webhookUrl: webhookURL
                    )
                )
                let refreshedHistory = try await apiClient.fetchSettingsHistory(page: 1, pageSize: 5)
                history = refreshedHistory.items
            }

            previewThemeMode = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func clearThemePreview() {
        previewThemeMode = nil
    }

    private func persistThemeMode(_ themeMode: ThemeMode) {
        localThemeMode = themeMode
        userDefaults.set(themeMode.rawValue, forKey: StorageKey.themeMode)
    }

    private func shouldUpdateTeamsSettings(
        destinationLabel: String?,
        triggerAmountUsd: Int?,
        webhookURL: String?,
        enabled: Bool?
    ) -> Bool {
        let current = settings
        let normalizedDestinationLabel = destinationLabel?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let currentDestinationLabel = current?.destinationLabel ?? ""
        let normalizedWebhookURL = webhookURL?.trimmingCharacters(in: .whitespacesAndNewlines)
        let nextEnabled = enabled ?? current?.enabled ?? false
        let nextTriggerAmountUsd = triggerAmountUsd ?? current?.triggerAmountUsd ?? 1000
        let hasNewWebhookURL = !(normalizedWebhookURL?.isEmpty ?? true)

        return normalizedDestinationLabel != currentDestinationLabel ||
            nextTriggerAmountUsd != (current?.triggerAmountUsd ?? 1000) ||
            hasNewWebhookURL ||
            nextEnabled != (current?.enabled ?? false)
    }
}
