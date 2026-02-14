# System Architecture Documentation

## 1. Executive Summary

IIT MANDI Campus Connect (formerly AEGIS Protocol) is a robust, full-stack web application built on the MERN stack (MongoDB, Express.js, React, Node.js). It serves as a unified digital platform for campus management, integrating academic services, grievance redressal, and student utilities into a seamless experience.

The architecture emphasizes modularity, security, and scalability, designed to handle distinct user roles (Student, Faculty, Admin, Authority) with granular access controls.

## 2. High-Level Architecture

The system follows a classic Client-Server architecture:

```mermaid
graph TD
    Client[Frontend (React/Vite)] <-->|REST API (JSON)| LB[Load Balancer / Reverse Proxy]
    LB <--> Server[Backend API (Node.js/Express)]
    Server <-->|Mongoose ODM| DB[(MongoDB Database)]
    Server -->|Logs| Logger[Logging Service]
```

## 3. Backend Architecture

The backend is built with **Node.js** and **Express**, structured around a Layered Architecture (Controller-Service-Model) to ensure separation of concerns.

### 3.1 Directory Structure
```
backend/src/
├── config/         # Environment and DB configuration
├── controllers/    # Request handling and response formatting
├── middleware/     # Auth checks, error handling, validation
├── models/         # Mongoose schemas and data definitions
├── routes/         # API route definitions
├── services/       # Business logic (Heavy lifting)
├── validators/     # Joi validation schemas
└── seed/           # Database seeding scripts
```

### 3.2 Key Components

-   **API Layer (Routes & Controllers)**:
    -   Routes delegate requests to specific Controllers.
    -   Controllers extract data from requests (`req.body`, `req.params`) and call the Service layer.
    -   **Strict Separation**: Controllers strictly handle HTTP concerns (status codes, headers), while Services handle business rules.

-   **Service Layer**:
    -   Contains the core business logic.
    -   Example: `grievance.service.js` handles the logic for setting "High" priority for sensitive categories like Ragging, independently of the controller.

-   **Data Layer (Models)**:
    -   Defined using **Mongoose**.
    -   Models include `User`, `Grievance`, `Academic`, `Transport`.
    -   Indexes are used on frequently queried fields (e.g., `status`, `submittedBy`) for performance.

-   **Security & Middleware**:
    -   **Authentication**: Stateless JWT (JSON Web Token) authentication. `protect` middleware verifies tokens on protected routes.
    -   **RBAC (Role-Based Access Control)**: Middleware checks `req.user.role` to authorize actions (e.g., only 'admin' can see all users).
    -   **Input Validation**: **Joi** schemas validate request payloads before they reach the controller, preventing bad data from entering the system.
    -   **Security Headers**: **Helmet** is used to set secure HTTP headers.
    -   **Sanitization**: **express-mongo-sanitize** prevents NoSQL injection attacks.

## 4. Frontend Architecture

The frontend is a Single Page Application (SPA) built with **React 18** and **Vite**, focusing on performance and user experience.

### 4.1 Key Technologies
-   **Vite**: Build tool for fast HMR (Hot Module Replacement) and optimized production builds.
-   **React Router v6**: Manages client-side navigation and protected routes.
-   **Context API**: Manages global state (User Authentication, Theme).
-   **Axios**: Handles HTTP requests with interceptors for token management.

### 4.2 Component Structure
The UI is built using atomic design principles:
-   **Pages**: Top-level views (e.g., `Login.jsx`, `Dashboard.jsx`, `NewGrievance.jsx`).
-   **Components**: Reusable UI elements (`Navbar`, `Footer`, `Card`, `Button`).
-   **Layouts**: Wrapper components that define the common structure (Sidebar, Header).

### 4.3 Key Workflows

#### Authentication Flow
1.  User enters credentials on Login page.
2.  Frontend sends POST request to `/api/auth/login`.
3.  Backend verifies credentials and issues a **JWT**.
4.  Frontend stores JWT in `localStorage` and updates AuthContext.
5.  Axios interceptor attaches the JWT to the `Authorization` header for subsequent requests.

#### Grievance Submission Flow
1.  User fills the form in `NewGrievance.jsx`.
2.  Frontend validates inputs (e.g., "Reason" length).
3.  **Client-Side Logic**: If "Ragging" or "Sexual Harassment" is selected, the UI forces "High" priority and shows a warning.
4.  POST request sent to `/api/grievances`.
5.  Backend Validator checks input schema.
6.  Backend Service enforces the High priority rule (server-side validation) and saves to DB.
7.  Response returned; Frontend notifies user via Toast.

## 5. Deployment Strategy

-   **Backend**: Can be deployed on Node.js compatible environment (AWS EC2, Heroku, Vercel, Render).
-   **Frontend**: Static asset deployment (Vercel, Netlify, AWS S3+CloudFront).
-   **Database**: MongoDB Atlas (Managed Cloud Database) for reliability and backup.

## 6. Future Scalability

-   **Microservices**: The layered architecture allows extracting specific modules (e.g., `TransportService`) into separate microservices if load increases.
-   **Caching**: Redis can be introduced at the Service layer to cache frequent queries (e.g., Shuttle timings).
-   **Real-time Updates**: Socket.io can be integrated for real-time notifications on Grievance status updates.
