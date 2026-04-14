import SwiftUI

struct PortfolioView: View {
    @Bindable var sessionStore: SessionStore
    @Bindable var portfolioStore: PortfolioStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if let home = sessionStore.home {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Portfolio")
                            .font(.largeTitle.bold())
                        Text("Track your collection value and update holdings.")
                            .foregroundStyle(.secondary)

                        MetricCard(
                            title: "Total Value",
                            value: home.totalEstimatedValue.formatted(.currency(code: "USD")),
                            detail: "\(home.totalCardQuantity) total cards"
                        )

                        MetricCard(
                            title: "Today",
                            value: home.todayProfitLoss.formatted(.currency(code: "USD")),
                            detail: "\(home.holdingCount) tracked holdings",
                            accentColor: home.todayProfitLoss >= 0 ? AppTheme.positive : AppTheme.negative
                        )

                        if home.emptyState {
                            ContentStateView(
                                title: "Your portfolio is empty",
                                detail: "Add a card from the browse flow to start tracking your collection."
                            )
                        } else {
                            PriceHistoryChartView(
                                title: "Value History",
                                points: home.historyPreview.map {
                                    PricePoint(capturedAt: $0.capturedAt, marketPrice: $0.totalValue)
                                },
                                emptyMessage: "Portfolio history appears after repeated valuation snapshots are saved."
                            )
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Your Cards")
                        .font(.headline)

                    if let holdings = portfolioStore.portfolio?.holdings, !holdings.isEmpty {
                        ForEach(holdings) { holding in
                            VStack(alignment: .leading, spacing: 10) {
                                Text(holding.cardName ?? "Tracked card")
                                    .font(.body.weight(.semibold))
                                Text(holding.variationLabel ?? "Saved variation")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)

                                Stepper(
                                    "Quantity: \(holding.quantity)",
                                    onIncrement: {
                                        Task {
                                            await portfolioStore.updateHolding(
                                                holding.id,
                                                quantity: holding.quantity + 1
                                            )
                                        }
                                    },
                                    onDecrement: {
                                        guard holding.quantity > 1 else { return }
                                        Task {
                                            await portfolioStore.updateHolding(
                                                holding.id,
                                                quantity: holding.quantity - 1
                                            )
                                        }
                                    }
                                )

                                HStack {
                                    Text(holding.estimatedValue, format: .currency(code: "USD"))
                                        .foregroundStyle(AppTheme.accent)
                                    Spacer()
                                    Button("Remove", role: .destructive) {
                                        Task {
                                            await portfolioStore.removeHolding(holding.id)
                                        }
                                    }
                                }
                            }
                            .padding(18)
                            .background(
                                RoundedRectangle(cornerRadius: 22, style: .continuous)
                                    .fill(AppTheme.surface)
                            )
                        }
                    } else {
                        ContentStateView(
                            title: "No holdings yet",
                            detail: "Your saved cards appear here after you add them from card detail."
                        )
                    }
                }
            }
            .padding(20)
        }
        .background(AppTheme.background.ignoresSafeArea())
        .overlay {
            if portfolioStore.isLoading && portfolioStore.portfolio == nil {
                ProgressView()
            }
        }
        .task {
            if portfolioStore.portfolio == nil {
                await portfolioStore.load()
            }
        }
    }
}
