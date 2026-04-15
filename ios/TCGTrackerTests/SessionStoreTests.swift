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

    func testRegisterLoadsHomeSummary() async {
        let apiClient = MockAPIClient()
        let store = SessionStore(apiClient: apiClient)

        let result = await store.register(email: "collector@example.com", password: "password123")

        XCTAssertTrue(result)
        XCTAssertEqual(store.session?.user.email, "collector@example.com")
        XCTAssertEqual(store.home?.holdingCount, 1)
    }

    func testPasswordResetRequestReturnsMessage() async {
        let apiClient = MockAPIClient()
        let store = SessionStore(apiClient: apiClient)

        let message = await store.requestPasswordReset(email: "collector@example.com")

        XCTAssertEqual(message, "If an account exists for that email, a password reset link has been sent.")
    }

    func testPasswordResetConfirmReturnsMessage() async {
        let apiClient = MockAPIClient()
        let store = SessionStore(apiClient: apiClient)

        let message = await store.confirmPasswordReset(token: "reset-token", password: "new-password-123")

        XCTAssertEqual(message, "If an account exists for that email, a password reset link has been sent.")
    }
}
