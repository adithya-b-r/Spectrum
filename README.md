# Spectrum Blog

Spectrum Blog is a full-stack blogging platform. It combines a Spring Boot API with a React single-page application for account management, writing and browsing posts, comments, likes, saved posts, follows, notifications, and image uploads.

## Architecture

```text
.
├── client/                         React + TypeScript + Vite frontend
├── src/main/java/                  Spring Boot API
├── src/main/resources/
│   ├── application.properties      Non-secret application settings
│   └── schema.sql                  MySQL schema
├── src/test/java/                  Backend tests
├── pom.xml                         Backend Maven project
└── mvnw, mvnw.cmd                  Maven Wrapper
```

The frontend calls the backend with Axios and sends JWT bearer tokens for authenticated requests. The backend uses Spring Security, Spring Data JPA, MySQL, and AWS SDK integrations.

## Technologies

- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA, Maven, Lombok
- Database: MySQL
- Authentication: JWT with BCrypt password hashing
- Frontend: React 18, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS
- Cloud services: Amazon S3 for uploads and Amazon CloudFront for serving uploaded media

## Prerequisites

- Java 21
- Node.js and npm
- MySQL
- AWS credentials with access to the configured S3 bucket when using upload features

The Maven Wrapper is included, so a separate Maven installation is not required.

## Backend setup

Create a MySQL database, then apply [`src/main/resources/schema.sql`](src/main/resources/schema.sql) if the database does not already contain the application schema.

Set these environment variables in the shell where the backend will run:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | JDBC MySQL connection URL, for example `jdbc:mysql://localhost:3306/spectrum_blog` |
| `DB_USERNAME` | MySQL user name |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | A unique, high-entropy JWT signing secret |

Example in PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/spectrum_blog"
$env:DB_USERNAME = "your_database_user"
$env:DB_PASSWORD = "your_database_password"
$env:JWT_SECRET = "generate_a_unique_high_entropy_secret"
.\mvnw.cmd spring-boot:run
```

The API uses Spring Boot's default port (`8080`) unless you configure a different server port.

To compile and run the backend tests:

```powershell
.\mvnw.cmd test
```

## Frontend setup

Copy the safe example configuration and set the API URL for your environment:

```powershell
Copy-Item client\.env.example client\.env
```

`client/.env` contains one public frontend setting:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the running backend API, such as `http://localhost:8080` |

Vite exposes `VITE_` variables to browser code. Never put passwords, tokens, AWS credentials, or other secrets in this file.

Install and run the frontend:

```powershell
Set-Location client
npm ci
npm run dev
```

Vite serves the development application on `http://localhost:5173` by default. To produce a production build:

```powershell
npm run build
```

## AWS services

The backend uses the AWS SDK's default credential provider chain for Amazon S3 access. For local development, use a configured AWS profile, environment-based AWS credentials, or another standard AWS SDK credential source. Do not commit AWS credentials.

The configured S3 bucket stores uploaded media. CloudFront is configured as the public delivery domain for that media. The S3 client currently uses the `us-east-1` region.

## Repository hygiene

The root `.gitignore` excludes local environment files, Maven/Vite build output, installed dependencies, TypeScript build caches, logs, and IDE metadata. `client/package-lock.json` is intentionally retained so frontend installs are reproducible.

No license is included; choose one before publishing if you want to grant reuse rights.
