# Lendsqr Backend Engineering Test

## Overview
This is an MVP wallet service for Demo Credit, a mobile lending app, built with NodeJS, TypeScript, KnexJS, and MySQL. It supports user creation (with Lendsqr Adjutor Karma blacklist checks), funding accounts, transferring funds, withdrawing funds, and checking balances.

## Tech Stack
- NodeJS (LTS)
- TypeScript
- KnexJS ORM
- MySQL
- Express
- Jest (for unit testing)

## Setup Instructions
1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (see `.env.example`)
4. Run migrations: `npm run migrate`
5. Start the server: `npm start`
6. Run tests: `npm test`

## API Endpoints
- **POST /api/users**: Create a user (checks Karma blacklist)
- **POST /api/auth/login**: Generate JWT token
- **POST /api/wallets/deposit**: Fund wallet
- **POST /api/wallets/transfer**: Transfer funds to another user
- **POST /api/wallets/withdraw**: Withdraw funds
- **GET /api/wallets/balance**: Get wallet balance

## E-R Diagram
![E-R Diagram](<link-to-dbdesigner-net-image>)

## Design Decisions
- **Layered Architecture**: Separates concerns into controllers, services, and models for maintainability.
- **Transactions**: Used Knex transactions for atomicity in wallet operations.
- **TypeScript**: Ensures type safety and better code quality.
- **Faux Authentication**: Simple JWT-based auth as per requirements.
- **Testing**: Comprehensive Jest tests for positive and negative scenarios.

## Deployment
- Deployed on Render: `https://<candidate-name>-lendsqr-be-test.onrender.com`
- GitHub Repo: `<repo-url>`

## Testing
- Unit tests cover all major functionalities (user creation, deposits, transfers, withdrawals).
- Negative scenarios include blacklisted users and insufficient balance checks.