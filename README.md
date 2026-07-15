# Benago Platform

An educational platform connecting students and instructors, built with React (Vite), Express, MongoDB, and Clerk authentication. Deployed on Vercel with a split frontend/backend architecture.

## 🏗️ Project Structure

```
Benago Platform/
├── client/                 # React + Vite Frontend (Vercel)
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Page components
│   │   │   ├── Landing/    # Landing page
│   │   │   ├── Student/    # Student dashboard & course viewer
│   │   │   ├── Instructor/ # Instructor dashboard & course builder
│   │   │   └── Admin/      # Admin dashboard
│   │   ├── components/RoleGate.jsx    # Role-based access control
│   │   └── routes.jsx      # React Router configuration
│   ├── vercel.json         # SPA rewrite rules for Vercel
│   └── package.json
│
├── backend/                # Vercel Serverless API (Express)
│   ├── api/[...path].js    # Vercel serverless entry point
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── lib/            # Database connection & utilities
│   │   ├── Schema/         # Mongoose schemas
      │   │   ├── registrationSchema.js
      │   │   ├── instructorSchema.js
      │   │   └── courseSchema.js
      │   └── api/          # API routes
      │       ├── students.js
      │       ├── instructors.js
      │       ├── course.js
      │       └── webhooks/clerk.js
│   ├── vercel.json         # Vercel serverless config
│   └── package.json
│
├── server/                 # Local Development Server (Express)
│   ├── index.js            # Express server entry
│   ├── api/                # API routes (students, instructors, courses)
│   ├── Schema/             # Mongoose schemas
│   └── package.json
│
└── README.md
```

## 🚀 Features

### Student Features
- Video player with playlist support
- Text content reader
- Course progress tracking

### Instructor Features
- Course management
- Curriculum builder (sections, lectures, videos, text)

### Authentication & Authorization
- **Clerk Authentication** for secure auth
- Role-based access control (Student, Instructor, Admin)
- Clerk webhooks for user sync with MongoDB

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, React Router 7 |
| **Auth** | Clerk (React + Express SDKs) |
| **Backend (Vercel)** | Express 4, Serverless Functions |
| **Backend (Local Dev)** | Express 5, Nodemon |
| **Database** | MongoDB + Mongoose 8 |
| **Validation** | Joi |
| **Security** | Helmet, CORS, Express Rate Limit |
| **Webhooks** | Svix (Clerk webhooks) |
| **Deployment** | Vercel (Frontend + Backend) |


## 📚 API Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `GET /api/students` | List students | Admin |
| `GET /api/instructors` | List instructors | Admin |
| `POST /api/courses` | Create course | Instructor |
| `GET /api/courses` | List courses | Public/Role-based |
| `POST /api/webhooks/clerk` | Clerk webhook handler | Svix signature |

## 📦 Database Schemas

- **Registration** - User registration & role assignment
- **Instructor** - Instructor profile, courses, stats
- **Course** - Course content, curriculum, enrollment

## 🔐 Role-Based Access

| Route | Student | Instructor | Admin |
|-------|---------|------------|-------|
| `/student/*` | ✅ | ❌ | ✅ |
| `/instructor/*` | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |

Controlled via `RoleGate.jsx` component using Clerk's `user.privateMetadata.role`.

## 📄 License

ISC License - See individual package.json files for details.