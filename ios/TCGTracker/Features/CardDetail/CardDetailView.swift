import SwiftUI

struct CardDetailView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore
    let card: CardListItem

    @State private var quantity = 1

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if let selectedCard = browseStore.selectedCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(selectedCard.name)
                            .font(.largeTitle.bold())
                        Text("\(selectedCard.setName ?? card.setName)\(selectedCard.collectorNumber.map { " • \($0)" } ?? "")")
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Variations")
                            .font(.headline)

                        ForEach(selectedCard.variations) { variation in
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(variation.label ?? "Default")
                                        .font(.body.weight(.semibold))
                                    Text(
                                        [variation.languageCode, variation.finish, variation.conditionCode]
                                            .compactMap { $0 }
                                            .joined(separator: " • ")
                                    )
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                }

                                Spacer()

                                Text(variation.currentPrice.map { $0, format: .currency(code: "USD") } ?? "No price")
                                    .foregroundStyle(AppTheme.accent)
                            }
                            .padding(14)
                            .background(
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .fill(AppTheme.surface)
                            )
                        }
                    }

                    PriceHistoryChartView(
                        title: "Price History",
                        points: browseStore.selectedHistory?.points ?? [],
                        emptyMessage: "Historical pricing will appear after more than one price snapshot has been recorded."
                    )

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Add to Portfolio")
                            .font(.headline)

                        Stepper("Quantity: \(quantity)", value: $quantity, in: 1...99)

                        Button("Save Holding") {
                            Task {
                                if let variationID = browseStore.preferredVariation(from: selectedCard)?.id {
                                    await portfolioStore.addHolding(
                                        variationId: variationID,
                                        quantity: quantity
                                    )
                                }
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding(18)
                    .background(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .fill(AppTheme.surface)
                    )
                } else if browseStore.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else {
                    ContentStateView(
                        title: "Card not found",
                        detail: "The selected card detail could not be loaded."
                    )
                }
            }
            .padding(20)
        }
        .background(AppTheme.background.ignoresSafeArea())
        .navigationTitle(card.name)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if browseStore.selectedCard?.id != card.id {
                await browseStore.select(card: card)
            }
        }
    }
}
