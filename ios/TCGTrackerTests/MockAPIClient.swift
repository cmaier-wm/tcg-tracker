import Foundation
@testable import TCGTracker

final class MockAPIClient: APIClientProtocol, @unchecked Sendable {
    var browseCallCount = 0
    var portfolioLoadCount = 0
    var settingsLoadCount = 0
    var sessionResult: Result<MobileSession, Error> = .success(
        MobileSession(
            status: "authenticated",
            user: AuthenticatedUser(
                userId: "user-1",
                email: "collector@example.com",
                displayName: "Collector"
            )
        )
    )
    var homeResult: Result<MobileHome, Error> = .success(
        MobileHome(
            displayName: "Collector",
            totalEstimatedValue: 120,
            todayProfitLoss: 15,
            holdingCount: 1,
            totalCardQuantity: 2,
            historyPreview: [
                PortfolioHistoryPoint(capturedAt: "2026-04-10T10:00:00.000Z", totalValue: 100),
                PortfolioHistoryPoint(capturedAt: "2026-04-10T12:00:00.000Z", totalValue: 120)
            ],
            emptyState: false
        )
    )
    var cardsResult: Result<[CardListItem], Error> = .success([
        CardListItem(
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
    ])
    var detailResult: Result<CardDetail, Error> = .success(
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
                    id: "variation-1",
                    label: "English NM Holo",
                    languageCode: "en",
                    finish: "holo",
                    conditionCode: "nm",
                    isDefault: true,
                    currentPrice: 120,
                    lastUpdatedAt: "2026-04-10T12:00:00.000Z"
                )
            ]
        )
    )
    var historyResult: Result<PriceHistory, Error> = .success(
        PriceHistory(
            variationId: "variation-1",
            points: [
                PricePoint(capturedAt: "2026-04-09T12:00:00.000Z", marketPrice: 110),
                PricePoint(capturedAt: "2026-04-10T12:00:00.000Z", marketPrice: 120)
            ]
        )
    )
    var portfolioResult: Result<PortfolioResponse, Error> = .success(
        PortfolioResponse(
            holdings: [
                PortfolioHolding(
                    id: "holding-1",
                    cardVariationId: "variation-1",
                    cardName: "Charizard ex",
                    variationLabel: "English NM Holo",
                    quantity: 2,
                    estimatedValue: 240,
                    cardId: "card-1",
                    category: "pokemon",
                    imageUrl: nil
                )
            ],
            totalEstimatedValue: 240,
            holdingCount: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
            totalItems: 1
        )
    )
    var settingsResult: Result<TeamsAlertSettings, Error> = .success(
        TeamsAlertSettings(
            enabled: true,
            destinationLabel: "Trading alerts",
            triggerAmountUsd: 1500,
            hasWebhookUrl: true,
            webhookUrl: "https://example.com/workflows/hook",
            baselineValue: 240,
            lastEvaluatedAt: nil,
            lastDeliveredAt: nil,
            lastFailureAt: nil,
            lastFailureMessage: nil,
            deliveryStatus: "idle"
        )
    )

    var didSignOut = false
    var addedHoldingVariationID: String?
    var updatedHoldingQuantity: Int?
    var removedHoldingID: String?

    func signIn(email: String, password: String) async throws -> MobileSession {
        try sessionResult.get()
    }

    func signOut() async throws {
        didSignOut = true
    }

    func fetchSession() async throws -> MobileSession {
        try sessionResult.get()
    }

    func fetchHome() async throws -> MobileHome {
        try homeResult.get()
    }

    func browseCards(query: String) async throws -> [CardListItem] {
        browseCallCount += 1
        return try cardsResult.get()
    }

    func fetchCardDetail(category: String, cardId: String) async throws -> CardDetail {
        try detailResult.get()
    }

    func fetchPriceHistory(category: String, cardId: String, variationId: String) async throws -> PriceHistory {
        try historyResult.get()
    }

    func fetchPortfolio() async throws -> PortfolioResponse {
        portfolioLoadCount += 1
        return try portfolioResult.get()
    }

    func addHolding(cardVariationId: String, quantity: Int) async throws -> PortfolioHolding {
        addedHoldingVariationID = cardVariationId
        updatedHoldingQuantity = quantity
        return try portfolioResult.get().holdings[0]
    }

    func updateHolding(holdingId: String, quantity: Int) async throws {
        updatedHoldingQuantity = quantity
        let currentPortfolio = try portfolioResult.get()
        let updatedHolding = currentPortfolio.holdings.first {
            $0.id == holdingId
        } ?? currentPortfolio.holdings[0]

        let adjustedHolding = PortfolioHolding(
            id: updatedHolding.id,
            cardVariationId: updatedHolding.cardVariationId,
            cardName: updatedHolding.cardName,
            variationLabel: updatedHolding.variationLabel,
            quantity: quantity,
            estimatedValue: quantity > 0 ? (updatedHolding.estimatedValue / Double(updatedHolding.quantity)) * Double(quantity) : 0,
            cardId: updatedHolding.cardId,
            category: updatedHolding.category,
            imageUrl: updatedHolding.imageUrl
        )

        let holdings = currentPortfolio.holdings.map { holding in
            holding.id == holdingId ? adjustedHolding : holding
        }

        portfolioResult = .success(
            PortfolioResponse(
                holdings: holdings,
                totalEstimatedValue: holdings.reduce(0) { $0 + $1.estimatedValue },
                holdingCount: holdings.count,
                page: currentPortfolio.page,
                pageSize: currentPortfolio.pageSize,
                totalPages: currentPortfolio.totalPages,
                totalItems: currentPortfolio.totalItems
            )
        )
    }

    func removeHolding(holdingId: String) async throws {
        removedHoldingID = holdingId
    }

    func fetchSettings() async throws -> TeamsAlertSettings {
        settingsLoadCount += 1
        return try settingsResult.get()
    }

    func updateSettings(_ payload: TeamsAlertSettingsUpdate) async throws -> TeamsAlertSettings {
        settingsResult = .success(
            TeamsAlertSettings(
                enabled: payload.enabled,
                destinationLabel: payload.destinationLabel,
                triggerAmountUsd: payload.triggerAmountUsd,
                hasWebhookUrl: payload.webhookUrl != nil,
                webhookUrl: payload.webhookUrl,
                baselineValue: 240,
                lastEvaluatedAt: nil,
                lastDeliveredAt: nil,
                lastFailureAt: nil,
                lastFailureMessage: nil,
                deliveryStatus: "idle"
            )
        )

        return try settingsResult.get()
    }
}
