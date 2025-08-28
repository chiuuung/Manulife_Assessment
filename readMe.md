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
  ├── docker-compose.yml
  ├── README.md
  └── (all other project files)
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
- For manual run (not required for Docker): MySQL 8+, Node.js 22+, Angular CLI 18+

---

## How to Use This Project

### 1. **Unpack the Submission**

- Download and extract the zipped project folder `MANULIFE-ASSESSMENT-NG-TSZ-CHIU.zip` to your preferred directory.
- The folder will include all source code, Dockerfiles, `docker-compose.yml`, and this README file.

### 2. **Run with Docker Compose (Recommended)**

1. **Open a terminal and navigate to the extracted project directory:**
    ```bash
    cd /path/to/MANULIFE-ASSESSMENT-NG-TSZ-CHIU
    ```

2. **Start the project (build and launch all services):**
    ```bash
    docker-compose up --build
    ```
   - This launches MySQL, the backend API, and the Angular frontend.
   - The MySQL schema is loaded automatically.

3. **Access the application:**
   - **Frontend:** [http://localhost:4200](http://localhost:4200)
   - **Backend API/Admin:** [http://localhost:3000](http://localhost:3000)
   - **Admin page:** [http://localhost:3000/admin](http://localhost:3000/admin)

4. **Shut down the project:**
    ```bash
    docker-compose down
    ```
   - To erase all data (reset database), add `-v`:
     ```bash
     docker-compose down -v
     ```

---

### 3. **Manual Run (for Development/Debugging)**

See instructions in the previous section (“Manual Run”) for setting up MySQL, backend, and frontend individually.

---

## Real-Time Price Update System

This application features a real-time price update system for all asset types.  
**Live asset prices are automatically fetched from [Yahoo Finance](https://finance.yahoo.com/) every second via the backend.**

- **Automatic Updates:**  
  Portfolio and asset prices are refreshed every second without any manual action.  
- **Manual Update:**  
  If you wish, you can also press the "Price Update" button in the app to instantly fetch the latest prices.

This ensures your portfolio values and performance metrics always reflect the most up-to-date market data.

---

## Demo/Test Users

### Normal Users (login at [http://localhost:4200](http://localhost:4200))

| Name   | Email           | Password   |
| ------ | --------------  | ---------- |
| frank  | 1234@gmail.com  | frank123   |
| james  | james@gmail.com | james123   |

**Example login case:**
- user name: frank  
  login: 1234@gmail.com  
  password: frank123

- user name: james  
  login: james@gmail.com  
  password: james123

### Admin User (login at [http://localhost:3000/admin](http://localhost:3000/admin))

| Name   | Email           | Password   |
| ------ | --------------  | ---------- |
| admin  | admin@gmail.com | admin123   |

**Example admin login case:**
- user name: admin  
  login: admin@gmail.com  
  password: admin123

---

## User Guide

- You can **register** and **login** to start using your investment portfolios.
- Normal users use the Angular frontend (`localhost:4200`) for managing portfolios and transactions.
- The admin can login to the admin page (`localhost:3000/admin`) to manage the database and users.

---

## Database Initialization

- The MySQL container or manual SQL step will load `backend/database/database_schema.sql` to create tables.
- If required, you may provide a `seed.sql` for demo data.

---

## Git & Submission Notes

- This project includes a `.git` folder to demonstrate commit history.
- You are receiving a **complete project folder** (not just Dockerfiles) for full transparency and reproducibility.
- To review code and commit history, you may use any Git tool:
  ```bash
  cd /path/to/MANULIFE-ASSESSMENT-NG-TSZ-CHIU
  git log --oneline --all --graph
  ```

---

## Stopping the Project

```bash
docker-compose down
```

Or, if running manually, stop each server and database as appropriate.

---

## Confidentiality

This project and all materials are confidential and intended solely for use in the interview process. Do not share or distribute.

---

## GitHub

https://github.com/chiuuung/Manulife_Assessment

---