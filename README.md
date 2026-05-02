# Team Task Manager

A full-stack web application built with the MERN stack where users can create projects, assign tasks to team members, and track progress with role-based access control (Admin/Member).

## Features

- **Authentication** - Signup and Login with JWT token-based auth
- **Role-Based Access** - Admin and Member roles with different permissions
- **Project Management** - Create, update, delete projects (Admin only)
- **Team Management** - Add members to projects by email (Admin only)
- **Task Management** - Create tasks, assign to members, set due dates
- **Status Tracking** - Track task status (Todo -> In Progress -> Done)
- **Dashboard** - View task stats including total, in-progress, done, and overdue counts
- **Overdue Detection** - Tasks past their due date are highlighted

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| HTTP Client | Axios |
| Routing | React Router DOM |

## Project Structure

```
Team_task_manager/
+-- client/                    # React frontend
|   +-- src/
|   |   +-- components/        # Reusable UI components
|   |   +-- context/           # Auth state management
|   |   +-- pages/             # App pages
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   +-- package.json
|   +-- vite.config.js
+-- server/                    # Express backend
|   +-- config/db.js           # MongoDB connection
|   +-- middleware/auth.js     # JWT auth middleware
|   +-- models/                # Mongoose schemas
|   +-- routes/                # API route handlers
|   +-- server.js
|   +-- package.json
+-- README.md
```

## Prerequisites

- Node.js (v18 or above)
- MongoDB (running locally or MongoDB Atlas)

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Team_task_manager
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a .env file inside server/ (optional):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/team_task_manager
JWT_SECRET=your_secret_key_here
```

Start the backend server:

```bash
node server.js
```

The server will run on http://localhost:5000

### 3. Setup Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/me | Get current user info |

### Project Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/projects | Create a new project | Admin |
| GET | /api/projects | Get all user projects | Auth |
| GET | /api/projects/:id | Get project details | Auth |
| PUT | /api/projects/:id | Update a project | Admin |
| DELETE | /api/projects/:id | Delete a project | Admin |
| POST | /api/projects/:id/members | Add member to project | Admin |

### Task Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/tasks | Create a new task | Admin |
| GET | /api/tasks | Get tasks (filter by project) | Auth |
| GET | /api/tasks/dashboard | Get dashboard stats | Auth |
| PUT | /api/tasks/:id | Update task status/details | Admin/Assignee |
| DELETE | /api/tasks/:id | Delete a task | Admin |

## How to Use

1. Sign up as an Admin or Member
2. Login with your credentials
3. Create a Project (Admin only) from the Projects page
4. Add Members to the project using their email
5. Create Tasks and assign them to project members
6. Track Progress on the Dashboard
7. Members can update the status of tasks assigned to them

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create Project | Yes | No |
| Delete Project | Yes | No |
| Add Members | Yes | No |
| Create Task | Yes | No |
| Delete Task | Yes | No |
| Update Task Status | Yes | Yes (own tasks) |
| View Dashboard | Yes | Yes |
| View Projects | Yes | Yes |

## Deployment

This app can be deployed on Railway:

1. Push your code to GitHub
2. Connect your repo to Railway
3. Deploy server/ as a web service (set environment variables)
4. Deploy client/ as a static site (build with npm run build)
5. Update the API URL in client/src/context/AuthContext.jsx to point to your deployed backend

## Author

Rajashekhar
