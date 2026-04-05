# Ledgvyn

Ledgvyn is an API service designed to power corporate finance dashboards. It handles the financial data layer, allowing systems to maintain transactional ledgers, generate consolidated reports, and manage team access levels.

## How It Works

#### **1. Workspace Initialization**
Any user can sign up to create a new account. Upon registration, they **initialize their own project workspace**, effectively becoming the **Admin** of that environment. This workspace acts as a secure silo, ensuring that all subsequent data and team members are completely isolated from other projects on the platform.

#### **2. Team Expansion & Roles**
Once the project is initialized, the Admin can add new members to the team. Access is governed by a built-in role system to ensure data integrity:
*   **Admin**: Full operational control over the team, the ledger, and analytics.
*   **Analyst**: Authorized to view the granular financial records and the analytics dashboard, but restricted from creating, modifying or deleting any data.
*   **Viewer**: Stakeholder access with read-only permissions for high-level reports.

#### **3. Financial Records Management**
Admins use the workspace as a centralized ledger to maintain raw data for all financial activities.
*   **Full CRUD Lifecycle**: Create, update, and delete financial records.
*   **Detailed Attribution**: Every record includes the amount, type (Income or Expense), a specific category (e.g., Marketing, Salaries), and an audit description.
*   **Temporal Tracking**: Records are logged with precise timestamps for historical reporting.
*   **Data Integrity**: All records are scoped to the Project ID, preventing any cross-workspace leakage.

#### **4. Financial Analytics Engine**
The analytics layer translates raw ledger data into high-level business intelligence designed to power dashboard visualizations.
*   **Financial Summary**: A real-time snapshot of the project’s health, showing total income, expenses, and current net balance.
*   **Category-wise Breakdown**: A category-wise breakdown of expenses to identify exactly where capital is being utilized.
*   **Monthly Growth Trajectory**: Monthly time-series data that tracks income vs. expenses, helping analysts visualize fiscal growth over time.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database
- pnpm (or any other package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thedeepak12/ledgvyn.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file with the following variables:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
BETTER_AUTH_SECRET=your_32_character_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

4. Set up the database:
```bash
pnpm run db:push
```

5. Run the server:
```bash
pnpm run dev
```

The server will start at `http://localhost:3000`

### API Documentation

This project features a built-in, interactive documentation portal. Once the server is running, you can explore the request/response schemas and test every endpoint directly from your browser.

**Access it here**: `http://localhost:3000/api-docs`
