import Foundation
import Observation

@MainActor
@Observable
final class PortfolioStore {
    private let apiClient: APIClientProtocol

    var portfolio: PortfolioResponse?
    var isLoading = false
    var isLoadingMore = false
    var errorMessage: String?
    var confirmationMessage: String?
    var onMutation: (() async -> Void)?
    private var confirmationTask: Task<Void, Never>?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    func holding(for variationId: String?) -> PortfolioHolding? {
        guard let variationId else { return nil }
        return portfolio?.holdings.first(where: { $0.cardVariationId == variationId })
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            portfolio = try await apiClient.fetchPortfolio(page: 1)
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
        let addedHolding = await mutate {
            try await apiClient.addHolding(cardVariationId: variationId, quantity: quantity)
        }

        if let addedHolding {
            ensureHoldingIsVisible(addedHolding)
            showConfirmation(
                message: makeAddConfirmationMessage(
                    cardName: addedHolding.cardName ?? "card",
                    quantityAdded: quantity,
                    totalQuantity: addedHolding.quantity
                )
            )
        }

        return addedHolding
    }

    func showConfirmation(message: String) {
        confirmationMessage = message

        confirmationTask?.cancel()
        confirmationTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            guard !Task.isCancelled else { return }
            if confirmationMessage == message {
                confirmationMessage = nil
            }
        }
    }

    func clearConfirmation() {
        confirmationTask?.cancel()
        confirmationMessage = nil
    }

    func updateHolding(_ holdingId: String, quantity: Int) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let previousHolding = portfolio?.holdings.first(where: { $0.id == holdingId })

        do {
            try await apiClient.updateHolding(holdingId: holdingId, quantity: quantity)
            applyUpdatedHolding(holdingId: holdingId, quantity: quantity)
            await refreshPortfolioAfterMutation()
            await onMutation?()
            showConfirmation(
                message: makeUpdateConfirmationMessage(
                    cardName: previousHolding?.cardName ?? "card",
                    totalQuantity: quantity
                )
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeHolding(_ holdingId: String) async {
        let removedHolding = portfolio?.holdings.first(where: { $0.id == holdingId })
        await mutate {
            try await apiClient.removeHolding(holdingId: holdingId)
        }

        if errorMessage == nil {
            showConfirmation(
                message: makeRemoveConfirmationMessage(
                    cardName: removedHolding?.cardName ?? "card"
                )
            )
        }
    }

    func loadMoreIfNeeded() async {
        guard !isLoading, !isLoadingMore, let currentPortfolio = portfolio, let nextPage = currentPortfolio.nextPage else {
            return
        }

        isLoadingMore = true
        errorMessage = nil
        defer { isLoadingMore = false }

        let previousPortfolio = portfolio

        do {
            let nextPageResponse = try await apiClient.fetchPortfolio(page: nextPage)
            portfolio = append(portfolio: currentPortfolio, with: nextPageResponse)
        } catch {
            portfolio = previousPortfolio
            errorMessage = error.localizedDescription
        }
    }

    private func mutate<Result>(_ operation: () async throws -> Result) async -> Result? {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await operation()
            await refreshPortfolioAfterMutation()
            await onMutation?()
            return result
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    private func refreshPortfolioAfterMutation() async {
        guard let currentPortfolio = portfolio else {
            do {
                portfolio = try await apiClient.fetchPortfolio(page: 1)
            } catch {
                // Keep the current state when the refresh fails.
            }
            return
        }

        let pagesToRefresh = max(currentPortfolio.currentPage, 1)
        let previousPortfolio = currentPortfolio
        var refreshedPortfolio: PortfolioResponse?

        do {
            for page in 1...pagesToRefresh {
                let pageResponse = try await apiClient.fetchPortfolio(page: page)
                refreshedPortfolio = append(portfolio: refreshedPortfolio, with: pageResponse)
            }

            portfolio = refreshedPortfolio
        } catch {
            portfolio = previousPortfolio
        }
    }

    private func append(portfolio currentPortfolio: PortfolioResponse?, with incomingPage: PortfolioResponse) -> PortfolioResponse {
        guard let currentPortfolio else { return incomingPage }

        let existingIDs = Set(currentPortfolio.holdings.map(\.id))
        let mergedHoldings = currentPortfolio.holdings + incomingPage.holdings.filter { !existingIDs.contains($0.id) }

        return PortfolioResponse(
            holdings: mergedHoldings,
            totalEstimatedValue: incomingPage.totalEstimatedValue,
            holdingCount: incomingPage.holdingCount,
            page: incomingPage.page,
            pageSize: incomingPage.pageSize,
            totalPages: incomingPage.totalPages,
            totalItems: incomingPage.totalItems
        )
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
            totalEstimatedValue: currentPortfolio.totalEstimatedValue,
            holdingCount: currentPortfolio.holdingCount,
            page: currentPortfolio.page,
            pageSize: currentPortfolio.pageSize,
            totalPages: currentPortfolio.totalPages,
            totalItems: currentPortfolio.totalItems ?? currentPortfolio.holdingCount
        )
    }

    private func ensureHoldingIsVisible(_ holding: PortfolioHolding) {
        guard let currentPortfolio = portfolio else {
            portfolio = PortfolioResponse(
                holdings: [holding],
                totalEstimatedValue: holding.estimatedValue,
                holdingCount: 1,
                page: 1,
                pageSize: 20,
                totalPages: 1,
                totalItems: 1
            )
            return
        }

        var holdings = currentPortfolio.holdings

        if let existingIndex = holdings.firstIndex(where: { $0.id == holding.id }) {
            holdings[existingIndex] = holding
        } else {
            holdings.insert(holding, at: 0)
        }

        portfolio = PortfolioResponse(
            holdings: holdings,
            totalEstimatedValue: currentPortfolio.totalEstimatedValue,
            holdingCount: currentPortfolio.holdingCount,
            page: currentPortfolio.page,
            pageSize: currentPortfolio.pageSize,
            totalPages: currentPortfolio.totalPages,
            totalItems: currentPortfolio.totalItems
        )
    }

    private func makeAddConfirmationMessage(
        cardName: String,
        quantityAdded: Int,
        totalQuantity: Int
    ) -> String {
        let addedText = quantityAdded == 1 ? "1 copy" : "\(quantityAdded) copies"
        let totalText = totalQuantity == 1 ? "1 copy" : "\(totalQuantity) copies"
        return "Added \(addedText) of \(cardName). Portfolio now shows \(totalText)."
    }

    private func makeUpdateConfirmationMessage(
        cardName: String,
        totalQuantity: Int
    ) -> String {
        let totalText = totalQuantity == 1 ? "1 copy" : "\(totalQuantity) copies"
        return "Updated \(cardName). You now have \(totalText) in your portfolio."
    }

    private func makeRemoveConfirmationMessage(cardName: String) -> String {
        return "Removed \(cardName) from your portfolio."
    }
}
