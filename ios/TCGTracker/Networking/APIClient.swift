import Foundation

enum APIClientError: LocalizedError, Equatable, Sendable {
    case invalidBaseURL
    case invalidResponse
    case server(statusCode: Int, message: String)
    case encodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidBaseURL:
            return "The API base URL is invalid."
        case .invalidResponse:
            return "The server returned an unexpected response."
        case let .server(_, message):
            return message
        case .encodingFailed:
            return "The request body could not be encoded."
        }
    }
}

protocol APIClientProtocol: Sendable {
    func signIn(email: String, password: String) async throws -> MobileSession
    func register(email: String, password: String) async throws -> MobileSession
    func signOut() async throws
    func fetchSession() async throws -> MobileSession
    func fetchHome() async throws -> MobileHome
    func requestPasswordReset(email: String) async throws -> PasswordResetMessageResponse
    func confirmPasswordReset(token: String, password: String) async throws -> PasswordResetMessageResponse
    func browseCards(query: String, sort: CardSortOption, productType: CatalogProductTypeOption) async throws -> [CardListItem]
    func fetchCardDetail(category: String, cardId: String) async throws -> CardDetail
    func fetchPriceHistory(category: String, cardId: String, variationId: String) async throws -> PriceHistory
    func fetchPortfolio(page: Int?) async throws -> PortfolioResponse
    func addHolding(cardVariationId: String, quantity: Int) async throws -> PortfolioHolding
    func updateHolding(holdingId: String, quantity: Int) async throws
    func removeHolding(holdingId: String) async throws
    func fetchAccountSettings() async throws -> AccountSettings
    func updateAccountSettings(themeMode: ThemeMode) async throws -> AccountSettings
    func fetchSettings() async throws -> TeamsAlertSettings
    func fetchSettingsHistory(page: Int, pageSize: Int) async throws -> TeamsAlertHistoryResponse
    func updateSettings(_ payload: TeamsAlertSettingsUpdate) async throws -> TeamsAlertSettings
}

extension APIClientProtocol {
    func fetchPortfolio() async throws -> PortfolioResponse {
        try await fetchPortfolio(page: nil)
    }
}

struct APIEnvironment {
    static let defaultBaseURLString = "http://127.0.0.1:3000"

    static func defaultBaseURL() -> URL? {
        let override = ProcessInfo.processInfo.environment["TCGTRACKER_BASE_URL"]
        return URL(string: override ?? defaultBaseURLString)
    }
}

actor APIClient: APIClientProtocol {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(baseURL: URL? = APIEnvironment.defaultBaseURL(), session: URLSession = .shared) {
        self.baseURL = baseURL ?? URL(string: APIEnvironment.defaultBaseURLString)!
        self.session = session

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .useDefaultKeys
        self.decoder = decoder

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        self.encoder = encoder
    }

    func signIn(email: String, password: String) async throws -> MobileSession {
        try await authenticate(path: "/api/auth/login", email: email, password: password)
    }

    func register(email: String, password: String) async throws -> MobileSession {
        try await authenticate(path: "/api/auth/register", email: email, password: password)
    }

    private func authenticate(path: String, email: String, password: String) async throws -> MobileSession {
        let payload = try await request(
            path: path,
            method: "POST",
            body: AnyEncodable(LoginRequest(email: email, password: password)),
            expecting: LoginResponse.self
        )

        return MobileSession(
            status: "authenticated",
            user: AuthenticatedUser(
                userId: payload.userId,
                email: payload.email,
                displayName: payload.displayName
            )
        )
    }

    func signOut() async throws {
        try await requestWithoutResponse(path: "/api/auth/logout", method: "POST", expectedStatusCodes: [204])
    }

    func fetchSession() async throws -> MobileSession {
        try await request(path: "/api/mobile/session", expecting: MobileSession.self)
    }

    func fetchHome() async throws -> MobileHome {
        try await request(path: "/api/mobile/home", expecting: MobileHome.self)
    }

    func requestPasswordReset(email: String) async throws -> PasswordResetMessageResponse {
        try await request(
            path: "/api/auth/password-reset/request",
            method: "POST",
            body: AnyEncodable(PasswordResetRequest(email: email)),
            expecting: PasswordResetMessageResponse.self
        )
    }

    func confirmPasswordReset(token: String, password: String) async throws -> PasswordResetMessageResponse {
        try await request(
            path: "/api/auth/password-reset/confirm",
            method: "POST",
            body: AnyEncodable(PasswordResetConfirmRequest(token: token, password: password)),
            expecting: PasswordResetMessageResponse.self
        )
    }

    func browseCards(query: String, sort: CardSortOption, productType: CatalogProductTypeOption) async throws -> [CardListItem] {
        let items = try await request(
            path: "/api/cards",
            queryItems: [
                query.isEmpty ? nil : URLQueryItem(name: "q", value: query),
                URLQueryItem(name: "sort", value: sort.rawValue),
                productType == .card ? nil : URLQueryItem(name: "productType", value: productType.rawValue)
            ].compactMap { $0 },
            expecting: CardListResponse.self
        )

        return items.items
    }

    func fetchCardDetail(category: String, cardId: String) async throws -> CardDetail {
        try await request(path: "/api/cards/\(category)/\(cardId)", expecting: CardDetail.self)
    }

    func fetchPriceHistory(category: String, cardId: String, variationId: String) async throws -> PriceHistory {
        try await request(
            path: "/api/cards/\(category)/\(cardId)/history",
            queryItems: [URLQueryItem(name: "variationId", value: variationId)],
            expecting: PriceHistory.self
        )
    }

    func fetchPortfolio(page: Int? = nil) async throws -> PortfolioResponse {
        let queryItems = page.map { [URLQueryItem(name: "page", value: String($0))] } ?? []
        return try await request(
            path: "/api/portfolio",
            queryItems: queryItems,
            expecting: PortfolioResponse.self
        )
    }

    func addHolding(cardVariationId: String, quantity: Int) async throws -> PortfolioHolding {
        try await request(
            path: "/api/portfolio",
            method: "POST",
            body: AnyEncodable(
                HoldingWriteRequest(cardVariationId: cardVariationId, quantity: quantity)
            ),
            expecting: PortfolioHolding.self
        )
    }

    func updateHolding(holdingId: String, quantity: Int) async throws {
        try await requestWithoutResponse(
            path: "/api/portfolio/\(holdingId)",
            method: "PATCH",
            body: AnyEncodable(HoldingUpdateRequest(quantity: quantity)),
            expectedStatusCodes: [200]
        )
    }

    func removeHolding(holdingId: String) async throws {
        try await requestWithoutResponse(
            path: "/api/portfolio/\(holdingId)",
            method: "DELETE",
            expectedStatusCodes: [204]
        )
    }

    func fetchAccountSettings() async throws -> AccountSettings {
        try await request(path: "/api/settings/account", expecting: AccountSettings.self)
    }

    func updateAccountSettings(themeMode: ThemeMode) async throws -> AccountSettings {
        try await request(
            path: "/api/settings/account",
            method: "PUT",
            body: AnyEncodable(AccountSettings(themeMode: themeMode)),
            expecting: AccountSettings.self
        )
    }

    func fetchSettings() async throws -> TeamsAlertSettings {
        try await request(path: "/api/settings/teams-alert", expecting: TeamsAlertSettings.self)
    }

    func fetchSettingsHistory(page: Int, pageSize: Int) async throws -> TeamsAlertHistoryResponse {
        try await request(
            path: "/api/settings/teams-alert/history",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "pageSize", value: String(pageSize))
            ],
            expecting: TeamsAlertHistoryResponse.self
        )
    }

    func updateSettings(_ payload: TeamsAlertSettingsUpdate) async throws -> TeamsAlertSettings {
        try await request(
            path: "/api/settings/teams-alert",
            method: "PUT",
            body: AnyEncodable(payload),
            expecting: TeamsAlertSettings.self
        )
    }

    private func request<Response: Decodable>(
        path: String,
        method: String = "GET",
        queryItems: [URLQueryItem] = [],
        expecting: Response.Type
    ) async throws -> Response {
        let request = try buildRequest(path: path, method: method, queryItems: queryItems)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw try mapError(data: data, statusCode: httpResponse.statusCode)
        }

        return try decoder.decode(Response.self, from: data)
    }

    private func request<Response: Decodable>(
        path: String,
        method: String,
        queryItems: [URLQueryItem] = [],
        body: AnyEncodable,
        expecting: Response.Type
    ) async throws -> Response {
        let request = try buildRequest(
            path: path,
            method: method,
            queryItems: queryItems,
            body: body
        )
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw try mapError(data: data, statusCode: httpResponse.statusCode)
        }

        return try decoder.decode(Response.self, from: data)
    }

    private func requestWithoutResponse(
        path: String,
        method: String,
        queryItems: [URLQueryItem] = [],
        expectedStatusCodes: Set<Int>
    ) async throws {
        let request = try buildRequest(path: path, method: method, queryItems: queryItems)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard expectedStatusCodes.contains(httpResponse.statusCode) else {
            throw try mapError(data: data, statusCode: httpResponse.statusCode)
        }
    }

    private func requestWithoutResponse(
        path: String,
        method: String,
        queryItems: [URLQueryItem] = [],
        body: AnyEncodable,
        expectedStatusCodes: Set<Int>
    ) async throws {
        let request = try buildRequest(
            path: path,
            method: method,
            queryItems: queryItems,
            body: body
        )
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard expectedStatusCodes.contains(httpResponse.statusCode) else {
            throw try mapError(data: data, statusCode: httpResponse.statusCode)
        }
    }

    private func buildRequest(
        path: String,
        method: String,
        queryItems: [URLQueryItem]
    ) throws -> URLRequest {
        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIClientError.invalidBaseURL
        }

        components.path = path
        components.queryItems = queryItems.isEmpty ? nil : queryItems

        guard let url = components.url else {
            throw APIClientError.invalidBaseURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        return request
    }

    private func buildRequest(
        path: String,
        method: String,
        queryItems: [URLQueryItem],
        body: AnyEncodable
    ) throws -> URLRequest {
        var request = try buildRequest(path: path, method: method, queryItems: queryItems)

        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encode(body)

        return request
    }

    private func encode(_ value: AnyEncodable) throws -> Data {
        do {
            return try encoder.encode(value)
        } catch {
            throw APIClientError.encodingFailed
        }
    }

    private func mapError(data: Data, statusCode: Int) throws -> APIClientError {
        if let payload = try? decoder.decode(APIErrorResponse.self, from: data) {
            return .server(statusCode: statusCode, message: payload.error)
        }

        return .server(statusCode: statusCode, message: "Request failed.")
    }
}

private struct AnyEncodable: Encodable {
    private let encodeBody: (Encoder) throws -> Void

    init(_ wrapped: some Encodable) {
        self.encodeBody = wrapped.encode(to:)
    }

    func encode(to encoder: Encoder) throws {
        try encodeBody(encoder)
    }
}

private struct LoginRequest: Encodable {
    let email: String
    let password: String
}

private struct PasswordResetRequest: Encodable {
    let email: String
}

private struct PasswordResetConfirmRequest: Encodable {
    let token: String
    let password: String
}
