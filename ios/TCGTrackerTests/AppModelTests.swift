import XCTest
@testable import TCGTracker

@MainActor
final class AppModelTests: XCTestCase {
    func testStartLoadsBrowseWithoutAuthentication() async {
        let apiClient = MockAPIClient()
        apiClient.sessionResult = .failure(
            APIClientError.server(statusCode: 401, message: "Authentication is required.")
        )

        let model = AppModel(apiClient: apiClient)
        await model.start()

        XCTAssertEqual(apiClient.browseCallCount, 1)
        XCTAssertEqual(apiClient.portfolioLoadCount, 0)
        XCTAssertEqual(apiClient.settingsLoadCount, 0)
        XCTAssertFalse(model.sessionStore.isAuthenticated)
        XCTAssertEqual(model.browseStore.cards.count, 1)
    }
}
