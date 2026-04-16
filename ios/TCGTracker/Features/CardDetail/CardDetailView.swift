import SwiftUI

struct CardDetailView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore
    @Bindable var sessionStore: SessionStore
    let card: CardListItem

    @State private var quantity = 1
    @State private var showingAuthRequired = false
    @State private var detailConfirmationMessage: String?

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    if let selectedCard = browseStore.selectedCard {
                        let selectedVariation = browseStore.selectedVariation
                        let ownedHolding = portfolioStore.holding(for: selectedVariation?.id)

                        RemoteCardImage(
                            imageURL: selectedCard.imageUrl ?? card.imageUrl,
                            aspectRatio: 0.72,
                            cornerRadius: 24,
                            maxHeight: 320
                        )
                            .frame(maxWidth: .infinity, alignment: .center)

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
                        .frame(maxWidth: .infinity, alignment: .leading)
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
                            Text(currentPriceText(for: selectedVariation))
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
                        .frame(maxWidth: .infinity, alignment: .leading)

                        VStack(alignment: .leading, spacing: 12) {
                            Text("Your Portfolio")
                                .font(.headline)

                            if sessionStore.isAuthenticated {
                                if let ownedHolding {
                                    Text("You own \(ownedHolding.quantity) \(ownedHolding.quantity == 1 ? "copy" : "copies") of this card.")
                                        .foregroundStyle(AppTheme.textSecondary)

                                    HStack(spacing: 14) {
                                        DetailQuantityControl(
                                            quantity: ownedHolding.quantity,
                                            isLoading: portfolioStore.isLoading,
                                            onIncrement: {
                                                Task {
                                                    await portfolioStore.updateHolding(
                                                        ownedHolding.id,
                                                        quantity: ownedHolding.quantity + 1
                                                    )
                                                    if let refreshedHolding = portfolioStore.holding(for: selectedVariation?.id) {
                                                        detailConfirmationMessage = "Updated \(refreshedHolding.cardName ?? selectedCard.name). You now have \(refreshedHolding.quantity) \(refreshedHolding.quantity == 1 ? "copy" : "copies")."
                                                    }
                                                }
                                            },
                                            onDecrement: {
                                                Task {
                                                    if ownedHolding.quantity == 1 {
                                                        await portfolioStore.removeHolding(ownedHolding.id)
                                                        detailConfirmationMessage = "Removed \(ownedHolding.cardName ?? selectedCard.name) from your portfolio."
                                                    } else {
                                                        await portfolioStore.updateHolding(
                                                            ownedHolding.id,
                                                            quantity: ownedHolding.quantity - 1
                                                        )
                                                        if let refreshedHolding = portfolioStore.holding(for: selectedVariation?.id) {
                                                            detailConfirmationMessage = "Updated \(refreshedHolding.cardName ?? selectedCard.name). You now have \(refreshedHolding.quantity) \(refreshedHolding.quantity == 1 ? "copy" : "copies")."
                                                        }
                                                    }
                                                }
                                            }
                                        )

                                        Spacer()

                                        Button("Remove", role: .destructive) {
                                            Task {
                                                await portfolioStore.removeHolding(ownedHolding.id)
                                                detailConfirmationMessage = "Removed \(ownedHolding.cardName ?? selectedCard.name) from your portfolio."
                                            }
                                        }
                                        .disabled(portfolioStore.isLoading)
                                    }
                                } else {
                                    Text("You do not own this card yet.")
                                        .foregroundStyle(AppTheme.textSecondary)

                                    Stepper("Add quantity: \(quantity)", value: $quantity, in: 1...99)

                                    Button("Add to Portfolio") {
                                        Task {
                                            if let variationID = browseStore.selectedVariation?.id {
                                                if let addedHolding = await portfolioStore.addHolding(
                                                    variationId: variationID,
                                                    quantity: quantity
                                                ) {
                                                    let addedText = quantity == 1 ? "1 copy" : "\(quantity) copies"
                                                    let totalText = addedHolding.quantity == 1 ? "1 copy" : "\(addedHolding.quantity) copies"
                                                    await MainActor.run {
                                                        detailConfirmationMessage = "Added \(addedText) of \(addedHolding.cardName ?? selectedCard.name). You now have \(totalText) in your portfolio."
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .disabled(portfolioStore.isLoading || browseStore.selectedVariation == nil)
                                }
                            } else {
                                Text("Browsing is public, but saving cards to your portfolio requires an account.")
                                    .foregroundStyle(AppTheme.textSecondary)

                                Button("Sign In to Track") {
                                    showingAuthRequired = true
                                }
                                .buttonStyle(.borderedProminent)
                            }
                        }
                        .padding(18)
                        .frame(maxWidth: .infinity, alignment: .leading)
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
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
            }
            .safeAreaInset(edge: .bottom) {
                Color.clear.frame(height: 140)
            }

        }
        .background(AppTheme.background.ignoresSafeArea())
        .navigationTitle(card.name)
        .task {
            if browseStore.selectedCard?.id != card.id {
                await browseStore.select(card: card)
            }
            if sessionStore.isAuthenticated && portfolioStore.portfolio == nil {
                await portfolioStore.load()
            }
        }
        .alert("Sign in required", isPresented: $showingAuthRequired) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Browsing is public, but saving cards to your portfolio requires an account.")
        }
        .alert("Portfolio Updated", isPresented: detailConfirmationBinding) {
            Button("OK", role: .cancel) {
                detailConfirmationMessage = nil
            }
        } message: {
            Text(detailConfirmationMessage ?? "")
        }
        .onDisappear {
            portfolioStore.clearConfirmation()
            detailConfirmationMessage = nil
        }
    }

    private var detailConfirmationBinding: Binding<Bool> {
        Binding(
            get: { detailConfirmationMessage != nil },
            set: { isPresented in
                if !isPresented {
                    detailConfirmationMessage = nil
                }
            }
        )
    }

    private func currentPriceText(for selectedVariation: CardVariation?) -> String {
        if let preferredPrice = selectedVariation?.currentPrice {
            return preferredPrice.formatted(.currency(code: "USD"))
        }

        return "No price"
    }
}

private struct DetailQuantityControl: View {
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
            .disabled(isLoading)
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
