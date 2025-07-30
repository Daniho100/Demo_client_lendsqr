# Lendsqr Backend Engineering Test - Demo Credit Wallet Service

## Overview
The **Demo Credit Wallet Service** is a Minimum Viable Product (MVP) wallet application built for Lendsqr’s backend engineering test. It enables users to create accounts, fund wallets, transfer funds to other users, withdraw funds, and check balances. The app integrates with Lendsqr’s Adjutor Karma API for blacklist checks during user creation, ensuring compliance with lending requirements. Developed with **Node.js**, **TypeScript**, **Knex.js**, **MySQL**, and **Express**, the service prioritizes security, reliability, and scalability. A critical bug where recipient balances updated incorrectly to `0.00500` instead of `500` during transfers was resolved by adjusting the `WalletModel.updateBalance` method to handle `DECIMAL` values correctly.

## Business Value
This wallet service serves as the backbone for Demo Credit, a mobile lending app, providing:
- **User Trust**: Secure JWT-based authentication and Karma blacklist checks ensure safe onboarding and transactions.
- **Reliability**: Knex transactions guarantee atomicity, preventing issues like partial balance updates.
- **Scalability**: Modular architecture supports growing user bases and transaction volumes.
- **Compliance**: Integration with Adjutor Karma API prevents blacklisted users from registering.
- **Efficiency**: Open-source stack (Node.js, MySQL) minimizes costs while delivering robust functionality.

## Tech Stack
- **Node.js (LTS)**
- **TypeScript**
- **Express**
- **Knex.js**
- **MySQL**
- **Jest**
- **jsonwebtoken**

## Features

### User Management
- Register users (with blacklist check)
- JWT-based login

### Wallet Operations
- Deposit
- Transfer (with atomic transactions)
- Withdraw
- Balance check

### Security & Reliability
- JWT auth middleware
- Input validation
- Knex transaction support
- Error handling (insufficient funds, blacklisted users, etc.)

## Design Decisions
- Layered architecture (controllers, services, models)
- TypeScript interfaces for consistency
- Fixed MySQL `DECIMAL` bug by treating balance as a number
- Faux auth using `jsonwebtoken` per instructions
- Postman/Jest tests for all operations and edge cases

## Entity-Relationship (E-R) Diagram (Textual)
Table users {
id integer [primary key]
email varchar(255) [unique, not null]
name varchar(255) [not null]
password varchar(255) [not null]
created_at timestamp [default: CURRENT_TIMESTAMP]
updated_at timestamp [default: CURRENT_TIMESTAMP]
}

Table wallets {
id integer [primary key]
user_id integer [ref: > users.id, not null]
balance decimal(15,2) [default: 0.00, not null]
created_at timestamp [default: CURRENT_TIMESTAMP]
updated_at timestamp [default: CURRENT_TIMESTAMP]
}

Table transactions {
id integer [primary key]
wallet_id integer [ref: > wallets.id, not null]
type varchar(50) [not null, note: 'DEPOSIT, WITHDRAWAL, TRANSFER_SENT, TRANSFER_RECEIVED']
amount decimal(15,2) [not null]
recipient_wallet_id integer [ref: > wallets.id, note: 'Nullable for non-transfer transactions']
status varchar(50) [default: 'COMPLETED']
created_at timestamp [default: CURRENT_TIMESTAMP]
}

Ref: users.id > wallets.user_id [one-to-one]
Ref: wallets.id > transactions.wallet_id [one-to-many]
Ref: wallets.id > transactions.recipient_wallet_id [one-to-many, nullable]


## Entity-Relationship (E-R) Diagram (diagram)
+----------------+         +----------------+         +-------------------+
|     users      |         |    wallets     |         |   transactions    |
+----------------+         +----------------+         +-------------------+
| id (PK)        |<------1 | id (PK)        |<------1 | id (PK)           |
| email (U, NN)  |         | user_id (FK)   |         | wallet_id (FK)    |
| name (NN)      |         | balance        |         | type (NN)         |
| password (NN)  |         | created_at     |         | amount (NN)       |
| created_at     |         | updated_at     |         | recipient_wallet  |
| updated_at     |         +----------------+         | _id (FK, nullable)|
+----------------+                 ^                 | status            |
                                   |                 | created_at        |
                                   |                 +-------------------+
                                   | (recipient)             ^
                                   +-------------------------+

## Setup Instructions

### Prerequisites
- Node.js v16+
- MySQL v8.0+
- npm/yarn

### Installation
```bash
git clone https://github.com/Daniho100/Demo_client_lendsqr
cd Demo_client_lendsqr
npm install
cp .env.example .env

# Fill in DB credentials and JWT secret in .env
npm run migrate
npm start

API Endpoints
Method	Endpoint	                       Description                 Auth Required
POST	/api/users	            Create a user (with blacklist check)	    No
POST	/api/auth/login	        User login    (JWT issuance)	            No
POST	/api/wallets/deposit	Fund wallet	                                Yes
POST	/api/wallets/transfer	Transfer funds to another user	            Yes
POST	/api/wallets/withdraw	Withdraw from wallet	                    Yes
GET	/api/wallets/balance/:userId	Get wallet balance	                    Yes

Example: Transfer Funds
curl -X POST http://localhost:8081/api/wallets/transfer \
-H "Authorization: Bearer <jwt_token>" \
-H "Content-Type: application/json" \
-d '{"toEmail": "mary@gmail.com", "amount": 500}'

Testing
Postman use webpostman or desktop(ideal)

Jest
npm install --save-dev jest ts-jest supertest knex-mock-client
Run Tests

npm test
npm test -- --coverage
Test Coverage Includes
User registration and Karma blacklist

Login and Faux JWT auth

Wallet deposit, withdrawal, transfer, getBalance

Negative cases (e.g., insufficient funds, blacklisted users)

Deployment (Render)
Push code to GitHub.

Connect Render to GitHub.

Set up .env variables via the dashboard.

Deploy MySQL DB and connect it.

Add deploy command: npm run migrate && npm start

License
MIT License