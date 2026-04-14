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

    func testSettingsLoadAndSaveRoundTrip() async {
        let apiClient = MockAPIClient()
        let store = SettingsStore(apiClient: apiClient)

        await store.load()
        XCTAssertEqual(store.settings?.triggerAmountUsd, 1500)

        await store.save(
            destinationLabel: "Trading alerts",
            triggerAmountUsd: 2000,
            webhookURL: "https://example.com/new-hook",
            enabled: true
        )

        XCTAssertEqual(store.settings?.triggerAmountUsd, 2000)
        XCTAssertEqual(store.settings?.webhookUrl, "https://example.com/new-hook")
    }
}
