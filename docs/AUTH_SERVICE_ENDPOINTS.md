# Authentication API Documentation

## Overview
This document provides the details for the Authentication API, which includes endpoints for user login, registration, password management, and OAuth integration.

### API Version
- **Version**: 1.0.0

### Base URL
- **Base Path**: `/api/v1/auth`

---

## Endpoints

### 1. User Login
- **Endpoint**: `POST /login`
- **Description**: Authenticates a user using email and password.

#### Request Body
- **Required Fields**:
  - `email` (string): User's email address.
  - `password` (string): User's password.

#### Responses
- **200**: Successful login, returns an access token.
- **400**: Bad request due to validation error.
- **401**: Unauthorized access due to invalid credentials.

---

### 2. User Registration
- **Endpoint**: `POST /register`
- **Description**: Registers a new user.

#### Request Body
- **Required Fields**:
  - `email` (string): User's email address.
  - `password` (string): User's password.
  - `phoneNumber` (string): User's phone number.

#### Responses
- **200**: Successful registration, returns an access token.
- **400**: Bad request due to validation error.

---

### 3. User Logout
- **Endpoint**: `POST /logout`
- **Description**: Logs the user out and clears the refresh token cookie.

#### Responses
- **200**: Successful logout.
- **400**: Bad request due to missing parameters.

---

### 4. Refresh Access Token
- **Endpoint**: `POST /refresh-token`
- **Description**: Refreshes the access token using the refresh token from cookies.

#### Responses
- **200**: Access token refreshed successfully.
- **400**: Missing or invalid refresh token.

---

### 5. Validate Token
- **Endpoint**: `POST /validate-token`
- **Description**: Validates a token and returns the decoded payload if valid.

#### Request Body
- **Required Fields**:
  - `token` (string): Token to be validated.

#### Responses
- **200**: Token is valid, returns validity status and decoded data.
- **400**: Invalid token.

---

### 6. Request Password Reset
- **Endpoint**: `POST /reset-password`
- **Description**: Sends a password reset link to the user's email.

#### Request Body
- **Required Fields**:
  - `email` (string): User's email address.

#### Responses
- **200**: Password reset email sent.
- **400**: Bad request due to missing email.

---

### 7. Validate Password Reset Token
- **Endpoint**: `POST /reset-password/validate-reset-token`
- **Description**: Checks if the password reset token is valid.

#### Request Body
- **Required Fields**:
  - `token` (string): Password reset token.

#### Responses
- **200**: Token is valid.
- **400**: Invalid or expired token.

---

### 8. Set New Password
- **Endpoint**: `POST /reset-password/set-new-password`
- **Description**: Allows the user to set a new password using a reset token.

#### Request Body
- **Required Fields**:
  - `resetToken` (string): Password reset token.
  - `newPassword` (string): New password for the user.

#### Responses
- **200**: Password updated successfully.
- **400**: Bad request due to invalid token or new password.

---

### 9. Change Password
- **Endpoint**: `PUT /change-password`
- **Description**: Allows the user to change their password if authenticated.

#### Request Body
- **Required Fields**:
  - `userId` (string): ID of the user.
  - `oldPassword` (string): User's current password.
  - `newPassword` (string): User's new password.

#### Responses
- **200**: Password changed successfully.
- **401**: Unauthorized due to invalid old password.

---

### 10. OAuth Login/Registration
- **Endpoint**: `POST /oauth2/{provider}`
- **Description**: Initiates OAuth login or registration for specified provider (e.g., Google, Facebook).
- **Path Parameter**:
  - `provider` (string): OAuth provider (`google`, `facebook`).

#### Responses
- **200**: Successful initiation of OAuth flow.
- **400**: Bad request due to missing or invalid provider.

---

### 11. OAuth Callback
- **Endpoint**: `POST /oauth2/{provider}/callback`
- **Description**: Handles callback from OAuth provider.

#### Path Parameter
- `provider` (string): OAuth provider (`google`, `facebook`).

#### Responses
- **200**: Successful OAuth callback handling.
- **400**: Bad request due to missing or invalid provider.

---

## Note
Some endpoints, particularly for OAuth integration, are still marked as TODO and may require further implementation details.
