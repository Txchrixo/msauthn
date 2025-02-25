
# msauthn

## Description
msauthn is designed to be a service handling authentication workflows.

## 📜 Table of Contents
- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
- [Directory Structure](#directory-structure)

## Installation
To install the necessary dependencies, run the following command:

```bash
npm install
```

## Prerequisites
Before running the service, ensure you have the following services running:
- ![Redis](https://img.shields.io/badge/redis-DC382D?logo=redis&logoColor=white) **Redis**
- ![RabbitMQ](https://img.shields.io/badge/rabbitmq-FF6600?logo=rabbitmq&logoColor=white) **RabbitMQ**
- ![MongoDB](https://img.shields.io/badge/mongodb-47A248?logo=mongodb&logoColor=white) **MongoDB**

## Running the Service
1. Generate the PASETO key pair by executing:
   ```bash
   npm run generateKeyPair
   ```
2. Copy the generated keys to your `.env.development` file under the designated variables.
3. Start the service in development mode:
   ```bash
   npm run dev
   ```

After the server is running, access the API documentation at `/docs`.

## API Documentation
The API documentation can be accessed at the following endpoint:
```
/docs
```

## Directory Structure

This service structure follows a clean architecture approach, where different layers (core, infrastructure, interface) are organized to separate business logic, infrastructure code, and application interfaces. 
Here's an overview of the main directories and files within our service:

### Folders and Their Purpose

- **data/**: Holds any data files for testing or seeding purposes.
  - **mongodb.test.collection.msauthn.users.json**: Example MongoDB data for testing.

- **docs/**: Documentation files related to API endpoints and configurations.
  - **auth/**, **oauth/**, **password-reset/**: Documentation for authentication, OAuth flows, and password reset workflows.
  - **postman/**: Contains Postman collection files for API testing.
  - **AUTH_SERVICE_ENDPOINTS.md**: Specific documentation for service endpoints.

- **keys/**: Stores cryptographic keys for security purposes.
  - **privateKey.key, publicKey.key**: Key files used for encryption and authentication.

- **scripts/**: Contains custom scripts for project setup or maintenance.
  - **generatePasetoPublicKeys.js**: Script for generating PASETO public keys.

- **src/**: Main source code of the application.
  - **config/**: Configuration files for environment variables, dependency injection, and logging.
    - **config.ts**: Main configuration file.
    - **di-container.ts, di-tokens.ts**: Files for dependency injection setup.
    - **logger.ts**: Logging configuration.
    - **swagger.ts**: Swagger configuration for API documentation.

  - **core/**: Core domain logic, including business entities and interfaces.
    - **errors/**: Custom error handling.
    - **ports/**: Interfaces for defining dependencies that can be implemented by different adapters.
      - **outbound/**: Outbound port interfaces, e.g., for database and cache clients, MQ services, etc.
    - **repositories/**: Interfaces for data access layer.
    - **entities.ts**: Definitions for core entities in the domain.
    - **enums.ts**: Enums used across the domain.
    - **types.ts**: Types used within the core domain logic.

  - **infrastructure/**: Infrastructure layer for implementations of external services.
    - **adapters/**: Adapters for various external systems (e.g., MongoDB, Redis, RabbitMQ).
      - **mongodb/**: MongoDB client and repository adapter.
      - **oauth/**: OAuth provider adapters (e.g., Google, Facebook).
      - **rabbitMQ/**: RabbitMQ client adapter.
      - **redis/**: Redis client adapter.
      - **services/**: Additional service adapters (e.g., token and cache services).

    - **AuthService.ts**: Main entry point for the authentication service.

  - **interface/**: Application interface layer, including controllers, middlewares, and routes.
    - **controllers/**: Controllers for handling requests and responses.
      - **authController.ts**: Handles authentication-related requests.
    - **middlewares/**: Middleware functions for processing requests, such as authentication and validation.
      - **auth.ts**: Middleware for authentication.
      - **errorHandler.ts**: Middleware for handling errors.
      - **rateLimit.ts**: Rate-limiting middleware.
      - **recaptcha.ts**: Middleware for reCAPTCHA verification.
      - **session.ts**: Middleware for session management.
      - **validator.ts**: Middleware for request validation.
    - **routes/**: Route definitions for the application.
    - **app.ts**: Main Express application setup.

  - **utils/**: Utility functions and helper modules for common operations.
