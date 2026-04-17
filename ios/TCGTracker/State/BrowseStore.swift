import Foundation
import Observation

@MainActor
@Observable
final class BrowseStore {
    private let apiClient: APIClientProtocol

    var query = ""
    var selectedSort: CardSortOption = .priceDesc
    var selectedProductType: CatalogProductTypeOption = .card
    var cards: [CardListItem] = []
    var selectedCard: CardDetail?
    var selectedVariation: CardVariation?
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
                sort: selectedSort,
                productType: selectedProductType
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
                selectedVariation = preferredVariation
                selectedHistory = try await apiClient.fetchPriceHistory(
                    category: detail.category,
                    cardId: detail.id,
                    variationId: preferredVariation.id
                )
            } else {
                selectedVariation = nil
                selectedHistory = PriceHistory(variationId: "", points: [])
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func clearSelection() {
        selectedCard = nil
        selectedVariation = nil
        selectedHistory = nil
    }

    func preferredVariation(from detail: CardDetail) -> CardVariation? {
        detail.variations.reduce(into: nil as CardVariation?) { bestVariation, variation in
            guard let currentBest = bestVariation else {
                bestVariation = variation
                return
            }

            if isPreferredVariation(variation, over: currentBest) {
                bestVariation = variation
            }
        }
    }

    private func isPreferredVariation(_ candidate: CardVariation, over currentBest: CardVariation) -> Bool {
        let candidateRank = (
            priceRank(candidate),
            languageRank(candidate),
            conditionRank(for: candidate.conditionCode),
            candidate.isDefault == true ? 0 : 1,
            -(candidate.currentPrice ?? -1)
        )
        let currentRank = (
            priceRank(currentBest),
            languageRank(currentBest),
            conditionRank(for: currentBest.conditionCode),
            currentBest.isDefault == true ? 0 : 1,
            -(currentBest.currentPrice ?? -1)
        )

        return candidateRank < currentRank
    }

    private func priceRank(_ variation: CardVariation) -> Int {
        variation.currentPrice != nil ? 0 : 1
    }

    private func languageRank(_ variation: CardVariation) -> Int {
        if variation.languageCode?.lowercased() == "en" {
            return 0
        }

        if variation.languageCode == nil {
            return 1
        }

        return 2
    }

    private func conditionRank(for code: String?) -> Int {
        switch code?.uppercased() {
        case "NM":
            return 0
        case "LP":
            return 1
        case "MP":
            return 2
        case "HP":
            return 3
        case "DMG":
            return 4
        case nil:
            return 5
        default:
            return 6
        }
    }
}
