import Foundation

struct AuthenticatedUser: Codable, Equatable, Sendable {
    let userId: String
    let email: String
    let displayName: String
}

struct LoginResponse: Codable, Equatable, Sendable {
    let userId: String
    let email: String
    let displayName: String
    let returnTo: String?
}

struct MobileSession: Codable, Equatable, Sendable {
    let status: String
    let user: AuthenticatedUser
}

struct PortfolioHistoryPoint: Codable, Equatable, Identifiable, Sendable {
    var id: String { capturedAt }

    let capturedAt: String
    let totalValue: Double
}

struct MobileHome: Codable, Equatable, Sendable {
    let displayName: String
    let totalEstimatedValue: Double
    let todayProfitLoss: Double
    let holdingCount: Int
    let totalCardQuantity: Int
    let historyPreview: [PortfolioHistoryPoint]
    let emptyState: Bool
}

struct CardListResponse: Codable, Equatable, Sendable {
    let items: [CardListItem]
}

struct CardListItem: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let category: String
    let categoryName: String?
    let setName: String
    let name: String
    let collectorNumber: String?
    let rarity: String?
    let imageUrl: String?
    let currentPrice: Double?
    let variationCount: Int
}

struct CardDetail: Codable, Equatable, Sendable {
    let id: String
    let category: String
    let categoryName: String?
    let setName: String?
    let name: String
    let collectorNumber: String?
    let rarity: String?
    let imageUrl: String?
    let variations: [CardVariation]
}

struct CardVariation: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let label: String?
    let languageCode: String?
    let finish: String?
    let conditionCode: String?
    let isDefault: Bool?
    let currentPrice: Double?
    let lastUpdatedAt: String?
}

struct PriceHistory: Codable, Equatable, Sendable {
    let variationId: String
    let points: [PricePoint]
}

struct PricePoint: Codable, Equatable, Identifiable, Sendable {
    var id: String { capturedAt }

    let capturedAt: String
    let marketPrice: Double
}

struct PortfolioResponse: Codable, Equatable, Sendable {
    let holdings: [PortfolioHolding]
    let totalEstimatedValue: Double
    let holdingCount: Int
    let page: Int?
    let pageSize: Int?
    let totalPages: Int?
    let totalItems: Int?
}

struct PortfolioHolding: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let cardVariationId: String
    let cardName: String?
    let variationLabel: String?
    let quantity: Int
    let estimatedValue: Double
    let cardId: String?
    let category: String?
    let imageUrl: String?
}

struct HoldingWriteRequest: Codable, Equatable, Sendable {
    let cardVariationId: String
    let quantity: Int
}

struct HoldingUpdateRequest: Codable, Equatable, Sendable {
    let quantity: Int
}

struct TeamsAlertSettings: Codable, Equatable, Sendable {
    let enabled: Bool
    let destinationLabel: String?
    let triggerAmountUsd: Int
    let hasWebhookUrl: Bool
    let webhookUrl: String?
    let baselineValue: Double?
    let lastEvaluatedAt: String?
    let lastDeliveredAt: String?
    let lastFailureAt: String?
    let lastFailureMessage: String?
    let deliveryStatus: String
}

struct TeamsAlertSettingsUpdate: Codable, Equatable, Sendable {
    let enabled: Bool
    let destinationLabel: String
    let triggerAmountUsd: Int
    let webhookUrl: String?
}

struct APIErrorResponse: Codable, Equatable, Sendable {
    let error: String
}
