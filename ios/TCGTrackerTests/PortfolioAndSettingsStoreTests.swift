import XCTest
@testable import TCGTracker

@MainActor
final class PortfolioAndSettingsStoreTests: XCTestCase {
    func testPortfolioMutationsTriggerRefreshHook() async {
        let apiClient = MockAPIClient()
        let store = PortfolioStore(apiClient: apiClient)
        var didRefresh = false
        store.onMutation = {
            didRefresh = true
        }

        await store.addHolding(variationId: "variation-1", quantity: 2)

        XCTAssertEqual(apiClient.addedHoldingVariationID, "variation-1")
        XCTAssertTrue(didRefresh)
    }

    func testUpdateHoldingAppliesLocalPortfolioState() async {
        let apiClient = MockAPIClient()
        let store = PortfolioStore(apiClient: apiClient)

        await store.load()
        await store.updateHolding("holding-1", quantity: 3)

        XCTAssertEqual(apiClient.updatedHoldingQuantity, 3)
        XCTAssertEqual(store.portfolio?.holdings.first?.quantity, 3)
        XCTAssertEqual(store.portfolio?.holdings.first?.estimatedValue, 360)
    }

    func testSettingsLoadAndSaveRoundTrip() async {
        let apiClient = MockAPIClient()
        let store = SettingsStore(apiClient: apiClient)

        await store.load()
        XCTAssertEqual(store.settings?.triggerAmountUsd, 1500)
        XCTAssertEqual(store.currentThemeMode, .light)
        XCTAssertEqual(store.history.count, 1)

        await store.save(
            themeMode: .dark,
            destinationLabel: "Trading alerts",
            triggerAmountUsd: 2000,
            webhookURL: "https://example.com/new-hook",
            enabled: true
        )

        XCTAssertEqual(store.settings?.triggerAmountUsd, 2000)
        XCTAssertEqual(store.settings?.themeMode, .dark)
        XCTAssertEqual(store.settings?.webhookUrl, "https://example.com/new-hook")
        XCTAssertEqual(apiClient.settingsHistoryLoadCount, 2)
    }

    func testPortfolioHoldingMapsToDetailCardItem() throws {
        let holding = PortfolioHolding(
            id: "holding-1",
            cardVariationId: "variation-1",
            cardName: "Dark Magician",
            variationLabel: "LOB Unlimited",
            quantity: 2,
            estimatedValue: 84,
            cardId: "card-1",
            category: "yugioh",
            imageUrl: "https://example.com/card.png"
        )

        let card = try XCTUnwrap(holding.detailCardItem)

        XCTAssertEqual(card.id, "card-1")
        XCTAssertEqual(card.category, "yugioh")
        XCTAssertEqual(card.name, "Dark Magician")
        XCTAssertEqual(card.setName, "LOB Unlimited")
        XCTAssertEqual(card.currentPrice, 42)
        XCTAssertEqual(card.imageUrl, "https://example.com/card.png")
    }
}
