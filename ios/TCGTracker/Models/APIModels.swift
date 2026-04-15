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

struct PasswordResetMessageResponse: Codable, Equatable, Sendable {
    let message: String
}

struct AccountSettings: Codable, Equatable, Sendable {
    let themeMode: ThemeMode
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

struct CardListItem: Codable, Equatable, Hashable, Identifiable, Sendable {
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

enum CardSortOption: String, CaseIterable, Identifiable, Codable, Sendable {
    case priceDesc = "price-desc"
    case priceAsc = "price-asc"
    case nameAsc = "name-asc"
    case nameDesc = "name-desc"
    case numberAsc = "number-asc"
    case numberDesc = "number-desc"
    case setAsc = "set-asc"
    case setDesc = "set-desc"
    case rarityAsc = "rarity-asc"
    case rarityDesc = "rarity-desc"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .priceDesc: "Price: High to low"
        case .priceAsc: "Price: Low to high"
        case .nameAsc: "Name: A to Z"
        case .nameDesc: "Name: Z to A"
        case .numberAsc: "Number: Low to high"
        case .numberDesc: "Number: High to low"
        case .setAsc: "Set: A to Z"
        case .setDesc: "Set: Z to A"
        case .rarityAsc: "Rarity: Low to high"
        case .rarityDesc: "Rarity: High to low"
        }
    }
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

extension PortfolioHolding {
    var detailCardItem: CardListItem? {
        guard let cardId, let category else { return nil }

        return CardListItem(
            id: cardId,
            category: category,
            categoryName: nil,
            setName: variationLabel ?? "Saved card",
            name: cardName ?? "Tracked card",
            collectorNumber: nil,
            rarity: nil,
            imageUrl: imageUrl,
            currentPrice: quantity > 0 ? estimatedValue / Double(quantity) : estimatedValue,
            variationCount: 1
        )
    }
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
    let enabled: Bool?
    let destinationLabel: String?
    let triggerAmountUsd: Int?
    let webhookUrl: String?
}

struct TeamsAlertHistoryResponse: Codable, Equatable, Sendable {
    let items: [TeamsAlertHistoryEntry]
    let page: Int
    let pageSize: Int
    let totalItems: Int
    let totalPages: Int
}

struct TeamsAlertHistoryEntry: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let capturedAt: String
    let portfolioValue: Double
    let baselineValue: Double
    let gainAmount: Double
    let status: String
    let responseCode: Int?
    let failureMessage: String?
}

struct APIErrorResponse: Codable, Equatable, Sendable {
    let error: String
}
