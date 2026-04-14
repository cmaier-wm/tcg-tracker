import Foundation
import Observation

@MainActor
@Observable
final class SessionStore {
    private let apiClient: APIClientProtocol

    var session: MobileSession?
    var home: MobileHome?
    var isLoading = false
    var errorMessage: String?

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    var isAuthenticated: Bool {
        session?.status == "authenticated"
    }

    func restoreSession() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            session = try await apiClient.fetchSession()
            home = try await apiClient.fetchHome()
        } catch let error as APIClientError {
            if case let .server(statusCode, _) = error, statusCode == 401 {
                session = nil
                home = nil
                return
            }

            errorMessage = error.localizedDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signIn(email: String, password: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            session = try await apiClient.signIn(email: email, password: password)
            home = try await apiClient.fetchHome()
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func signOut() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await apiClient.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }

        session = nil
        home = nil
    }

    func refreshHome() async {
        guard isAuthenticated else { return }

        do {
            home = try await apiClient.fetchHome()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
