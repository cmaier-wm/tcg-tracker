import SwiftUI

struct BrowseView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore
    @Bindable var sessionStore: SessionStore

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(AppTheme.textSecondary)

                    TextField("Search cards", text: $browseStore.query)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(AppTheme.inputBackground)
                )
                .overlay {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(AppTheme.border, lineWidth: 1)
                }
                .onSubmit {
                    Task {
                        await browseStore.search()
                    }
                }

                Menu {
                    Picker("Sort", selection: $browseStore.selectedSort) {
                        ForEach(CardSortOption.allCases) { option in
                            Text(option.label).tag(option)
                        }
                    }
                } label: {
                    HStack {
                        Label("Sort", systemImage: "arrow.up.arrow.down.circle")
                        Spacer()
                        Text(browseStore.selectedSort.label)
                            .foregroundStyle(AppTheme.textSecondary)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(AppTheme.inputBackground)
                    )
                }

                Menu {
                    Picker("Type", selection: $browseStore.selectedProductType) {
                        ForEach(CatalogProductTypeOption.allCases) { option in
                            Text(option.label).tag(option)
                        }
                    }
                } label: {
                    HStack {
                        Label("Type", systemImage: "shippingbox")
                        Spacer()
                        Text(browseStore.selectedProductType.label)
                            .foregroundStyle(AppTheme.textSecondary)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(AppTheme.inputBackground)
                    )
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .onChange(of: browseStore.selectedSort) { _, _ in
                Task {
                    await browseStore.search()
                }
            }
            .onChange(of: browseStore.selectedProductType) { _, _ in
                Task {
                    await browseStore.search()
                }
            }

            if browseStore.cards.isEmpty && !browseStore.isLoading {
                ContentStateView(
                    title: browseStore.selectedProductType == .card ? "No cards found" : "No sealed products found",
                    detail: browseStore.selectedProductType == .card
                        ? "Try a different card name or collector number."
                        : "Try a different product name or switch back to Cards."
                )
                .padding(.top, 40)
            } else {
                LazyVStack(spacing: 14) {
                    ForEach(browseStore.cards) { card in
                        if card.supportsDetailNavigation {
                            NavigationLink(value: card.id) {
                                BrowseCardRow(card: card, showsChevron: true)
                            }
                        } else {
                            BrowseCardRow(card: card, showsChevron: false)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(AppTheme.background.ignoresSafeArea())
        .navigationTitle("Browse")
        .overlay {
            if browseStore.isLoading {
                ProgressView()
            }
        }
        .task {
            if browseStore.cards.isEmpty {
                await browseStore.search()
            }
        }
        .navigationDestination(for: String.self) { cardID in
            if let card = browseStore.cards.first(where: { $0.id == cardID }), card.supportsDetailNavigation {
                CardDetailView(
                    browseStore: browseStore,
                    portfolioStore: portfolioStore,
                    sessionStore: sessionStore,
                    card: card
                )
            }
        }
    }
}

private struct BrowseCardRow: View {
    let card: CardListItem
    let showsChevron: Bool

    var body: some View {
        HStack(spacing: 22) {
            RemoteCardImage(imageURL: card.imageUrl, aspectRatio: 0.75, cornerRadius: 14)
                .frame(width: 96)

            VStack(alignment: .leading, spacing: 10) {
                Text(card.name)
                    .font(.headline)
                    .foregroundStyle(AppTheme.textPrimary)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)

                Text("\(card.setName)\(card.collectorNumber.map { " • \($0)" } ?? "")")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .lineLimit(2)

                if let rarity = card.rarity {
                    Text(rarity)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(AppTheme.accentSoft))
                        .foregroundStyle(AppTheme.accent)
                } else if card.productType == .sealedProduct {
                    Text("Sealed Product")
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(AppTheme.accentSoft))
                        .foregroundStyle(AppTheme.accent)
                }

                HStack(alignment: .center) {
                    Text(card.currentPrice?.formatted(.currency(code: "USD")) ?? "No price")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(AppTheme.accent)

                    Spacer()

                    if showsChevron {
                        Image(systemName: "chevron.right")
                            .font(.footnote.weight(.bold))
                            .foregroundStyle(AppTheme.textSecondary)
                    } else {
                        Text("Browse only")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(AppTheme.textSecondary)
                    }
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(AppTheme.surface)
        )
        .overlay {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(AppTheme.border, lineWidth: 1)
        }
    }
}
