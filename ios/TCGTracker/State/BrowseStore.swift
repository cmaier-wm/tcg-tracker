import Foundation
import Observation

@MainActor
@Observable
final class BrowseStore {
    private let apiClient: APIClientProtocol

    var query = ""
    var selectedSort: CardSortOption = .priceDesc
    var cards: [CardListItem] = []
    var selectedCard: CardDetail?
    var selectedHistory: PriceHistory?
    var isLoading = false
    var errorMessage: String?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    func search() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            cards = try await apiClient.browseCards(
                query: query.trimmingCharacters(in: .whitespacesAndNewlines),
                sort: selectedSort
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func select(card: CardListItem) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let detail = try await apiClient.fetchCardDetail(category: card.category, cardId: card.id)
            selectedCard = detail

            if let preferredVariation = preferredVariation(from: detail) {
                selectedHistory = try await apiClient.fetchPriceHistory(
                    category: detail.category,
                    cardId: detail.id,
                    variationId: preferredVariation.id
                )
            } else {
                selectedHistory = PriceHistory(variationId: "", points: [])
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func clearSelection() {
        selectedCard = nil
        selectedHistory = nil
    }

    func preferredVariation(from detail: CardDetail) -> CardVariation? {
        detail.variations.first(where: { $0.isDefault == true }) ??
        detail.variations.first(where: { $0.currentPrice != nil }) ??
        detail.variations.first
    }
}
