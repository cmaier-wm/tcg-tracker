import SwiftUI

struct SettingsView: View {
    @Bindable var settingsStore: SettingsStore

    @State private var destinationLabel = ""
    @State private var triggerAmountUsd = 1000
    @State private var webhookURL = ""
    @State private var enabled = false

    var body: some View {
        Form {
            Section("Teams Alerts") {
                Toggle("Enable alerts", isOn: $enabled)
                TextField("Destination Label", text: $destinationLabel)
                TextField("Trigger Amount (USD)", value: $triggerAmountUsd, format: .number)
                    .keyboardType(.numberPad)
                TextField("Webhook URL", text: $webhookURL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
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

            if let errorMessage = settingsStore.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(AppTheme.negative)
                }
            }
        }
        .navigationTitle("Settings")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Save") {
                    Task {
                        await settingsStore.save(
                            destinationLabel: destinationLabel,
                            triggerAmountUsd: triggerAmountUsd,
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
        triggerAmountUsd = settings.triggerAmountUsd
        webhookURL = settings.webhookUrl ?? ""
        enabled = settings.enabled
    }
}
