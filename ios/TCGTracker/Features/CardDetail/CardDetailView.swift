import SwiftUI

struct CardDetailView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore
    @Bindable var sessionStore: SessionStore
    let card: CardListItem

    @State private var quantity = 1
    @State private var showingAuthRequired = false
    @State private var addConfirmationMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if let selectedCard = browseStore.selectedCard {
                    RemoteCardImage(imageURL: selectedCard.imageUrl ?? card.imageUrl, aspectRatio: 0.72, cornerRadius: 24)
                        .frame(maxWidth: 320)
                        .frame(maxWidth: .infinity)

                    VStack(alignment: .leading, spacing: 14) {
                        Text(selectedCard.name)
                            .font(.largeTitle.weight(.bold))
                            .foregroundStyle(AppTheme.textPrimary)
                        Text("\(selectedCard.setName ?? card.setName)\(selectedCard.collectorNumber.map { " • \($0)" } ?? "")")
                            .foregroundStyle(AppTheme.textSecondary)

                        if let rarity = selectedCard.rarity ?? card.rarity {
                            Text(rarity)
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(AppTheme.accentSoft))
                                .foregroundStyle(AppTheme.accent)
                        }
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .fill(AppTheme.surface)
                    )
                    .overlay {
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .stroke(AppTheme.border, lineWidth: 1)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Current Price")
                            .font(.headline)
                        Text(
                            browseStore.preferredVariation(from: selectedCard)?.currentPrice?.formatted(.currency(code: "USD"))
                            ?? card.currentPrice?.formatted(.currency(code: "USD"))
                            ?? "No price"
                        )
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(AppTheme.accent)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .fill(AppTheme.surface)
                    )
                    .overlay {
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .stroke(AppTheme.border, lineWidth: 1)
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

                        Button(sessionStore.isAuthenticated ? "Add to Portfolio" : "Sign In to Track") {
                            guard sessionStore.isAuthenticated else {
                                showingAuthRequired = true
                                return
                            }

                            Task {
                                if let variationID = browseStore.preferredVariation(from: selectedCard)?.id {
                                    let updatedHolding = await portfolioStore.addHolding(
                                        variationId: variationID,
                                        quantity: quantity
                                    )

                                    if let updatedHolding {
                                        addConfirmationMessage = makeAddConfirmationMessage(
                                            cardName: selectedCard.name,
                                            quantityAdded: quantity,
                                            totalQuantity: updatedHolding.quantity
                                        )
                                    }
                                }
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(portfolioStore.isLoading)
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
        .task {
            if browseStore.selectedCard?.id != card.id {
                await browseStore.select(card: card)
            }
        }
        .alert("Sign in required", isPresented: $showingAuthRequired) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Browsing is public, but saving cards to your portfolio requires an account.")
        }
        .alert("Added to portfolio", isPresented: Binding(
            get: { addConfirmationMessage != nil },
            set: { isPresented in
                if !isPresented {
                    addConfirmationMessage = nil
                }
            }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(addConfirmationMessage ?? "Your card was added to the portfolio.")
        }
    }

    private func makeAddConfirmationMessage(
        cardName: String,
        quantityAdded: Int,
        totalQuantity: Int
    ) -> String {
        let addedText = quantityAdded == 1 ? "1 copy" : "\(quantityAdded) copies"
        let totalText = totalQuantity == 1 ? "1 copy" : "\(totalQuantity) copies"
        return "Added \(addedText) of \(cardName). You now have \(totalText) in your portfolio."
    }
}
