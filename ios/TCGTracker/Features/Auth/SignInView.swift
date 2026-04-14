import SwiftUI

struct SignInView: View {
    @Bindable var sessionStore: SessionStore
    let onSignedIn: () async -> Void

    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Welcome back")
                            .font(.largeTitle.bold())

                        Text("Sign in to review your collection, browse cards, and manage holdings on iPhone.")
                            .foregroundStyle(.secondary)
                    }

                    VStack(spacing: 16) {
                        TextField("Email", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)

                        SecureField("Password", text: $password)
                            .textFieldStyle(.roundedBorder)

                        if let errorMessage = sessionStore.errorMessage {
                            Text(errorMessage)
                                .font(.footnote)
                                .foregroundStyle(AppTheme.negative)
                        }

                        Button {
                            Task {
                                let didSignIn = await sessionStore.signIn(
                                    email: email,
                                    password: password
                                )

                                if didSignIn {
                                    await onSignedIn()
                                }
                            }
                        } label: {
                            if sessionStore.isLoading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Sign In")
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(email.isEmpty || password.isEmpty || sessionStore.isLoading)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .fill(AppTheme.surface)
                    )
                }
                .padding(20)
            }
            .background(AppTheme.background.ignoresSafeArea())
        }
    }
}
