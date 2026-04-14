import XCTest
@testable import TCGTracker

final class APIClientMappingTests: XCTestCase {
    override func setUp() {
        super.setUp()
        URLProtocol.registerClass(MockURLProtocol.self)
    }

    override func tearDown() {
        URLProtocol.unregisterClass(MockURLProtocol.self)
        MockURLProtocol.handler = nil
        super.tearDown()
    }

    func testFetchSessionDecodesAuthenticatedPayload() async throws {
        let session = makeSession()
        let client = APIClient(baseURL: URL(string: "http://localhost:3000"), session: session)

        MockURLProtocol.handler = { request in
            XCTAssertEqual(request.url?.path, "/api/mobile/session")
            return (
                HTTPURLResponse(
                    url: request.url!,
                    statusCode: 200,
                    httpVersion: nil,
                    headerFields: ["Content-Type": "application/json"]
                )!,
                """
                {"status":"authenticated","user":{"userId":"user-1","email":"collector@example.com","displayName":"Collector"}}
                """.data(using: .utf8)!
            )
        }

        let payload = try await client.fetchSession()

        XCTAssertEqual(payload.user.email, "collector@example.com")
        XCTAssertEqual(payload.status, "authenticated")
    }

    func testFetchSessionSurfacesServerError() async {
        let session = makeSession()
        let client = APIClient(baseURL: URL(string: "http://localhost:3000"), session: session)

        MockURLProtocol.handler = { request in
            (
                HTTPURLResponse(
                    url: request.url!,
                    statusCode: 401,
                    httpVersion: nil,
                    headerFields: ["Content-Type": "application/json"]
                )!,
                #"{"error":"Authentication is required."}"#.data(using: .utf8)!
            )
        }

        do {
            _ = try await client.fetchSession()
            XCTFail("Expected unauthorized error")
        } catch let error as APIClientError {
            XCTAssertEqual(error, .server(statusCode: 401, message: "Authentication is required."))
        } catch {
            XCTFail("Unexpected error: \(error)")
        }
    }

    private func makeSession() -> URLSession {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [MockURLProtocol.self]
        return URLSession(configuration: configuration)
    }
}

final class MockURLProtocol: URLProtocol {
    static var handler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override class func canInit(with request: URLRequest) -> Bool {
        true
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        guard let handler = MockURLProtocol.handler else {
            XCTFail("MockURLProtocol.handler was not set.")
            return
        }

        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}
