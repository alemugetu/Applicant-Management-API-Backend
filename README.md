# INFNOVA Backend Internship - Applicant Management API

A NestJS RESTful API for managing internship applications, built with TypeScript, Prisma ORM, and SQLite.

## Features
- **Authentication**: JWT-based bearer authentication for administrators.
- **Applicant Management**: CRUD operations with soft-deletion support.
- **Search & Filtering**: Paginated list search by name/email, filtering by status and track, and dynamic sorting.
- **Business Rules Enforcement**: Strict email uniqueness, 1000-character limit on internal notes, and forbidden status transitions (e.g., `REJECTED` -> `ACCEPTED`).
- **Dashboard Metrics**: Summary statistics excluding soft-deleted candidates.
- **API Documentation**: Automated Swagger OpenAPI documentation.

## Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: Passport JWT & Bcrypt
- **Validation**: Class Validator & Class Transformer
- **Docs**: Swagger / OpenAPI

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Installation
```bash
npm install
