# CRS - Car Rental System

A modern, full-stack car rental management system built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Dashboard**: Comprehensive overview of business metrics.
- **Vehicle Management**: Add, edit, remove, and track fleet status.
- **Booking Management**: Streamlined booking process and tracking.
- **Customer Management**: Customer profiles, history, and verification.
- **Maintenance Tracking**: Keep track of vehicle maintenance schedules.
- **Reports & Analytics**: Visual insights into revenue and performance.
- **Admin Management**: Role-based access control.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB instance (Local or Atlas)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```
   
   Update `MONGODB_URI` and `AUTH_SECRET` in `.env`.

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utilities, database connection, and server actions.
- `src/types`: TypeScript type definitions.
- `public`: Static assets.

## Deployment

This application is optimized for deployment on Vercel.

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Configure the Environment Variables in Vercel.
4. Deploy.
