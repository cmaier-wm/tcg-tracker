import Foundation
import Observation

@MainActor
@Observable
final class SettingsStore {
    private let apiClient: APIClientProtocol

    var settings: TeamsAlertSettings?
    var history: [TeamsAlertHistoryEntry] = []
    var isLoading = false
    var isSaving = false
    var errorMessage: String?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    var currentThemeMode: ThemeMode {
        settings?.themeMode ?? .light
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            async let settingsRequest = apiClient.fetchSettings()
            async let historyRequest = apiClient.fetchSettingsHistory(page: 1, pageSize: 5)
            let fetchedSettings = try await settingsRequest
            let fetchedHistory = try await historyRequest
            settings = fetchedSettings
            history = fetchedHistory.items
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func save(
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
            settings = try await apiClient.updateSettings(
                TeamsAlertSettingsUpdate(
                    themeMode: themeMode,
                    enabled: enabled,
                    destinationLabel: destinationLabel,
                    triggerAmountUsd: triggerAmountUsd,
                    webhookUrl: webhookURL
                )
            )
            let refreshedHistory = try await apiClient.fetchSettingsHistory(page: 1, pageSize: 5)
            history = refreshedHistory.items
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
