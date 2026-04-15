import SwiftUI

private enum AuthMode: String, CaseIterable, Identifiable {
    case signIn = "Sign In"
    case register = "Create Account"
    case requestReset = "Reset Password"
    case confirmReset = "Use Reset Token"

    var id: String { rawValue }
}

struct SignInView: View {
    @Bindable var sessionStore: SessionStore
    let onSignedIn: () async -> Void

    @State private var authMode: AuthMode = .signIn
    @State private var email = ""
    @State private var password = ""
    @State private var resetToken = ""
    @State private var infoMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(title)
                            .font(.largeTitle.bold())
                            .foregroundStyle(AppTheme.textPrimary)

                        Text(subtitle)
                            .foregroundStyle(AppTheme.textSecondary)
                    }

                    Picker("Authentication Mode", selection: $authMode) {
                        ForEach(AuthMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    VStack(spacing: 16) {
                        TextField("Email", text: $email)
                            .textFieldStyle(RoundedBorderTextFieldStyle())

                        if authMode == .confirmReset {
                            TextField("Reset Token", text: $resetToken)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }

                        if authMode != .requestReset {
                            SecureField(
                                authMode == .confirmReset ? "New Password" : "Password",
                                text: $password
                            )
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        }

                        if let infoMessage {
                            Text(infoMessage)
                                .font(.footnote)
                                .foregroundStyle(AppTheme.positive)
                        }

                        if let errorMessage = sessionStore.errorMessage {
                            Text(errorMessage)
                                .font(.footnote)
                                .foregroundStyle(AppTheme.negative)
                        }

                        Button {
                            Task {
                                await submit()
                            }
                        } label: {
                            if sessionStore.isLoading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text(primaryButtonTitle)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(!canSubmit || sessionStore.isLoading)

                        HStack {
                            if authMode != .requestReset {
                                Button("Forgot Password") {
                                    clearMessages()
                                    authMode = .requestReset
                                }
                            }

                            Spacer()

                            if authMode == .signIn {
                                Button("Create Account") {
                                    clearMessages()
                                    authMode = .register
                                }
                            } else if authMode == .register {
                                Button("Back to Sign In") {
                                    clearMessages()
                                    authMode = .signIn
                                }
                            } else if authMode == .requestReset {
                                Button("Have Reset Token") {
                                    clearMessages()
                                    authMode = .confirmReset
                                }
                            } else if authMode == .confirmReset {
                                Button("Back to Sign In") {
                                    clearMessages()
                                    authMode = .signIn
                                }
                            }
                        }
                        .buttonStyle(.plain)
                        .font(.footnote.weight(.semibold))
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
                }
                .padding(20)
            }
            .background(AppTheme.background.ignoresSafeArea())
        }
        .onChange(of: authMode) { _, _ in
            clearMessages()
        }
    }

    private var title: String {
        switch authMode {
        case .signIn: "Welcome back"
        case .register: "Create your account"
        case .requestReset: "Reset your password"
        case .confirmReset: "Choose a new password"
        }
    }

    private var subtitle: String {
        switch authMode {
        case .signIn:
            "Sign in to track holdings, manage alerts, and sync your collection on iPhone."
        case .register:
            "Create an account to keep your portfolio and Teams alerts private to you."
        case .requestReset:
            "Enter your account email address and we will send a password reset link."
        case .confirmReset:
            "Paste the reset token from your reset link and choose a new password."
        }
    }

    private var primaryButtonTitle: String {
        switch authMode {
        case .signIn: "Sign In"
        case .register: "Create Account"
        case .requestReset: "Send Reset Link"
        case .confirmReset: "Save New Password"
        }
    }

    private var canSubmit: Bool {
        switch authMode {
        case .signIn, .register:
            !email.isEmpty && !password.isEmpty
        case .requestReset:
            !email.isEmpty
        case .confirmReset:
            !email.isEmpty && !resetToken.isEmpty && !password.isEmpty
        }
    }

    private func submit() async {
        clearMessages()

        switch authMode {
        case .signIn:
            let didSignIn = await sessionStore.signIn(email: email, password: password)
            if didSignIn {
                await onSignedIn()
            }
        case .register:
            let didRegister = await sessionStore.register(email: email, password: password)
            if didRegister {
                await onSignedIn()
            }
        case .requestReset:
            if let message = await sessionStore.requestPasswordReset(email: email) {
                infoMessage = message
                authMode = .confirmReset
            }
        case .confirmReset:
            if let message = await sessionStore.confirmPasswordReset(token: resetToken, password: password) {
                infoMessage = message
                resetToken = ""
                password = ""
                authMode = .signIn
            }
        }
    }

    private func clearMessages() {
        infoMessage = nil
        sessionStore.errorMessage = nil
    }
}
