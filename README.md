# Auth System – NestJS

## Description

A **complete Authentication & Authorization system** built with **NestJS**.

Supports **JWT**, **Refresh Tokens**, **OAuth**, **Role-Based Access Control (RBAC)**,
**Permission-Based Authorization**, **Redis**, **Argon2 password hashing**,
**SendGrid email service**, and a **scalable architecture**.

---

## Project Overview

This project provides a **reusable and scalable auth system** that can be integrated into any backend application.
It follows **clean architecture** and best practices for security and maintainability.

---

## Features

- Local Authentication
  - User registration with secure password hashing (Argon2)
  - User login with JWT Access & Refresh Tokens
  - Secure logout with token invalidation
  - Refresh token rotation
  - Password reset flow
  - Password confirmation after reset

- Google OAuth Authentication
  - Login with Google using OAuth 2.0
  - Automatic user creation on first login
  - Secure token delivery via HTTP-only cookies
  - Redirect support for frontend applications

- Token Management
  - JWT Access Tokens
  - Refresh Tokens stored securely
  - Token invalidation on logout

- Role-Based Access Control (RBAC)
  - Assign roles to users
  - Manage roles dynamically
  - Protect endpoints using role-based permissions

- Permission-Based Authorization
  - Fine-grained permissions per resource and action
  - Custom @Permissions() decorator
  - Centralized permission guard
  - Supports actions like READ, ASSIGN_ROLES, ASSIGN_PERMISSIONS..etc

- Security
  - Custom Guards for authentication and authorization
  - Public routes support using @Public() decorator

- Scalable Architecture
  - Modular NestJS structure
  - Clear separation of controllers, services,repository, guards, and DTOs
  - Easily extensible for new auth providers or permissions

---

## TEach Stack

- **NestJS**
- **POstgreSQL**
- **Drizzle ORM**
- **JWT**
- **Redis**
- **Pssport.js**
- **Docker**

---

## Project Structure

```bash
src/
├── common/
│   ├── decorators/
│   ├── enum/
│   ├── filters/
│   ├── guards/
│   ├── redis/
│   └── interfaces/
├── configs/
│   ├── configuration/
│   └── environment/
├── database/
│   ├── schema/
│   ├── relations/
│   ├── constants.ts
│   └── database.module.ts
├── modules/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── interfaces/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── strategies/
│   │   ├── guards/
│   │   ├── constants.ts
│   │   └── auth.module.ts
│   ├── users/
│   ├── roles/
│   ├── profiles/
│   └── refresh-tokens/
├── seeds/
│   ├── constants.ts
│   ├── permissions.seeder.ts
│   ├── roles.seeder.ts
│   ├── run.ts
│   └── seeds.module.ts
├── app.module.ts
└── main.ts
```

## Environment Variables

Create a `.env` file in the root directory:

```bash

# app
NODE_ENV=development
PORT=3000

```

Create a `.env.development.local` file in the root directory:

```bash

# PostgreSQL
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_PORT=5432
POSTGRES_DB=your_db_name
DATABASE_URL=postgresql://your_db_user:your_db_password@db:5432/your_db_name

# Argon2 (hashing)
ARGON_SECRET=your_argon_secret_here

# JWT keys (RS256)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/google-auth/callback

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@example.com

# CORSS
CORS_ORIGIN=http://localhost:3001,http://example.com
FRONTEND_URL=http://localhost:3001

#Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_password

```

## Authorization

```bash

@Permissions({ resource: 'users', action: Action.ASSIGN_ROLES })

```

---

## API Endpoints

Base URL

```bash
http://localhost:8080/api/v1/
```

Authentication – Local
```bash

# google auth
GET /google-auth                  -> Public
GET /google-auth/callback         -> Public

#local auth
POST /local-auth/register         -> Public
POST /local-auth/login            -> Public
POST /local-auth/logout           -> Protected
PATCH /local-auth/refresh         -> Protected
POST /local-auth/reset-password   -> Public
POST /local-auth/confirm-password -> Public

```

In NestJS:

Public route:

```bash
 @Public()
 @Post('login')
```

Protected route:

```bash
 @Post('logout')
```

## Running the Project

1- Install Dependencies

```bash
npm install
```

2- Start Infrastructure (DB + Redis)

```bash
# Start containers
docker-compose up -d --build

# Generate database migrations
docker exec -it auth-system npx drizzle-kit generate

# Run database migrations
docker exec -it auth-system npx drizzle-kit migrate

# Seed initial data (roles, permissions, admin user, etc.)
docker exec -it auth-system npm run seed

```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
MIT © Ayyoub Benslimane
