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

        let addedHolding = await store.addHolding(variationId: "variation-1", quantity: 2)

        XCTAssertEqual(apiClient.addedHoldingVariationID, "variation-1")
        XCTAssertEqual(addedHolding?.cardVariationId, "variation-1")
        XCTAssertEqual(addedHolding?.quantity, 2)
        XCTAssertTrue(didRefresh)
    }

    func testAddHoldingPinsNewHoldingIntoVisiblePortfolioList() async {
        let apiClient = MockAPIClient()
        apiClient.portfolioResult = .success(
            PortfolioResponse(
                holdings: [
                    PortfolioHolding(
                        id: "holding-existing",
                        cardVariationId: "variation-existing",
                        cardName: "Existing Card",
                        variationLabel: "Unlimited",
                        quantity: 1,
                        estimatedValue: 999,
                        cardId: "card-existing",
                        category: "pokemon",
                        imageUrl: nil
                    )
                ],
                totalEstimatedValue: 1041,
                holdingCount: 2,
                page: 1,
                pageSize: 1,
                totalPages: 2,
                totalItems: 2
            )
        )
        apiClient.addHoldingResult = .success(
            PortfolioHolding(
                id: "holding-new",
                cardVariationId: "variation-new",
                cardName: "New Card",
                variationLabel: "Unlimited",
                quantity: 1,
                estimatedValue: 42,
                cardId: "card-new",
                category: "pokemon",
                imageUrl: nil
            )
        )

        let store = PortfolioStore(apiClient: apiClient)

        await store.load()
        let addedHolding = await store.addHolding(variationId: "variation-new", quantity: 1)

        XCTAssertEqual(addedHolding?.id, "holding-new")
        XCTAssertEqual(store.portfolio?.holdings.first?.id, "holding-new")
        XCTAssertEqual(store.portfolio?.holdings.count, 2)
    }

    func testPortfolioLoadMoreAppendsAdditionalPages() async {
        let apiClient = MockAPIClient()
        apiClient.portfolioResult = .success(
            PortfolioResponse(
                holdings: [
                    PortfolioHolding(
                        id: "holding-1",
                        cardVariationId: "variation-1",
                        cardName: "Charizard ex",
                        variationLabel: "English NM Holo",
                        quantity: 1,
                        estimatedValue: 120,
                        cardId: "card-1",
                        category: "pokemon",
                        imageUrl: nil
                    )
                ],
                totalEstimatedValue: 240,
                holdingCount: 2,
                page: 1,
                pageSize: 1,
                totalPages: 2,
                totalItems: 2
            )
        )
        apiClient.portfolioPageResults[2] = .success(
            PortfolioResponse(
                holdings: [
                    PortfolioHolding(
                        id: "holding-2",
                        cardVariationId: "variation-2",
                        cardName: "Lugia ex",
                        variationLabel: "English NM Holo",
                        quantity: 1,
                        estimatedValue: 120,
                        cardId: "card-2",
                        category: "pokemon",
                        imageUrl: nil
                    )
                ],
                totalEstimatedValue: 240,
                holdingCount: 2,
                page: 2,
                pageSize: 1,
                totalPages: 2,
                totalItems: 2
            )
        )

        let store = PortfolioStore(apiClient: apiClient)

        await store.load()
        await store.loadMoreIfNeeded()

        XCTAssertEqual(apiClient.portfolioFetchPages, [1, 2])
        XCTAssertEqual(store.portfolio?.holdings.map(\.id), ["holding-1", "holding-2"])
        XCTAssertFalse(store.portfolio?.canLoadMore ?? true)
        XCTAssertEqual(store.portfolio?.currentPage, 2)
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
        let (userDefaults, suiteName) = makeIsolatedUserDefaults()
        defer { userDefaults.removePersistentDomain(forName: suiteName) }
        let store = SettingsStore(apiClient: apiClient, userDefaults: userDefaults)

        await store.load()
        XCTAssertEqual(store.settings?.triggerAmountUsd, 1500)
        XCTAssertEqual(store.accountSettings?.themeMode, .light)
        XCTAssertEqual(store.currentThemeMode, .light)
        XCTAssertEqual(store.history.count, 1)

        await store.save(
            isAuthenticated: true,
            themeMode: .dark,
            destinationLabel: "Trading alerts",
            triggerAmountUsd: 2000,
            webhookURL: "https://example.com/new-hook",
            enabled: true
        )

        XCTAssertEqual(store.settings?.triggerAmountUsd, 2000)
        XCTAssertEqual(store.accountSettings?.themeMode, .dark)
        XCTAssertEqual(store.currentThemeMode, .dark)
        XCTAssertEqual(store.localThemeMode, .dark)
        XCTAssertEqual(store.settings?.webhookUrl, "https://example.com/new-hook")
        XCTAssertEqual(apiClient.updatedAccountThemeMode, .dark)
        XCTAssertEqual(apiClient.settingsHistoryLoadCount, 2)
    }

    func testSignedOutThemeSavePersistsLocallyWithoutCallingAccountAPI() async {
        let apiClient = MockAPIClient()
        let (userDefaults, suiteName) = makeIsolatedUserDefaults()
        defer { userDefaults.removePersistentDomain(forName: suiteName) }
        let store = SettingsStore(apiClient: apiClient, userDefaults: userDefaults)

        await store.save(isAuthenticated: false, themeMode: .light)

        XCTAssertEqual(store.currentThemeMode, .light)
        XCTAssertEqual(store.localThemeMode, .light)
        XCTAssertNil(store.accountSettings)
        XCTAssertNil(apiClient.updatedAccountThemeMode)

        let reloadedStore = SettingsStore(apiClient: apiClient, userDefaults: userDefaults)
        XCTAssertEqual(reloadedStore.currentThemeMode, .light)
    }

    private func makeIsolatedUserDefaults() -> (UserDefaults, String) {
        let suiteName = "PortfolioAndSettingsStoreTests.\(UUID().uuidString)"
        let userDefaults = UserDefaults(suiteName: suiteName)!
        userDefaults.removePersistentDomain(forName: suiteName)
        return (userDefaults, suiteName)
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

    func testPortfolioStoreFindsHoldingByVariationID() async {
        let apiClient = MockAPIClient()
        let store = PortfolioStore(apiClient: apiClient)

        await store.load()

        let holding = store.holding(for: "variation-1")

        XCTAssertEqual(holding?.id, "holding-1")
        XCTAssertNil(store.holding(for: "variation-missing"))
        XCTAssertNil(store.holding(for: nil))
    }

    func testPortfolioResponseFlagsPartialHoldingList() {
        let response = PortfolioResponse(
            holdings: [
                PortfolioHolding(
                    id: "holding-1",
                    cardVariationId: "variation-1",
                    cardName: "Dark Magician",
                    variationLabel: "LOB Unlimited",
                    quantity: 2,
                    estimatedValue: 84,
                    cardId: "card-1",
                    category: "yugioh",
                    imageUrl: nil
                )
            ],
            totalEstimatedValue: 84,
            holdingCount: 3,
            page: 1,
            pageSize: 1,
            totalPages: 3,
            totalItems: 3
        )

        XCTAssertTrue(response.showsPartialHoldingsList)
        XCTAssertEqual(response.displayedHoldingCount, 1)
        XCTAssertEqual(response.allHoldingCount, 3)
    }
}
