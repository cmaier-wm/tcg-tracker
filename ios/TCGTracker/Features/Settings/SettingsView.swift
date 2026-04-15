import SwiftUI

struct SettingsView: View {
    @Bindable var settingsStore: SettingsStore

    @State private var destinationLabel = ""
    @State private var triggerAmountUsd = "1000"
    @State private var webhookURL = ""
    @State private var enabled = false
    @State private var themeMode: ThemeMode = .light

    var body: some View {
        Form {
            Section("Appearance") {
                Picker("Theme", selection: $themeMode) {
                    ForEach(ThemeMode.allCases) { mode in
                        Label(mode.displayName, systemImage: mode.symbolName)
                            .tag(mode)
                    }
                }
            }

            Section("Teams Alerts") {
                Toggle("Enable alerts", isOn: $enabled)
                TextField("Destination Label", text: $destinationLabel)
                TextField("Trigger Amount (USD)", text: $triggerAmountUsd)
                TextField("Webhook URL", text: $webhookURL)
            }

            if let settings = settingsStore.settings {
                Section("Status") {
                    LabeledContent("Delivery", value: settings.deliveryStatus.capitalized)
                    LabeledContent(
                        "Baseline",
                        value: settings.baselineValue?.formatted(.currency(code: "USD")) ?? "Not set"
                    )
                }
            }

            if !settingsStore.history.isEmpty {
                Section("Recent Deliveries") {
                    ForEach(settingsStore.history) { entry in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(entry.status.capitalized)
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text(entry.gainAmount, format: .currency(code: "USD"))
                                    .foregroundStyle(AppTheme.accent)
                            }

                            Text(entry.capturedAt.replacingOccurrences(of: "T", with: " ").replacingOccurrences(of: ".000Z", with: " UTC"))
                                .font(.caption)
                                .foregroundStyle(AppTheme.textSecondary)

                            if let failureMessage = entry.failureMessage, !failureMessage.isEmpty {
                                Text(failureMessage)
                                    .font(.caption)
                                    .foregroundStyle(AppTheme.negative)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }

            if let errorMessage = settingsStore.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(AppTheme.negative)
                }
            }
        }
        .navigationTitle("Settings")
        .toolbar {
            ToolbarItem {
                Button("Save") {
                    Task {
                        await settingsStore.save(
                            themeMode: themeMode,
                            destinationLabel: destinationLabel,
                            triggerAmountUsd: Int(triggerAmountUsd) ?? 1000,
                            webhookURL: webhookURL.isEmpty ? nil : webhookURL,
                            enabled: enabled
                        )
                    }
                }
                .disabled(settingsStore.isSaving)
            }
        }
        .task {
            if settingsStore.settings == nil {
                await settingsStore.load()
                syncForm()
            }
        }
        .onChange(of: settingsStore.settings?.triggerAmountUsd) { _, _ in
            syncForm()
        }
    }

    private func syncForm() {
        guard let settings = settingsStore.settings else { return }

        destinationLabel = settings.destinationLabel ?? ""
        triggerAmountUsd = String(settings.triggerAmountUsd)
        webhookURL = settings.webhookUrl ?? ""
        enabled = settings.enabled
        themeMode = settings.themeMode
    }
}
