# AEGIS Protocol - Backend API Documentation

Base URL: `/api`

## Authentication (`/auth`)

| Method | Endpoint | Description | Roles | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public | `{ name, email, password, role, department }` |
| `POST` | `/login` | User login | Public | `{ email, password }` |
| `GET` | `/me` | Get current user profile | Authenticated | - |
| `PATCH` | `/me` | Update user profile | Authenticated | `{ name, department, academicDetails, ... }` |
| `GET` | `/users` | Get all users | Admin | - |
| `PATCH` | `/users/:id/role` | Update user role | Admin | `{ role }` |

## Grievances (`/grievances`)

| Method | Endpoint | Description | Roles | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a new grievance | Student | `{ title, description, category, priority }` |
| `GET` | `/` | List all grievances | Student (Own), Authority/Admin (All) | - |
| `GET` | `/:id` | Get grievance details | Authenticated | - |
| `PATCH` | `/:id/status` | Update grievance status | Authority, Admin | `{ status }` (pending, in-review, resolved, dismissed) |
| `POST` | `/:id/comments` | Add a comment | Authenticated | `{ content }` |
| `PATCH` | `/:id/assign` | Assign grievance to authority | Admin | `{ assignedTo }` (User ID) |

## Academics (`/courses`)

| Method | Endpoint | Description | Roles | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a new course | Faculty, Admin | `{ code, name, description, credits }` |
| `GET` | `/` | Get all courses | Authenticated | - |
| `GET` | `/:id` | Get course details | Authenticated | - |
| `POST` | `/:id/enroll` | Enroll in a course | Student | - |
| `POST` | `/:id/resources` | Add course resource | Faculty, Admin | `{ title, type, url, description }` |
| `GET` | `/:id/resources` | Get course resources | Authenticated | - |
| `DELETE` | `/resources/:id` | Delete a resource | Faculty, Admin | - |

## Internships & Opportunities (`/opportunities`)

| Method | Endpoint | Description | Roles | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Post a new opportunity | Faculty, Admin | `{ title, company, description, type, deadline }` |
| `GET` | `/` | Get all opportunities | Authenticated | - |
| `GET` | `/:id` | Get opportunity details | Authenticated | - |
| `PATCH` | `/:id` | Update opportunity | Faculty, Admin | `{ ... }` |
| `POST` | `/:id/apply` | Apply for opportunity | Student | `{ resumeLink, coverLetter }` |
| `GET` | `/applications/my` | Get my applications | Student | - |
| `GET` | `/:id/applications`| Get applicants for job | Faculty, Admin | - |
| `PATCH` | `/applications/:id/status` | Update application status | Faculty, Admin | `{ status }` (applied, shortlisted, accepted, rejected) |

## Transport (`/transport`)

| Method | Endpoint | Description | Roles | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/routes` | Get all bus routes | Authenticated | - |
| `GET` | `/search` | Search for bus schedules | Authenticated | Query Params: `from`, `to`, `date` |
| `GET` | `/bookings` | Get my active bookings | Authenticated | - |
| `GET` | `/schedule/:id/seats` | Get booked seats for schedule | Authenticated | - |
| `POST` | `/book` | Book a seat | Authenticated | `{ scheduleId, seatNumber }` |

## Error Handling

All endpoints follow a standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## Authentication

Authentication is handled via JWT. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```
