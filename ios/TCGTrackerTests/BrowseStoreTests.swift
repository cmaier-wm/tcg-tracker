import XCTest
@testable import TCGTracker

@MainActor
final class BrowseStoreTests: XCTestCase {
    func testSearchLoadsCardResults() async {
        let apiClient = MockAPIClient()
        let store = BrowseStore(apiClient: apiClient)
        store.query = "charizard"

        await store.search()

        XCTAssertEqual(store.cards.first?.name, "Charizard ex")
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
        XCTAssertEqual(store.selectedHistory?.points.count, 2)
    }
}
