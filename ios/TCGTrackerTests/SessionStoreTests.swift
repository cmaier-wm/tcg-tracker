import XCTest
@testable import TCGTracker

@MainActor
final class SessionStoreTests: XCTestCase {
    func testSignInLoadsHomeSummary() async {
        let apiClient = MockAPIClient()
        let store = SessionStore(apiClient: apiClient)

        let result = await store.signIn(email: "collector@example.com", password: "password123")

        XCTAssertTrue(result)
        XCTAssertEqual(store.session?.user.displayName, "Collector")
        XCTAssertEqual(store.home?.totalCardQuantity, 2)
    }

    func testRestoreSessionLeavesStoreSignedOutOnUnauthorized() async {
        let apiClient = MockAPIClient()
        apiClient.sessionResult = .failure(
            APIClientError.server(statusCode: 401, message: "Authentication is required.")
        )
        let store = SessionStore(apiClient: apiClient)

        await store.restoreSession()

        XCTAssertFalse(store.isAuthenticated)
        XCTAssertNil(store.home)
    }
}
