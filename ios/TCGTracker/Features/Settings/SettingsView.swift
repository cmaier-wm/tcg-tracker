import SwiftUI

struct SettingsView: View {
    @Bindable var settingsStore: SettingsStore

    @State private var destinationLabel = ""
    @State private var triggerAmountUsd = "1000"
    @State private var webhookURL = ""
    @State private var enabled = false
    @State private var themeMode: ThemeMode = .light
    @State private var saveConfirmationMessage: String?

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

                            Text(formattedTimestamp(entry.capturedAt))
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
        .onChange(of: themeMode) { _, newValue in
            settingsStore.previewThemeMode = newValue
        }
        .toolbar {
            ToolbarItem {
                Button("Save") {
                    Task {
                        let trimmedDestinationLabel = destinationLabel.trimmingCharacters(in: .whitespacesAndNewlines)
                        let trimmedWebhookURL = webhookURL.trimmingCharacters(in: .whitespacesAndNewlines)
                        let currentTeamsSettings = settingsStore.settings
                        let didChangeTheme = themeMode != settingsStore.accountSettings?.themeMode
                        let didChangeTeamsSettings =
                            trimmedDestinationLabel != (currentTeamsSettings?.destinationLabel ?? "") ||
                            (Int(triggerAmountUsd) ?? 1000) != (currentTeamsSettings?.triggerAmountUsd ?? 1000) ||
                            (trimmedWebhookURL.isEmpty ? nil : trimmedWebhookURL) != currentTeamsSettings?.webhookUrl ||
                            enabled != (currentTeamsSettings?.enabled ?? false)

                        await settingsStore.save(
                            themeMode: themeMode,
                            destinationLabel: destinationLabel,
                            triggerAmountUsd: Int(triggerAmountUsd) ?? 1000,
                            webhookURL: webhookURL.isEmpty ? nil : webhookURL,
                            enabled: enabled
                        )

                        if settingsStore.errorMessage == nil {
                            showToast(makeSaveConfirmationMessage(
                                changedTheme: didChangeTheme,
                                changedTeamsSettings: didChangeTeamsSettings
                            ))
                        }
                    }
                }
                .disabled(settingsStore.isSaving)
            }
        }
        .task {
            if settingsStore.settings == nil || settingsStore.accountSettings == nil {
                await settingsStore.load()
            }
            syncForm()
        }
        .onChange(of: settingsStore.settings?.triggerAmountUsd) { _, _ in
            syncForm()
        }
        .onChange(of: settingsStore.accountSettings?.themeMode) { _, _ in
            syncThemeMode()
        }
        .onAppear {
            syncThemeMode()
        }
        .onDisappear {
            settingsStore.clearThemePreview()
        }
        .alert("Settings Saved", isPresented: saveConfirmationBinding) {
            Button("OK", role: .cancel) {
                saveConfirmationMessage = nil
            }
        } message: {
            Text(saveConfirmationMessage ?? "")
        }
    }

    private func syncForm() {
        guard let settings = settingsStore.settings else { return }

        destinationLabel = settings.destinationLabel ?? ""
        triggerAmountUsd = String(settings.triggerAmountUsd)
        webhookURL = settings.webhookUrl ?? ""
        enabled = settings.enabled
        syncThemeMode()
    }

    private func syncThemeMode() {
        themeMode = settingsStore.accountSettings?.themeMode ?? .dark
    }

    private func makeSaveConfirmationMessage(
        changedTheme: Bool,
        changedTeamsSettings: Bool
    ) -> String {
        switch (changedTheme, changedTeamsSettings) {
        case (true, true):
            return "Your theme and Teams alert settings were saved."
        case (true, false):
            return "Your theme setting was saved."
        case (false, true):
            return "Your Teams alert settings were saved."
        case (false, false):
            return "Your settings were already up to date."
        }
    }

    private func showToast(_ message: String) {
        saveConfirmationMessage = message
    }

    private func formattedTimestamp(_ capturedAt: String) -> String {
        capturedAt
            .replacingOccurrences(of: "T", with: " ")
            .replacingOccurrences(of: ".000Z", with: " UTC")
    }

    private var saveConfirmationBinding: Binding<Bool> {
        Binding(
            get: { saveConfirmationMessage != nil },
            set: { isPresented in
                if !isPresented {
                    saveConfirmationMessage = nil
                }
            }
        )
    }
}
