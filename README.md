# OrderHey! QR Restaurant Ordering System

A professional, bilingual (Khmer & English) QR-based restaurant ordering system.

## Project Structure

This project is separated into a standalone Backend and Frontend for maximum performance and scalability.

- **/backend**: Express + TypeScript API server. Handles database logic, authentication, and order processing.
- **/frontend**: Next.js 14 Web application. Handles the user interface and customer ordering flow.

## Getting Started

### 1. Install Dependencies
From the root directory, run:
```bash
npm run install:all
```

### 2. Environment Setup
- Create `backend/.env` (use `backend/env.example` as a template)
- Create `frontend/.env.local`

### 3. Run Development Server
From the root directory, run:
```bash
npm run dev
```
This will start both the backend (Port 5000) and the frontend (Port 3000) simultaneously.

## Deployment
- Deploy the `/backend` to a Node.js host (like VPS or Railway).
- Deploy the `/frontend` to Vercel.
