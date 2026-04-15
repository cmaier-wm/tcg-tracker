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
        } catch let error as APIClientError {
            if case let .server(statusCode, _) = error, statusCode == 401 {
                portfolio = nil
                return
            }
            errorMessage = error.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addHolding(variationId: String, quantity: Int) async -> PortfolioHolding? {
        await mutate {
            try await apiClient.addHolding(cardVariationId: variationId, quantity: quantity)
        }
    }

    func updateHolding(_ holdingId: String, quantity: Int) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await apiClient.updateHolding(holdingId: holdingId, quantity: quantity)
            applyUpdatedHolding(holdingId: holdingId, quantity: quantity)
            await onMutation?()
            await refreshPortfolioSnapshot()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeHolding(_ holdingId: String) async {
        await mutate {
            try await apiClient.removeHolding(holdingId: holdingId)
        }
    }

    private func mutate<Result>(_ operation: () async throws -> Result) async -> Result? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await operation()
            portfolio = try await apiClient.fetchPortfolio()
            await onMutation?()
            return result
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    private func applyUpdatedHolding(holdingId: String, quantity: Int) {
        guard let currentPortfolio = portfolio else { return }

        let holdings = currentPortfolio.holdings.map { holding in
            guard holding.id == holdingId else { return holding }

            let unitValue = holding.quantity > 0 ? holding.estimatedValue / Double(holding.quantity) : 0

            return PortfolioHolding(
                id: holding.id,
                cardVariationId: holding.cardVariationId,
                cardName: holding.cardName,
                variationLabel: holding.variationLabel,
                quantity: quantity,
                estimatedValue: unitValue * Double(quantity),
                cardId: holding.cardId,
                category: holding.category,
                imageUrl: holding.imageUrl
            )
        }

        portfolio = PortfolioResponse(
            holdings: holdings,
            totalEstimatedValue: holdings.reduce(0) { $0 + $1.estimatedValue },
            holdingCount: holdings.count,
            page: currentPortfolio.page,
            pageSize: currentPortfolio.pageSize,
            totalPages: currentPortfolio.totalPages,
            totalItems: currentPortfolio.totalItems ?? holdings.count
        )
    }

    private func refreshPortfolioSnapshot() async {
        do {
            portfolio = try await apiClient.fetchPortfolio()
        } catch {
            // Keep the optimistic portfolio state when the follow-up refresh fails.
        }
    }
}
