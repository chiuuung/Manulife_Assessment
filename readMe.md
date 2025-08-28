````markdown name=README.md
# MANULIFE-ASSESSMENT-NG-TSZ-CHIU

A full-stack portfolio management web application built with Angular (frontend), Node.js/Express (backend), and MySQL (database).  
It allows users to track asset investments, live prices, and manage transactions.

---

## Project Structure

```
MANULIFE-ASSESSMENT-NG-TSZ-CHIU/
  ├── backend/
  │     ├── database/           # DB config & schema
  │     ├── middleware/         # Express middleware
  │     ├── routes/             # API routes
  │     ├── .env                # Backend environment variables (included)
  │     ├── server.js           # Express server
  │     └── package.json
  └── frontend/
        ├── src/app/components/ # Angular components
        ├── src/app/services/   # Angular services
        └── ...                 # Other Angular files
```

---

## Environment

- **Frontend Framework:** Angular 18.2.13
- **Angular CLI:** 18.2.20
- **Node.js:** 22.11.0
- **npm:** 10.9.0
- **OS:** macOS (darwin arm64)
- **Key Angular Packages:**
  - @angular/material: 18.2.14
  - rxjs: 7.8.2
  - typescript: 5.5.4
  - zone.js: 0.14.10

---

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- For manual run: MySQL 8+, Node.js 22+, Angular CLI 18+

---

## How to Run the Project

### Option 1: Docker Compose (Recommended)

1. In the project root directory, run:
   ```bash
   docker-compose up --build
   ```
   - This launches MySQL, the backend API, and the Angular frontend.
   - The MySQL schema is loaded automatically.

2. Access the application:
   - **Frontend:** [http://localhost:4200](http://localhost:4200)
   - **Backend API/Admin:** [http://localhost:3000](http://localhost:3000)

---

### Option 2: Manual Run (Local MySQL, Node, Angular)

#### 1. MySQL Database Setup

- Start MySQL and open the shell:
  ```bash
  mysql -u root
  ```
- Create and use the database:
  ```sql
  CREATE DATABASE IF NOT EXISTS portfolio_management;
  USE portfolio_management;
  ```
- Load schema:
  ```sql
  SOURCE /full/path/to/backend/database/database_schema.sql;
  ```
  *(replace with your actual path)*

#### 2. Backend Setup

- Navigate to backend and install dependencies:
  ```bash
  cd backend
  npm install
  ```
- The `.env` file is already included in the backend folder with correct settings.
- Start the backend:
  ```bash
  npm start
  ```

#### 3. Frontend Setup

- Navigate to frontend and install dependencies:
  ```bash
  cd frontend
  npm install
  ```
- Start the Angular app:
  ```bash
  ng serve
  ```

- The app will be available at [http://localhost:4200](http://localhost:4200)

---

## Demo/Test Users

| Name   | Email           | Password   | Where to login                     |
| ------ | --------------  | ---------- | -----------------------------------|
| frank  | 1234@gmail.com  | frank123   | Frontend (http://localhost:4200)   |
| james  | james@gmail.com | james123   | Frontend (http://localhost:4200)   |
| admin  | admin@gmail.com | admin123   | Backend/Admin (http://localhost:3000) or via API |

---

## Database Initialization

- The MySQL container or manual SQL step will load `backend/database/database_schema.sql` to create tables.
- If required, you may provide a `seed.sql` for demo data.

---

## Stopping the Project

```bash
docker-compose down
```

Or, if running manually, stop each server and database as appropriate.

---
````