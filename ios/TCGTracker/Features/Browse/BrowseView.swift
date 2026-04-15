import SwiftUI

struct BrowseView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore
    @Bindable var sessionStore: SessionStore

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                TextField("Search cards", text: $browseStore.query)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(AppTheme.inputBackground)
                    )
                    .overlay(alignment: .leading) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(AppTheme.textSecondary)
                            .padding(.leading, 14)
                    }
                    .padding(.leading, 26)
                    .onSubmit {
                        Task {
                            await browseStore.search()
                        }
                    }
            }

            if browseStore.cards.isEmpty && !browseStore.isLoading {
                ContentStateView(
                    title: "No cards found",
                    detail: "Try a different card name or collector number."
                )
                .padding(.top, 40)
            } else {
                LazyVStack(spacing: 14) {
                    ForEach(browseStore.cards) { card in
                        NavigationLink(value: card.id) {
                            HStack(spacing: 14) {
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
                                    }

                                    HStack(alignment: .center) {
                                        Text(card.currentPrice?.formatted(.currency(code: "USD")) ?? "No price")
                                            .font(.title3.weight(.bold))
                                            .foregroundStyle(AppTheme.accent)

                                        Spacer()

                                        Image(systemName: "chevron.right")
                                            .font(.footnote.weight(.bold))
                                            .foregroundStyle(AppTheme.textSecondary)
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
            if let card = browseStore.cards.first(where: { $0.id == cardID }) {
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
