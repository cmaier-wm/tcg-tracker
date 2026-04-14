import SwiftUI

struct BrowseView: View {
    @Bindable var browseStore: BrowseStore
    @Bindable var portfolioStore: PortfolioStore

    var body: some View {
        List {
            Section {
                TextField("Search cards", text: $browseStore.query)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .onSubmit {
                        Task {
                            await browseStore.search()
                        }
                    }
            }

            if browseStore.cards.isEmpty && !browseStore.isLoading {
                Section {
                    ContentStateView(
                        title: "No cards found",
                        detail: "Try a different card name or collector number."
                    )
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
            } else {
                Section {
                    ForEach(browseStore.cards) { card in
                        NavigationLink(value: card.id) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(card.name)
                                    .font(.headline)
                                Text("\(card.setName)\(card.collectorNumber.map { " • \($0)" } ?? "")")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)

                                HStack {
                                    Text(card.currentPrice.map { $0, format: .currency(code: "USD") } ?? "No price")
                                        .font(.title3.bold())
                                        .foregroundStyle(AppTheme.accent)
                                    Spacer()
                                    Text("\(card.variationCount) variations")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, 6)
                        }
                        .task {
                            if browseStore.cards.isEmpty {
                                await browseStore.search()
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Browse")
        .listStyle(.insetGrouped)
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
                    card: card
                )
            }
        }
    }
}
