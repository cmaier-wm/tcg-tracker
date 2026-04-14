import Foundation
import Observation

@MainActor
@Observable
final class SettingsStore {
    private let apiClient: APIClientProtocol

    var settings: TeamsAlertSettings?
    var isLoading = false
    var isSaving = false
    var errorMessage: String?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            settings = try await apiClient.fetchSettings()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func save(destinationLabel: String, triggerAmountUsd: Int, webhookURL: String?, enabled: Bool) async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        do {
            settings = try await apiClient.updateSettings(
                TeamsAlertSettingsUpdate(
                    enabled: enabled,
                    destinationLabel: destinationLabel,
                    triggerAmountUsd: triggerAmountUsd,
                    webhookUrl: webhookURL
                )
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
