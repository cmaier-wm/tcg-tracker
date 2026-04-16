import XCTest
@testable import TCGTracker

@MainActor
final class BrowseStoreTests: XCTestCase {
    func testSearchLoadsCardResults() async {
        let apiClient = MockAPIClient()
        let store = BrowseStore(apiClient: apiClient)
        store.query = "charizard"
        store.selectedSort = .rarityDesc

        await store.search()

        XCTAssertEqual(store.cards.first?.name, "Charizard ex")
        XCTAssertEqual(apiClient.lastBrowseSort, .rarityDesc)
    }

    func testSelectLoadsDetailAndHistory() async {
        let apiClient = MockAPIClient()
        let store = BrowseStore(apiClient: apiClient)

        await store.select(
            card: CardListItem(
                id: "card-1",
                category: "pokemon",
                categoryName: "Pokemon",
                setName: "151",
                name: "Charizard ex",
                collectorNumber: "6/165",
                rarity: "Ultra Rare",
                imageUrl: nil,
                currentPrice: 120,
                variationCount: 2
            )
        )

        XCTAssertEqual(store.selectedCard?.id, "card-1")
        XCTAssertEqual(store.selectedVariation?.id, "variation-1")
        XCTAssertEqual(store.selectedHistory?.points.count, 2)
    }

    func testSelectUsesTheSamePreferredVariationForPriceAndPortfolioAdds() async {
        let apiClient = MockAPIClient()
        apiClient.detailResult = .success(
            CardDetail(
                id: "card-1",
                category: "pokemon",
                categoryName: "Pokemon",
                setName: "151",
                name: "Charizard ex",
                collectorNumber: "6/165",
                rarity: "Ultra Rare",
                imageUrl: nil,
                variations: [
                    CardVariation(
                        id: "variation-no-price",
                        label: "English NM Holo",
                        languageCode: "en",
                        finish: "holo",
                        conditionCode: "nm",
                        isDefault: true,
                        currentPrice: nil,
                        lastUpdatedAt: nil
                    ),
                    CardVariation(
                        id: "variation-priced",
                        label: "Japanese NM Holo",
                        languageCode: "jp",
                        finish: "holo",
                        conditionCode: "nm",
                        isDefault: false,
                        currentPrice: 145,
                        lastUpdatedAt: nil
                    )
                ]
            )
        )
        apiClient.historyResult = .success(
            PriceHistory(
                variationId: "variation-priced",
                points: [
                    PricePoint(capturedAt: "2026-04-10T12:00:00.000Z", marketPrice: 145)
                ]
            )
        )

        let store = BrowseStore(apiClient: apiClient)

        await store.select(
            card: CardListItem(
                id: "card-1",
                category: "pokemon",
                categoryName: "Pokemon",
                setName: "151",
                name: "Charizard ex",
                collectorNumber: "6/165",
                rarity: "Ultra Rare",
                imageUrl: nil,
                currentPrice: 120,
                variationCount: 2
            )
        )

        XCTAssertEqual(store.selectedVariation?.id, "variation-priced")
        XCTAssertEqual(store.selectedVariation?.currentPrice, 145)
        XCTAssertEqual(store.selectedHistory?.variationId, "variation-priced")
    }
}
