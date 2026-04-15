import SwiftUI

struct PortfolioView: View {
    @Bindable var sessionStore: SessionStore
    @Bindable var portfolioStore: PortfolioStore
    @Bindable var browseStore: BrowseStore
    @State private var selectedCard: CardListItem?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if let home = sessionStore.home {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Portfolio")
                            .font(.largeTitle.bold())
                            .foregroundStyle(AppTheme.textPrimary)
                        Text("Track your collection value and update holdings.")
                            .foregroundStyle(AppTheme.textSecondary)

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
                                HoldingSummaryButton(holding: holding) {
                                    guard let card = holding.detailCardItem else { return }
                                    selectedCard = card
                                }

                                Divider()
                                    .overlay(AppTheme.border)

                                HStack(alignment: .center, spacing: 14) {
                                    QuantityControl(
                                        quantity: holding.quantity,
                                        isLoading: portfolioStore.isLoading,
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
                                    .zIndex(1)

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
                            .overlay {
                                RoundedRectangle(cornerRadius: 22, style: .continuous)
                                    .stroke(AppTheme.border, lineWidth: 1)
                            }
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
            if sessionStore.isAuthenticated && portfolioStore.portfolio == nil {
                await portfolioStore.load()
            }
        }
        .navigationDestination(item: $selectedCard) { card in
            CardDetailView(
                browseStore: browseStore,
                portfolioStore: portfolioStore,
                sessionStore: sessionStore,
                card: card
            )
        }
    }
}

private struct HoldingSummaryButton: View {
    let holding: PortfolioHolding
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 14) {
                RemoteCardImage(imageURL: holding.imageUrl, aspectRatio: 0.72, cornerRadius: 16)
                    .frame(width: 88)

                VStack(alignment: .leading, spacing: 8) {
                    Text(holding.cardName ?? "Tracked card")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(AppTheme.textPrimary)
                        .multilineTextAlignment(.leading)
                    Text(holding.variationLabel ?? "Saved variation")
                        .font(.caption)
                        .foregroundStyle(AppTheme.textSecondary)
                    Text(holding.estimatedValue, format: .currency(code: "USD"))
                        .font(.title3.weight(.bold))
                        .foregroundStyle(AppTheme.accent)
                    if holding.detailCardItem != nil {
                        Label("Open details", systemImage: "arrow.up.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(AppTheme.textSecondary)
                    }
                }

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(holding.detailCardItem == nil)
    }
}

private struct QuantityControl: View {
    let quantity: Int
    let isLoading: Bool
    let onIncrement: () -> Void
    let onDecrement: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            Button(action: onDecrement) {
                Image(systemName: "minus")
                    .font(.body.weight(.bold))
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(quantity <= 1 || isLoading)
            .background(controlBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

            Text("\(quantity)")
                .font(.headline.monospacedDigit())
                .foregroundStyle(AppTheme.textPrimary)
                .frame(minWidth: 32)

            Button(action: onIncrement) {
                Image(systemName: "plus")
                    .font(.body.weight(.bold))
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(isLoading)
            .background(controlBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }

    private var controlBackground: some View {
        RoundedRectangle(cornerRadius: 14, style: .continuous)
            .fill(AppTheme.inputBackground)
            .overlay {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(AppTheme.border, lineWidth: 1)
            }
    }
}
