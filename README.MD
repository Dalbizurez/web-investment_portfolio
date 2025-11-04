# Investment Portfolio Web Application

## Overview
This project is a **full-stack investment portfolio management system** designed to allow users to register, manage their financial transactions, and visualize their portfolio performance in real time.  
It includes an **administrative panel**, a **secure authentication system**, and **automated email notifications** for all financial operations.

The system was developed as part of an academic project, following international software development conventions and best practices.

---

## Architecture
The application follows a **client–server architecture**, composed of:

- **Frontend:** Developed with [Vite](https://vitejs.dev/) and [React](https://react.dev/), using **TypeScript** for type safety and maintainability.
- **Backend:** Built with [Django](https://www.djangoproject.com/) and **Python**, implementing a RESTful API.
- **Database:** [MySQL](https://www.mysql.com/) relational database for structured data and efficient querying.
- **API Documentation:** Implemented using **Swagger** via `drf-yasg` for automatic API documentation and testing.

---

## Technologies Used

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Vite |
| **Backend** | Django, Python, Django REST Framework |
| **Database** | MySQL |
| **Documentation** | Swagger (drf-yasg) |
| **Version Control** | Git & GitHub |

---

## Technical Considerations

- **Default Admin User:** The database must include a default admin user responsible for creating other administrative accounts. After setup, this account should be disabled for security reasons.  
- **Relational Database:** MySQL was chosen for its reliability and strong data relationship management.  
- **Django Admin:** Used for backend configuration, model management, and administrative actions.  
- **Pub/Sub:** Implemented when a process must trigger multiple sub-processes.  
- **Soft Deletes:** Direct deletions are avoided; instead, records are marked as inactive.  
- **Email Notifications:** All financial actions automatically trigger an email notification to improve user experience and ensure non-repudiation.  
- **Security:** All API endpoints and frontend routes are protected to guarantee information security.  
- **Clean Architecture:** Only necessary routes and endpoints are created—no unused routes.  
- **Swagger Documentation:** Provides a standardized and interactive interface for testing and reviewing API endpoints.

---

## Application Flow Diagram

Below is the general flow of the application:

![Application Flow Diagram](./docs/flowchart.jpg)

> *The flowchart above represents the main processes of the system, from authentication and portfolio management.*

---

## How to Run the Project

### Backend (Django)

cd backend
python -m venv venv
source venv\Scripts\activate  # or venv/bin/activate on IOS
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

-----

### Frontend (Vite + React)

cd frontend
npm install
npm run dev

### Database (MYSQL)

DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306

### API DOCUMENTATION

http://localhost:8000/swagger/


### Security Practices

Token-based authentication (JWT or Auth0)

HTTPS enforced on deployment

Input validation and sanitization on all endpoints

Role-based access control (Admin / Standard User)


### Deployment

The project can be deployed using cloud services such as Render, Railway, or AWS, with the following configuration:

Frontend: Deployed as a static site (using vite build)

Backend: Hosted Django REST API

Domain: Configured with the domain provided by the instructor for both API and frontend access

## Team

| Name                            |
|---------------------------------|
| ALBIZUREZ ALPIREZ DANIEL        |
| CONTRERAS MORAN FERNANDO DAVID  |
| CORTÉS ENRIQUEZ JUAN MARCOS     |
|JUÁREZ SEGURA DANIEL EDUARDO     |
|LAINES PABLO KAREN FLORIDALMA    |
|SALGUERO SANDOVAL MIGUEL ANTONIO |
|SIQUINÁ TZÚN SEBASTIAN JOSUÉ     |


### License

This project is for academic and educational purposes only.
All rights reserved © 2025.