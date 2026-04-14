import Foundation
import Observation

@MainActor
@Observable
final class PortfolioStore {
    private let apiClient: APIClientProtocol

    var portfolio: PortfolioResponse?
    var isLoading = false
    var errorMessage: String?
    var onMutation: (() async -> Void)?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            portfolio = try await apiClient.fetchPortfolio()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addHolding(variationId: String, quantity: Int) async {
        await mutate {
            _ = try await apiClient.addHolding(cardVariationId: variationId, quantity: quantity)
        }
    }

    func updateHolding(_ holdingId: String, quantity: Int) async {
        await mutate {
            _ = try await apiClient.updateHolding(holdingId: holdingId, quantity: quantity)
        }
    }

    func removeHolding(_ holdingId: String) async {
        await mutate {
            try await apiClient.removeHolding(holdingId: holdingId)
        }
    }

    private func mutate(_ operation: () async throws -> Void) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await operation()
            portfolio = try await apiClient.fetchPortfolio()
            await onMutation?()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
