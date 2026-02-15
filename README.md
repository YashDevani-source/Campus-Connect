# IIT MANDI Campus Connect (formerly AEGIS Protocol)

A comprehensive Campus Digital Ecosystem designed to modernize academic and administrative processes at IIT Mandi. This platform unifies academic management, grievance handling, internship opportunities, and student services into a single, cohesive interface.

## 🚀 Features

- **Role-Based Dashboards**: Tailored views for Students, Faculty, Management, and Admins.
- **Academic Management**: 
  - **Course Approval Workflow**: Faculty propose courses, Admin/Management approve them.
  - Course registration, timetable tracking, and grade viewing.
- **Grievance Redressal System**: 
  - Submit complaints regarding academics, infrastructure, hostels, etc.
  - **High Priority Reporting**: Special handling for sensitive issues like Ragging.
  - Track complaint status and history.
- **Internship & Opportunities**: Browse and apply for campus internships and projects.
- **Transport Services**: View shuttle timings and book transport.
- **Secure Authentication**: Role-based access control using JWT.

## 🛠 Tech Stack

### Frontend
- **React.js (Vite)**: Fast, modern UI development.
- **React Router**: Client-side routing.
- **Context API**: State management for authentication and theme.
- **Styling**: Modular CSS with responsive design principles.
- **Axios**: HTTP client for API requests.

### Backend
- **Node.js & Express**: Robust and scalable server environment.
- **MongoDB & Mongoose**: Flexible NoSQL database schema.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize.

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js**: v14.0.0 or higher
- **npm** or **yarn**
- **MongoDB**: A running instance (local or Atlas cluster)

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory based on `.env.example`.
    - Required variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`.

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```

## 🚀 Running the Application

To run the application, you need to start both the backend server and the frontend development server concurrently.

1.  **Start Backend Server**
    ```bash
    # From the backend directory
    npm run dev
    # Server runs on http://localhost:5000 (default)
    ```

2.  **Start Frontend Client**
    ```bash
    # From the frontend directory
    npm run dev
    # Client runs on http://localhost:5173 (default)
    ```

## 📚 API Documentation

For detailed API endpoints and usage, refer to [Backend API Docs](./backend/backend_api_docs.md).

## 🤝 Contribution

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
