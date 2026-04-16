// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "TCGTracker",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .executable(name: "TCGTracker", targets: ["TCGTracker"])
    ],
    targets: [
        .executableTarget(
            name: "TCGTracker",
            path: "TCGTracker"
        ),
        .testTarget(
            name: "TCGTrackerTests",
            dependencies: ["TCGTracker"],
            path: "TCGTrackerTests"
        )
    ]
)
