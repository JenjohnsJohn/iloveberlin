# US-AUTH: Authentication & Authorization User Stories

**Project:** ILoveBerlin Digital Lifestyle Hub (iloveberlin.biz)
**Module:** Authentication & Authorization
**Version:** 1.0
**Last Updated:** 2026-03-12

---

## Roles Reference

| Role | Description |
|------|-------------|
| Visitor | Unauthenticated user browsing the platform |
| User | Authenticated user with a verified account |
| Admin | Platform administrator with elevated privileges |
| Superadmin | Top-level administrator with full system access |

---

## US-AUTH-001: Register with Email

**As a** visitor,
**I want to** register for an account using my email address and a password,
**so that** I can access personalized features such as bookmarks, competition entries, and classified listings.

### Acceptance Criteria

**AC-001.1: Successful registration**
- **Given** I am on the registration page
- **When** I enter a valid email address, a password that meets complexity requirements (minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character), and confirm the password
- **Then** the system creates my account in a "pending verification" state, sends a verification email to my address, and redirects me to a "check your email" confirmation page

**AC-001.2: Duplicate email prevention**
- **Given** an account already exists with the email "user@example.com"
- **When** I attempt to register with "user@example.com"
- **Then** the system displays a generic message such as "If this email is available, a verification link has been sent" to avoid leaking account existence information

**AC-001.3: Invalid email format**
- **Given** I am on the registration page
- **When** I enter an improperly formatted email address (e.g., "notanemail")
- **Then** the system displays an inline validation error "Please enter a valid email address" and does not submit the form

**AC-001.4: Weak password rejection**
- **Given** I am on the registration page
- **When** I enter a password that does not meet the complexity requirements
- **Then** the system displays specific feedback indicating which requirements are not met (e.g., "Password must include at least one special character")

**AC-001.5: Password confirmation mismatch**
- **Given** I am on the registration page
- **When** the password and confirm-password fields do not match
- **Then** the system displays an inline error "Passwords do not match" and does not submit the form

**AC-001.6: Terms acceptance required**
- **Given** I am on the registration page
- **When** I attempt to submit the form without accepting the Terms of Service and Privacy Policy
- **Then** the system prevents submission and highlights the unchecked checkbox with a message "You must accept the Terms of Service and Privacy Policy to register"

---

## US-AUTH-002: Login with Email and Password

**As a** visitor,
**I want to** log in using my registered email and password,
**so that** I can access my account and personalized content.

### Acceptance Criteria

**AC-002.1: Successful login**
- **Given** I have a verified account with email "user@example.com" and a valid password
- **When** I enter the correct email and password on the login page and submit
- **Then** the system authenticates me, issues an access token and a refresh token, and redirects me to the homepage (or the page I was previously viewing)

**AC-002.2: Incorrect credentials**
- **Given** I am on the login page
- **When** I enter an incorrect email or password combination
- **Then** the system displays a generic error message "Invalid email or password" without indicating which field is incorrect

**AC-002.3: Unverified account login attempt**
- **Given** I have registered but not yet verified my email
- **When** I attempt to log in with correct credentials
- **Then** the system informs me "Please verify your email address before logging in" and provides an option to resend the verification email

**AC-002.4: Account lockout after repeated failures**
- **Given** I have entered incorrect credentials 5 times within a 15-minute window
- **When** I attempt a 6th login
- **Then** the system temporarily locks the account for 15 minutes and displays "Too many login attempts. Please try again in 15 minutes."

**AC-002.5: Rate limiting**
- **Given** the login endpoint is receiving excessive requests from a single IP
- **When** the rate limit threshold is exceeded
- **Then** the system returns HTTP 429 and displays a user-friendly message to try again later

---

## US-AUTH-003: Social Login with Google

**As a** visitor,
**I want to** register or log in using my Google account,
**so that** I can quickly access the platform without creating a new password.

### Acceptance Criteria

**AC-003.1: First-time Google sign-in (registration)**
- **Given** I do not have an ILoveBerlin account
- **When** I click "Continue with Google" and authorize the application in the Google consent screen
- **Then** the system creates a new account using my Google profile information (name, email, profile picture), marks the email as verified, and logs me in

**AC-003.2: Returning Google sign-in**
- **Given** I have previously registered via Google
- **When** I click "Continue with Google" and authorize
- **Then** the system logs me in to my existing account without creating a duplicate

**AC-003.3: Google email matches existing email-registered account**
- **Given** I already have an account registered with email "user@example.com" (via email/password)
- **When** I attempt to sign in with a Google account that uses "user@example.com"
- **Then** the system links the Google identity to my existing account and logs me in, or prompts me to confirm the account linkage

**AC-003.4: Google authorization cancelled**
- **Given** I am on the Google consent screen
- **When** I cancel or deny the authorization
- **Then** I am redirected back to the ILoveBerlin login page with a message "Google sign-in was cancelled"

**AC-003.5: Google service unavailable**
- **Given** Google's OAuth service is temporarily unavailable
- **When** I attempt to sign in with Google
- **Then** the system displays "Google sign-in is temporarily unavailable. Please try again later or log in with your email and password."

---

## US-AUTH-004: Social Login with Apple

**As a** visitor,
**I want to** register or log in using my Apple ID,
**so that** I can access the platform using my trusted Apple identity with privacy-preserving features.

### Acceptance Criteria

**AC-004.1: First-time Apple sign-in (registration)**
- **Given** I do not have an ILoveBerlin account
- **When** I click "Continue with Apple" and authorize via Apple's sign-in flow
- **Then** the system creates a new account using the information provided by Apple (name, email or relay email), marks the account as verified, and logs me in

**AC-004.2: Apple private relay email handling**
- **Given** I choose to hide my email during Apple sign-in
- **When** my account is created with an Apple relay email address
- **Then** the system stores the relay email, correctly delivers all emails through Apple's relay, and does not require me to provide a personal email

**AC-004.3: Returning Apple sign-in**
- **Given** I have previously registered via Apple
- **When** I click "Continue with Apple" and authorize
- **Then** the system logs me in to my existing account

**AC-004.4: Apple authorization cancelled**
- **Given** I am on the Apple sign-in screen
- **When** I cancel the authorization
- **Then** I am redirected back to the ILoveBerlin login page with a message "Apple sign-in was cancelled"

---

## US-AUTH-005: Password Reset

**As a** user,
**I want to** reset my password if I forget it,
**so that** I can regain access to my account.

### Acceptance Criteria

**AC-005.1: Request password reset**
- **Given** I am on the "Forgot Password" page
- **When** I enter my registered email address and submit
- **Then** the system sends a password reset email containing a unique, time-limited token (valid for 1 hour) and displays "If an account exists for this email, a reset link has been sent"

**AC-005.2: Non-existent email handling**
- **Given** I enter an email that is not associated with any account
- **When** I submit the forgot-password form
- **Then** the system displays the same generic confirmation message (to prevent email enumeration) and does not send any email

**AC-005.3: Reset link usage**
- **Given** I have received a valid password reset email
- **When** I click the reset link within the 1-hour validity window
- **Then** I am directed to a page where I can enter and confirm a new password

**AC-005.4: Successful password change**
- **Given** I am on the password reset form with a valid token
- **When** I enter a new password meeting complexity requirements and confirm it
- **Then** the system updates my password, invalidates all existing sessions and refresh tokens, sends a confirmation email, and redirects me to the login page

**AC-005.5: Expired or invalid reset token**
- **Given** I have a password reset link
- **When** I click it after the 1-hour expiration or after it has already been used
- **Then** the system displays "This reset link has expired or is invalid. Please request a new one." with a link to the forgot-password page

**AC-005.6: Reuse prevention**
- **Given** I have successfully reset my password using a token
- **When** I attempt to use the same token again
- **Then** the system rejects the request and displays the expired/invalid message

---

## US-AUTH-006: Email Verification

**As a** user,
**I want to** verify my email address after registration,
**so that** my account is fully activated and I can access all platform features.

### Acceptance Criteria

**AC-006.1: Verification email delivery**
- **Given** I have just registered with a valid email address
- **When** registration is complete
- **Then** the system sends a verification email containing a unique, time-limited link (valid for 24 hours) within 2 minutes of registration

**AC-006.2: Successful email verification**
- **Given** I have received the verification email
- **When** I click the verification link within the 24-hour window
- **Then** my account status changes from "pending verification" to "active," I am logged in automatically, and I am redirected to the homepage with a success notification "Email verified successfully!"

**AC-006.3: Expired verification link**
- **Given** I have a verification email
- **When** I click the link after 24 hours have passed
- **Then** the system displays "This verification link has expired" and provides a button to resend a new verification email

**AC-006.4: Resend verification email**
- **Given** I have not yet verified my account
- **When** I click "Resend verification email" on the confirmation page or login page
- **Then** the system sends a new verification email (invalidating any previous link) with a rate limit of one resend per 2 minutes

**AC-006.5: Already verified**
- **Given** my email is already verified
- **When** I click a verification link (old or new)
- **Then** the system displays "Your email is already verified" and redirects me to the homepage or login

---

## US-AUTH-007: Logout

**As a** user,
**I want to** log out of my account,
**so that** I can secure my session, especially on shared devices.

### Acceptance Criteria

**AC-007.1: Successful logout**
- **Given** I am currently logged in
- **When** I click the "Logout" button in my account menu
- **Then** the system invalidates my current access token and refresh token, clears all session data from the browser (cookies, local storage), and redirects me to the homepage as a visitor

**AC-007.2: Logout from all devices**
- **Given** I am logged in and want to sign out everywhere
- **When** I select "Logout from all devices" in my security settings
- **Then** the system invalidates all refresh tokens associated with my account across all devices and sessions

**AC-007.3: Post-logout access restriction**
- **Given** I have just logged out
- **When** I attempt to access a protected page (e.g., my profile, create a listing)
- **Then** the system redirects me to the login page with a message "Please log in to continue"

**AC-007.4: Post-logout navigation**
- **Given** I have logged out while viewing a public page
- **When** the logout completes
- **Then** I remain on the same page but see it in the visitor (unauthenticated) state

---

## US-AUTH-008: Stay Logged In (Refresh Tokens)

**As a** user,
**I want to** stay logged in across browser sessions without re-entering my credentials,
**so that** I have a seamless experience when returning to the platform.

### Acceptance Criteria

**AC-008.1: Automatic token refresh**
- **Given** I am logged in and my access token has expired (access tokens are valid for 15 minutes)
- **When** I make a request to the platform
- **Then** the system automatically uses my refresh token to obtain a new access token without any user interaction or page reload

**AC-008.2: Refresh token validity**
- **Given** I have a valid refresh token
- **When** I return to the platform within the refresh token validity period (30 days)
- **Then** the system issues a new access token and I am seamlessly authenticated without needing to log in again

**AC-008.3: Refresh token expiration**
- **Given** my refresh token has expired (after 30 days of inactivity)
- **When** I return to the platform
- **Then** the system redirects me to the login page with a message "Your session has expired. Please log in again."

**AC-008.4: Refresh token rotation**
- **Given** a refresh token is used to obtain a new access token
- **When** the new access token is issued
- **Then** the system also issues a new refresh token and invalidates the old one (token rotation for security)

**AC-008.5: Stolen refresh token detection**
- **Given** a refresh token has already been used and rotated
- **When** someone attempts to use the old (rotated) refresh token
- **Then** the system detects the reuse, invalidates all refresh tokens for the account (potential token theft), and forces re-authentication on all devices

**AC-008.6: Remember me opt-in**
- **Given** I am on the login page
- **When** I check the "Remember me" checkbox before logging in
- **Then** the system issues a refresh token with a 30-day lifetime; if unchecked, the refresh token is session-scoped and expires when the browser is closed

---

## Cross-Cutting Concerns

### Security Requirements
- All authentication endpoints must be served over HTTPS
- Passwords must be hashed using bcrypt with a minimum cost factor of 12
- All tokens (access, refresh, verification, reset) must be cryptographically random
- CSRF protection must be implemented on all state-changing authentication endpoints
- Login and registration forms must include CAPTCHA or equivalent bot protection after initial failed attempts

### Audit & Logging
- All authentication events (login, logout, password reset, failed attempts) must be logged with timestamp, IP address, and user agent
- Logs must not contain passwords or tokens in plaintext
- Superadmins must be able to view authentication audit logs

### Accessibility
- All authentication forms must meet WCAG 2.1 AA standards
- Form validation errors must be associated with their respective fields using aria-describedby
- Social login buttons must have descriptive accessible labels

---

*Document End*
