# Academic Management System

A comprehensive web-based platform for managing academic processes including course offerings, student enrollments, grade management, academic records, and faculty advising. Built for educational institutions to streamline academic operations.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Academic Management System (AMS) is a full-stack application designed to digitize and streamline academic operations. It provides role-based access for administrators, instructors, and students to manage courses, enrollments, grades, feedback, and academic records.

## 🛠 Tech Stack

### Backend
- **NestJS** v11.0.1 - Progressive Node.js framework for building efficient server-side applications
- **Prisma** v6.0.0 - Next-generation TypeScript ORM for database management
- **PostgreSQL** v14+ - Robust relational database
- **Passport JWT** - Secure authentication and authorization
- **Nodemailer** v7.0.12 - Email service for OTP and notifications
- **Bcrypt** v6.0.0 - Password hashing
- **Class Validator** & **Class Transformer** - Input validation and transformation
- **TypeScript** v5.7.3 - Type-safe JavaScript

### Frontend
- **Next.js** 16.0.10 - React framework with App Router
- **React** 19.2.0 - UI library
- **TypeScript** v5+ - Type-safe development
- **Material-UI (MUI)** v5.18.0 - Comprehensive React component library
- **Radix UI** - Accessible UI primitives
- **TailwindCSS** v4.1.9 - Utility-first CSS framework
- **Axios** v1.6.0 - Promise-based HTTP client
- **React Hook Form** v7.60.0 - Form state management
- **Zod** v3.25.76 - Schema validation
- **Recharts** v3.6.0 - Data visualization
- **jsPDF** v4.0.0 - PDF generation
- **Day.js** v1.11.10 - Date manipulation
- **Tanstack Query** v5.0.0 - Data fetching and caching
- **Next Themes** - Dark/Light theme support


## ✨ Key Features

### 👨‍💼 For Administrators

#### Course Management
- **Course Catalog**: Create, edit, and manage courses with codes, names, credits, and LTPSC structure
- **Course Proposal Review**: Review and approve/reject new course proposals from instructors
- **Course Offering Approvals**: Review and approve instructor requests to teach courses
- **Department Management**: Manage departments and branch-department mappings

#### User Management
- **User Administration**: Create and manage student, instructor, and admin accounts
- **Faculty Advisor Assignment**: Assign instructors as faculty advisors for students
- **Department Assignment**: Assign departments to instructors
- **User Activation/Deactivation**: Control user account status

#### Academic Calendar
- **Semester Configuration**: Define semester periods (start/end dates)
- **Enrollment Periods**: Set enrollment windows for students
- **Deadline Management**: Configure drop and audit deadlines
- **Automated Enforcement**: System automatically enforces calendar-based rules

#### Reports & Analytics
- **Transcript Generation**: Generate and view comprehensive student transcripts
- **Enrollment Reports**: Track enrollment statistics across courses
- **Performance Analytics**: Monitor academic performance trends
- **Course Offering History**: View historical course offering data

### 👨‍🏫 For Instructors

#### Course Management
- **Course Offerings**: Request to teach courses for specific semesters
- **New Course Proposals**: Propose new courses with detailed descriptions
- **Time Slot Management**: Specify preferred time slots for courses
- **Branch Restrictions**: Define which branches can enroll in offerings

#### Enrollment Management
- **Pending Requests**: View and process student enrollment requests
- **Approval/Rejection**: Approve or reject enrollment requests with reasons
- **Batch Enrollment**: Auto-enroll students by branch and batch year
- **Enrollment Types**: Support for credit, concentration, and minor enrollments
- **View All Enrollments**: Filter by status (Enrolled, Audit, Dropped, Completed)
- **Enrollment Triggers**: Set up automated enrollment rules for specific student groups

#### Grade Management
- **Grade Entry**: Upload and update grades for enrolled students
- **Grade Scale**: Support for standard grade scale (A, A-, B, B-, C, C-, D, E, F)
- **Bulk Grade Upload**: Import grades from CSV files
- **Grade History**: View and modify historical grade data
- **Completion Tracking**: Automatic enrollment completion on grade submission

#### Feedback System
- **Feedback Forms**: Create and manage course feedback forms
- **Form Configuration**: Customize feedback questions and rating criteria
- **Response Collection**: Collect student feedback with ratings (1-5 scale)
- **Feedback Analysis**: View aggregated feedback statistics
- **Form Status**: Open/close feedback forms as needed

#### Faculty Advisor Features
- **Advisee Management**: View list of students under advising
- **Enrollment Approval**: Review and approve advisee enrollment requests
- **Academic Monitoring**: Track advisee academic performance
- **Course Recommendations**: Provide guidance on course selections

#### Student Management
- **View Enrolled Students**: Access list of students in each course offering
- **Student Records**: View individual student academic records
- **Performance Tracking**: Monitor student progress in courses

### 👨‍🎓 For Students

#### Course Discovery
- **Browse Offerings**: View all available course offerings for current semester
- **Advanced Filters**: Filter by department, credits, instructor, time slot
- **Course Details**: View detailed course information, prerequisites, and descriptions
- **Instructor Information**: See instructor profiles and course history

#### Enrollment Management
- **Enrollment Requests**: Request enrollment in available courses
- **Enrollment Types**: Choose between credit, concentration, or minor enrollments
- **Drop Courses**: Drop courses before the deadline
- **Audit Conversion**: Convert credit enrollments to audit status
- **Status Tracking**: Monitor enrollment request status (pending/approved/rejected)
- **Enrollment History**: View all past and current enrollments

#### Academic Records
- **Semester-wise Performance**: View grades and performance by semester
- **GPA Calculation**: Automatic calculation of semester and cumulative GPA
- **Credit Tracking**: Monitor earned credits and progress towards degree
- **Grade History**: Complete academic history with all courses taken
- **Transcript Access**: View and download academic transcripts

#### Feedback System
- **Course Feedback**: Provide feedback for completed courses
- **Rating System**: Rate courses on content, teaching, evaluation, and overall experience
- **Anonymous Comments**: Submit optional comments and suggestions
- **Feedback History**: View previously submitted feedback

#### Dashboard & Notifications
- **Personalized Dashboard**: Quick access to important information
- **Enrollment Statistics**: Visual representation of academic progress
- **Upcoming Deadlines**: Alerts for drop/audit deadlines
- **Course Recommendations**: Suggested courses based on academic record

### 🔐 Security Features
- **OTP-based Authentication**: Secure login using email OTP
- **JWT Token Management**: Session management with JWT tokens
- **Role-based Access Control**: Granular permissions for each user role
- **Password Security**: Bcrypt hashing for secure password storage
- **Email Verification**: Verified email addresses for all users

### 🔄 System Features
- **Real-time Updates**: Instant synchronization across all modules
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme switcher for user preference
- **Data Validation**: Comprehensive input validation on client and server
- **Error Handling**: User-friendly error messages and recovery
- **Audit Trail**: Track important system actions and changes
- **CSV Import/Export**: Bulk data operations support


## 🏗 System Architecture

```
academic-management-system/
├── backend/                          # NestJS Backend Application
│   ├── prisma/                       # Database Layer
│   │   ├── schema.prisma            # Database schema definition
│   │   └── migrations/              # Database migrations
│   ├── src/
│   │   ├── modules/                 # Feature Modules
│   │   │   ├── admin/              # Admin operations
│   │   │   ├── auth/               # Authentication & OTP
│   │   │   ├── courses/            # Course management
│   │   │   ├── course-offerings/   # Course offering management
│   │   │   ├── course-proposals/   # New course proposals
│   │   │   ├── enrollments/        # Enrollment operations
│   │   │   ├── feedback/           # Feedback system
│   │   │   ├── instructor/         # Instructor operations
│   │   │   ├── student-records/    # Student academic records
│   │   │   └── users/              # User management
│   │   ├── common/                 # Shared Resources
│   │   │   ├── decorators/         # Custom decorators
│   │   │   ├── guards/             # Auth guards
│   │   │   ├── services/           # Shared services
│   │   │   └── strategies/         # Auth strategies
│   │   ├── constants/              # Application constants
│   │   ├── prisma/                 # Prisma service
│   │   └── utils/                  # Utility functions
│   ├── .env                        # Environment variables
│   ├── package.json                # Backend dependencies
│   └── tsconfig.json               # TypeScript configuration
│
├── frontend/                        # Next.js Frontend Application
│   ├── app/                        # App Router (Next.js 16)
│   │   ├── admin/                 # Admin Pages
│   │   │   ├── approvals/         # Course offering approvals
│   │   │   ├── calendar/          # Academic calendar management
│   │   │   ├── courses/           # Course management
│   │   │   ├── course-proposals/  # Course proposal reviews
│   │   │   ├── dashboard/         # Admin dashboard
│   │   │   ├── transcript/        # Transcript generation
│   │   │   └── users/             # User management
│   │   ├── instructor/            # Instructor Pages
│   │   │   ├── advisor/           # Faculty advisor features
│   │   │   ├── all-offerings/     # All course offerings view
│   │   │   ├── batch-enrollment/  # Batch enrollment
│   │   │   ├── dashboard/         # Instructor dashboard
│   │   │   ├── enrollments/       # Enrollment management
│   │   │   ├── feedback/          # Feedback forms
│   │   │   ├── grades/            # Grade management
│   │   │   ├── new-course/        # Course proposals
│   │   │   ├── offerings/         # Course offerings
│   │   │   └── students/          # Student management
│   │   ├── student/               # Student Pages
│   │   │   ├── dashboard/         # Student dashboard
│   │   │   ├── enrollments/       # Enrollment management
│   │   │   ├── feedback/          # Course feedback
│   │   │   ├── offerings/         # Browse course offerings
│   │   │   └── record/            # Academic record
│   │   ├── login/                 # Login page
│   │   ├── profile/               # User profile
│   │   ├── unauthorized/          # Unauthorized access page
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable Components
│   │   ├── layout/                # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── ui/                    # UI primitives (Radix + shadcn)
│   │   ├── theme-provider.tsx     # Theme context
│   │   └── Toaster.tsx            # Toast notifications
│   ├── lib/                       # Libraries & Utilities
│   │   ├── api/                   # API client functions
│   │   ├── auth/                  # Auth utilities
│   │   ├── routes/                # Route constants
│   │   ├── theme/                 # Theme configuration
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Helper functions
│   ├── hooks/                     # Custom React hooks
│   ├── public/                    # Static assets
│   ├── .env.local                 # Environment variables
│   ├── package.json               # Frontend dependencies
│   └── tsconfig.json              # TypeScript configuration
│
└── README.md                       # Project documentation
```

### Data Flow Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────┐      Prisma      ┌─────────────┐
│   Frontend  │ ◄─────────────────► │   NestJS     │ ◄──────────────► │ PostgreSQL  │
│  (Next.js)  │   JSON/JWT Auth     │   Backend    │   ORM Queries    │  Database   │
└─────────────┘                     └──────────────┘                   └─────────────┘
      │                                     │
      │                                     │
      ▼                                     ▼
┌─────────────┐                     ┌──────────────┐
│   Browser   │                     │  Nodemailer  │
│   Storage   │                     │ (Email/OTP)  │
└─────────────┘                     └──────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** - Version 18.0.0 or higher (LTS recommended)
  - Download: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** - Version 9.0.0 or higher (comes with Node.js)
  - Verify installation: `npm --version`
  
- **PostgreSQL** - Version 14 or higher
  - Download: https://www.postgresql.org/download/
  - Verify installation: `psql --version`
  
- **Git** - For version control
  - Download: https://git-scm.com/
  - Verify installation: `git --version`

### Optional but Recommended

- **pgAdmin** - PostgreSQL GUI management tool
  - Download: https://www.pgadmin.org/
  
- **VS Code** - Recommended code editor with extensions:
  - ESLint
  - Prettier
  - Prisma
  - TypeScript and JavaScript Language Features
  
- **Postman** or **Thunder Client** - For API testing

## 🚀 Installation Guide

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/academic-management-system.git
cd academic-management-system
```

### 2. PostgreSQL Database Setup

#### Start PostgreSQL Service
```bash
# Windows: PostgreSQL usually runs as a service by default
# Check if running: services.msc

# Linux/Mac:
sudo service postgresql start
# or
sudo systemctl start postgresql
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Execute the following SQL commands:
CREATE DATABASE academic_management;

# (Optional) Create a dedicated database user
CREATE USER ams_user WITH PASSWORD 'secure_password';
ALTER ROLE ams_user SET client_encoding TO 'utf8';
ALTER ROLE ams_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ams_user SET timezone TO 'UTC';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE academic_management TO ams_user;

# Exit psql
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file (see Environment Configuration section below)

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed

# Build the application
npm run build
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env.local file (see Environment Configuration section below)
```

### 5. Verify Installation

```bash
# Check Node.js and npm versions
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher

# Check PostgreSQL connection
psql -U postgres -d academic_management -c "\dt"
# Should list all Prisma-generated tables

# Check backend dependencies
cd backend
npm list @nestjs/core @prisma/client

# Check frontend dependencies
cd ../frontend
npm list next react
```


## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/academic_management"
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="86400"  # Token expiration in seconds (24 hours)

# Server Configuration (Optional)
PORT=3000  # Backend server port

# Email Configuration (for OTP and notifications)
MAIL_HOST="smtp.gmail.com"              # SMTP server host
MAIL_PORT=587                           # SMTP port (587 for TLS, 465 for SSL)
MAIL_USER="your-email@gmail.com"        # Email address
MAIL_PASSWORD="your-app-password"       # App password (not your regular password)
MAIL_FROM="noreply@academic-system.com" # From email address

# Email Service Setup Instructions:
# For Gmail:
# 1. Enable 2-Factor Authentication in Google Account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Use the generated 16-character password in MAIL_PASSWORD
```

**Important Notes:**
- Never commit `.env` file to version control
- Generate a strong JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- For production, use environment-specific configurations

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optional: Frontend Port (default: 3001)
# PORT=3001

# Optional: Next.js Configuration
# NEXT_PUBLIC_APP_NAME="Academic Management System"
# NEXT_PUBLIC_APP_VERSION="1.0.0"
```

**Important Notes:**
- Prefix public variables with `NEXT_PUBLIC_` to expose them to the browser
- Never include sensitive keys in `NEXT_PUBLIC_` variables
- For production, update `NEXT_PUBLIC_API_URL` to your production API URL

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Both Servers Simultaneously

Open two terminal windows/tabs:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run start:dev
```
The backend will start on `http://localhost:3000`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3001`

#### Option 2: Using npm Scripts (if configured)

```bash
# From project root (if you have concurrent setup)
npm run dev
```

#### Optional: Prisma Studio (Database GUI)

**Terminal 3 - Prisma Studio:**
```bash
cd backend
npx prisma studio
```
Prisma Studio will open on `http://localhost:5555`

### Production Mode

#### Build and Run Backend

```bash
cd backend

# Build the application
npm run build

# Start production server
npm run start:prod
```

#### Build and Run Frontend

```bash
cd frontend

# Build the application
npm run build

# Start production server
npm start
```

### Available npm Scripts

#### Backend Scripts

```bash
# Development
npm run start:dev     # Start with hot-reload
npm run start:debug   # Start with debugging

# Production
npm run build         # Build for production
npm run start:prod    # Start production build

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier

# Testing
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run end-to-end tests

# Database
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev # Run migrations
npx prisma generate   # Generate Prisma Client
npx prisma db push    # Push schema changes without migrations
```

#### Frontend Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Accessing the Application

Once both servers are running:

- **Frontend**: Open http://localhost:3001 in your browser
- **Backend API**: Accessible at http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (if running)
- **API Documentation**: http://localhost:3000/api (if Swagger is configured)

### Default Login Credentials

After setting up the database, you'll need to create users. Use Prisma Studio or run SQL commands to create initial admin user:

```sql
-- Create admin user (run in psql or Prisma Studio)
INSERT INTO "User" (id, name, email, role, "isActive", department, "isFacultyAdvisor", "createdAt")
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@university.edu',
  'ADMIN',
  true,
  'Administration',
  false,
  NOW()
);
```

Then log in using OTP authentication with the registered email.


## 🗄 Database Schema

The application uses PostgreSQL with Prisma ORM. Below is an overview of the main database models:

### Core Models

#### User
Represents all system users (Students, Instructors, Admins)
- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address (used for authentication)
- `role`: ADMIN | STUDENT | INSTRUCTOR
- `isActive`: Account status
- `entryNumber`: Unique student entry number (students only)
- `department`: Department affiliation (required for instructors)
- `isFacultyAdvisor`: Faculty advisor flag
- `createdAt`: Account creation timestamp

#### Course
Course catalog entries
- `id`: UUID primary key
- `code`: Unique course code (e.g., CS101)
- `name`: Course name
- `credits`: Number of credits
- `ltpsc`: Lecture-Tutorial-Practical-Self Study-Credit structure (e.g., "3-0-0-3")
- `description`: Detailed course description

#### CourseOffering
Specific instances of courses offered in semesters
- `id`: UUID primary key
- `courseId`: Reference to Course
- `instructorId`: Reference to instructor User
- `semester`: Semester identifier (e.g., "Spring 2026")
- `timeSlot`: Class schedule
- `allowedBranches`: Array of branch codes that can enroll
- `status`: PENDING | ENROLLING | REJECTED | WITHDRAWN | COMPLETED
- `approvedAt`: Admin approval timestamp

#### Enrollment
Student course enrollments
- `id`: UUID primary key
- `studentId`: Reference to student User
- `courseOfferingId`: Reference to CourseOffering
- `status`: PENDING_INSTRUCTOR | PENDING_ADVISOR | ENROLLED | REJECTED | DROPPED | AUDIT | COMPLETED
- `enrollmentType`: CREDIT | CREDIT_CONCENTRATION | CREDIT_MINOR
- `advisorId`: Reference to faculty advisor (if required)
- `grade`: A | A_MINUS | B | B_MINUS | C | C_MINUS | D | E | F
- `source`: STUDENT_REQUEST | INSTRUCTOR_ASSIGNED
- `completedAt`: Completion timestamp

#### EnrollmentTrigger
Automated batch enrollment rules
- `id`: UUID primary key
- `courseOfferingId`: Reference to CourseOffering
- `branchCode`: Branch code for auto-enrollment (e.g., "CSB")
- `batchYear`: Student batch year (e.g., 2023)
- `enrollmentType`: Type of enrollment
- `instructorId`: Instructor who created the trigger

#### AcademicCalendar
Semester schedules and deadlines
- `semesterName`: Semester identifier
- `semesterStartDate`: Semester start date
- `semesterEndDate`: Semester end date
- `enrollmentStart`: Enrollment period start
- `enrollmentEnd`: Enrollment period end
- `dropDeadline`: Last date to drop courses
- `auditDeadline`: Last date to convert to audit

#### CourseProposal
New course proposals from instructors
- `id`: UUID primary key
- `instructorId`: Proposing instructor
- `code`: Proposed course code
- `name`: Proposed course name
- `credits`: Number of credits
- `ltpsc`: LTPSC structure
- `description`: Course description
- `status`: PENDING | APPROVED | REJECTED
- `courseId`: Linked Course (after approval)

#### FeedbackForm
Course feedback form creation
- `id`: UUID primary key
- `courseOfferingId`: Associated course offering
- `instructorId`: Form creator
- `title`: Form title
- `description`: Form description
- `isOpen`: Form availability status
- `closedAt`: Form closure timestamp

#### CourseFeedback
Student feedback responses
- `id`: UUID primary key
- `feedbackFormId`: Reference to FeedbackForm
- `studentId`: Student providing feedback
- `ratingContent`: Content rating (1-5)
- `ratingTeaching`: Teaching rating (1-5)
- `ratingEvaluation`: Evaluation rating (1-5)
- `ratingOverall`: Overall rating (1-5)
- `comments`: Optional text feedback

#### OtpToken
One-time password tokens for authentication
- `id`: UUID primary key
- `userId`: Reference to User
- `otpHash`: Bcrypt hashed OTP
- `expiresAt`: Token expiration timestamp

### Enrollment Status Flow

```
STUDENT REQUEST:
Student Request → PENDING_INSTRUCTOR → ENROLLED → COMPLETED
                      ↓
                  REJECTED

WITH ADVISOR:
Student Request → PENDING_ADVISOR → PENDING_INSTRUCTOR → ENROLLED → COMPLETED
                      ↓                    ↓
                  REJECTED            REJECTED

COURSE CHANGES:
ENROLLED → DROPPED (before drop deadline)
ENROLLED → AUDIT (before audit deadline)

COMPLETION:
ENROLLED → COMPLETED (when grade is assigned)
AUDIT → COMPLETED (when course ends)
```

### Grade Point System

| Grade | Points | Description |
|-------|--------|-------------|
| A     | 10     | Excellent   |
| A-    | 9      | Very Good   |
| B     | 8      | Good        |
| B-    | 7      | Above Average |
| C     | 6      | Average     |
| C-    | 5      | Below Average |
| D     | 4      | Marginal    |
| E     | 2      | Poor        |
| F     | 0      | Fail        |

### Database Migrations

View all migrations in `/backend/prisma/migrations/`

Key migration features:
- Initial schema setup
- Course and offerings
- Enrollment system with triggers
- Grade management
- Feedback system
- Academic calendar
- Course proposals
- Faculty advisor assignments

To run migrations:
```bash
cd backend
npx prisma migrate dev
```

To view database in GUI:
```bash
npx prisma studio
```


## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com/api
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

#### Authentication Endpoints

**Request Login OTP**
```http
POST /auth/request-login
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP sent to email"
}
```

**Verify OTP and Login**
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT"
  }
}
```

**Get Current User Profile**
```http
GET /auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "role": "STUDENT",
  "entryNumber": "2023CSB1234",
  "department": "Computer Science"
}
```

### Admin Endpoints

**Get All Courses**
```http
GET /courses
Authorization: Bearer <admin_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Programming",
    "credits": 4,
    "ltpsc": "3-0-2-4",
    "description": "..."
  }
]
```

**Create Course**
```http
POST /courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "CS201",
  "name": "Data Structures",
  "credits": 4,
  "ltpsc": "3-1-0-4",
  "description": "..."
}

Response: 201 Created
```

**Get Pending Course Offerings**
```http
GET /admin/course-offerings?status=PENDING
Authorization: Bearer <admin_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "course": { "code": "CS101", "name": "..." },
    "instructor": { "name": "Dr. Smith" },
    "semester": "Spring 2026",
    "status": "PENDING"
  }
]
```

**Approve Course Offering**
```http
PATCH /admin/course-offerings/:id/approve
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "message": "Course offering approved",
  "offering": { ... }
}
```

**Reject Course Offering**
```http
PATCH /admin/course-offerings/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Insufficient demand"
}

Response: 200 OK
```

**Get/Set Academic Calendar**
```http
GET /admin/academic-calendar
POST /admin/academic-calendar
Authorization: Bearer <admin_token>

Body:
{
  "semesterName": "Spring 2026",
  "semesterStartDate": "2026-01-15",
  "semesterEndDate": "2026-05-15",
  "enrollmentStart": "2026-01-01",
  "enrollmentEnd": "2026-01-20",
  "dropDeadline": "2026-02-15",
  "auditDeadline": "2026-03-01"
}
```

**Get Student Transcript**
```http
GET /admin/transcript/:studentId
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "student": { "name": "...", "entryNumber": "..." },
  "semesters": [
    {
      "semester": "Fall 2025",
      "courses": [...],
      "sgpa": 8.5,
      "creditsEarned": 18
    }
  ],
  "cgpa": 8.3,
  "totalCredits": 72
}
```

**Course Proposals Management**
```http
GET /admin/course-proposals?status=PENDING
PATCH /admin/course-proposals/:id/approve
PATCH /admin/course-proposals/:id/reject
```

### Instructor Endpoints

**Create Course Offering**
```http
POST /instructor/course-offerings
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "courseId": "uuid",
  "semester": "Spring 2026",
  "timeSlot": "Mon-Wed 10:00-11:30",
  "allowedBranches": ["CSB", "ECE", "MEB"]
}

Response: 201 Created
```

**Get My Course Offerings**
```http
GET /instructor/course-offerings
Authorization: Bearer <instructor_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "course": { ... },
    "semester": "Spring 2026",
    "status": "ENROLLING",
    "enrollmentCount": 45
  }
]
```

**Get Pending Enrollments**
```http
GET /instructor/enrollments/pending?offeringId=uuid
Authorization: Bearer <instructor_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "student": { "name": "...", "entryNumber": "..." },
    "enrollmentType": "CREDIT",
    "status": "PENDING_INSTRUCTOR"
  }
]
```

**Approve Enrollment**
```http
PATCH /instructor/enrollments/:id/approve
Authorization: Bearer <instructor_token>

Response: 200 OK
```

**Reject Enrollment**
```http
PATCH /instructor/enrollments/:id/reject
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "reason": "Course is full"
}
```

**Batch Enroll Students**
```http
POST /instructor/enrollments/trigger
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "courseOfferingId": "uuid",
  "branchCode": "CSB",
  "batchYear": 2023,
  "enrollmentType": "CREDIT"
}

Response: 201 Created
{
  "message": "Batch enrollment created",
  "enrolledCount": 45
}
```

**Upload Grades**
```http
POST /instructor/course-offerings/:id/grades
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "grades": [
    {
      "enrollmentId": "uuid",
      "grade": "A"
    },
    {
      "enrollmentId": "uuid",
      "grade": "B_MINUS"
    }
  ]
}

Response: 200 OK
```

**Get Enrolled Students**
```http
GET /instructor/students?offeringId=uuid
Authorization: Bearer <instructor_token>

Response: 200 OK
[
  {
    "enrollment": { ... },
    "student": { ... },
    "grade": "A",
    "status": "COMPLETED"
  }
]
```

**Create Feedback Form**
```http
POST /instructor/feedback-forms
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "courseOfferingId": "uuid",
  "title": "Course Feedback - CS101",
  "description": "Please provide your feedback"
}

Response: 201 Created
```

**Propose New Course**
```http
POST /instructor/course-proposals
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "code": "CS301",
  "name": "Advanced Algorithms",
  "credits": 4,
  "ltpsc": "3-0-0-4",
  "description": "..."
}
```

### Student Endpoints

**Browse Course Offerings**
```http
GET /student/course-offerings?semester=Spring%202026
Authorization: Bearer <student_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "course": { "code": "CS101", "name": "..." },
    "instructor": { "name": "Dr. Smith" },
    "timeSlot": "Mon-Wed 10:00-11:30",
    "availableSeats": 20
  }
]
```

**Request Enrollment**
```http
POST /student/enrollments
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "courseOfferingId": "uuid",
  "enrollmentType": "CREDIT"
}

Response: 201 Created
{
  "message": "Enrollment request submitted",
  "enrollment": { ... }
}
```

**Get My Enrollments**
```http
GET /student/enrollments?semester=Spring%202026
Authorization: Bearer <student_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "courseOffering": { ... },
    "status": "ENROLLED",
    "enrollmentType": "CREDIT",
    "grade": null
  }
]
```

**Drop Enrollment**
```http
DELETE /student/enrollments/:id/drop
Authorization: Bearer <student_token>

Response: 200 OK
{
  "message": "Course dropped successfully"
}
```

**Convert to Audit**
```http
PATCH /student/enrollments/:id/audit
Authorization: Bearer <student_token>

Response: 200 OK
{
  "message": "Enrollment converted to audit"
}
```

**Get Academic Record**
```http
GET /student/record
Authorization: Bearer <student_token>

Response: 200 OK
{
  "semesters": [
    {
      "semester": "Fall 2025",
      "enrollments": [...],
      "sgpa": 8.5,
      "credits": 18
    }
  ],
  "cgpa": 8.3,
  "totalCredits": 72
}
```

**Submit Course Feedback**
```http
POST /student/feedback
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "feedbackFormId": "uuid",
  "ratingContent": 4,
  "ratingTeaching": 5,
  "ratingEvaluation": 4,
  "ratingOverall": 4,
  "comments": "Great course!"
}

Response: 201 Created
```

### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": ["Validation error message"],
  "error": "Bad Request"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 👥 User Roles & Permissions

### Role Hierarchy

```
ADMIN (Highest Privileges)
├── Full system access
├── User management
├── Course catalog management
├── Course offering approvals
└── System configuration

INSTRUCTOR (Medium Privileges)
├── Create course offerings
├── Manage enrollments
├── Grade students
├── Create feedback forms
└── View student records

STUDENT (Basic Privileges)
├── Browse course offerings
├── Request enrollments
├── View own records
├── Submit feedback
└── Manage own enrollments
```

### Permission Matrix

| Feature | Admin | Instructor | Student |
|---------|-------|------------|---------|
| View All Courses | ✅ | ✅ | ✅ |
| Create/Edit Courses | ✅ | ❌ | ❌ |
| Propose New Course | ❌ | ✅ | ❌ |
| Create Course Offering | ❌ | ✅ | ❌ |
| Approve Course Offerings | ✅ | ❌ | ❌ |
| Request Enrollment | ❌ | ❌ | ✅ |
| Approve Enrollments | ❌ | ✅ | ❌ |
| Batch Enroll Students | ❌ | ✅ | ❌ |
| Upload Grades | ❌ | ✅ | ❌ |
| View Own Grades | ❌ | ❌ | ✅ |
| Create Feedback Forms | ❌ | ✅ | ❌ |
| Submit Feedback | ❌ | ❌ | ✅ |
| View All Transcripts | ✅ | ❌ | ❌ |
| View Own Transcript | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Academic Calendar | ✅ | View Only | View Only |
| Drop/Audit Courses | ❌ | ❌ | ✅ |

### Faculty Advisor Permissions

Instructors with `isFacultyAdvisor = true` get additional permissions:
- View advisee list
- Approve advisee enrollment requests (for PENDING_ADVISOR status)
- Monitor advisee academic progress
- Access advisee transcripts


## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Problem**: `Error: Can't reach database server`

**Solutions**:
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for PostgreSQL service

# Linux/Mac:
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
# Make sure credentials match your PostgreSQL setup

# Test connection
psql -U postgres -d academic_management

# If database doesn't exist, create it
createdb academic_management
```

#### 2. Prisma Migration Errors

**Problem**: `Migration failed` or schema out of sync

**Solutions**:
```bash
cd backend

# Option 1: Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Option 2: Generate Prisma client only
npx prisma generate

# Option 3: Push schema without migration
npx prisma db push

# Option 4: Create new migration
npx prisma migrate dev --name fix_schema

# Verify migrations
npx prisma migrate status
```

#### 3. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Windows - Find process using port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in backend/src/main.ts
await app.listen(3001);  // Use different port

# For frontend, use different port
npm run dev -- -p 3002
```

#### 4. Module Not Found Errors

**Problem**: `Cannot find module '@nestjs/...'` or `Module not found: next/...`

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm clean install
npm ci

# For specific module issues
npm install @nestjs/common @nestjs/core

# Check Node.js version
node --version  # Should be v18+
```

#### 5. JWT Token Errors

**Problem**: `JsonWebTokenError: invalid token` or `TokenExpiredError`

**Solutions**:
- Clear browser localStorage/cookies
- Logout and login again
- Verify JWT_SECRET is set in backend/.env
- Check token expiration in JWT_EXPIRES_IN (default: 86400 seconds)
- Ensure frontend is sending token in Authorization header

#### 6. Email/OTP Not Working

**Problem**: OTP emails not being sent

**Solutions**:
```bash
# For Gmail:
# 1. Enable 2-Factor Authentication
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Use app password in MAIL_PASSWORD

# Verify email configuration in backend/.env
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-16-char-app-password"

# Test email service
# Check backend logs for email errors
npm run start:dev
```

#### 7. CORS Errors

**Problem**: `Access-Control-Allow-Origin` errors in browser console

**Solutions**:
```typescript
// Verify CORS settings in backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3001',  // Frontend URL
  credentials: true,
});

// Or allow all origins for development (not for production)
app.enableCors();
```

#### 8. Prisma Client Not Generated

**Problem**: `@prisma/client did not initialize yet`

**Solutions**:
```bash
cd backend

# Generate Prisma client
npx prisma generate

# If still failing, reinstall Prisma
npm uninstall @prisma/client prisma
npm install @prisma/client prisma

# Regenerate
npx prisma generate
```

#### 9. Frontend Build Errors

**Problem**: Build fails with TypeScript or linting errors

**Solutions**:
```bash
cd frontend

# Check for TypeScript errors
npm run build

# Fix linting issues
npm run lint -- --fix

# Clear Next.js cache
rm -rf .next
npm run dev

# Update dependencies
npm update
```

#### 10. Enrollment Not Working

**Problem**: Cannot enroll in courses or enrollment stuck

**Solutions**:
- Check if Academic Calendar is configured (Admin panel)
- Verify enrollment period dates (must be within enrollment window)
- Check course offering status (should be ENROLLING, not PENDING)
- Verify student's branch is in allowedBranches
- Check if course capacity is full

#### 11. Grades Not Displaying

**Problem**: Grades not showing up for students

**Solutions**:
- Verify enrollment status is COMPLETED
- Check if grade was assigned by instructor
- Ensure enrollment is not DROPPED or AUDIT
- Verify database has grade value (use Prisma Studio)

#### 12. Development Server Hot Reload Issues

**Problem**: Changes not reflecting in browser

**Solutions**:
```bash
# Backend - restart with clean build
cd backend
rm -rf dist
npm run start:dev

# Frontend - clear cache
cd frontend
rm -rf .next
npm run dev

# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Debug Mode

#### Enable Debug Logging - Backend
```typescript
// backend/src/main.ts
const logger = new Logger('Bootstrap');
logger.log('Application is starting...');

// Use NestJS built-in logger
import { Logger } from '@nestjs/common';
private readonly logger = new Logger(ClassName.name);
this.logger.debug('Debug message');
```

#### Enable Debug Logging - Frontend
```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG=true

// Use in components
if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
  console.log('Debug info:', data);
}
```

### Database Debugging

**Prisma Studio** - Visual database editor
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

**Direct SQL Queries**
```bash
# Connect to database
psql -U postgres -d academic_management

# Useful queries
SELECT * FROM "User" WHERE role = 'ADMIN';
SELECT * FROM "Enrollment" WHERE status = 'PENDING_INSTRUCTOR';
SELECT * FROM "CourseOffering" WHERE status = 'ENROLLING';

# Check table structure
\d "User"
\d "Enrollment"
```

### Getting Help

If you're still experiencing issues:

1. **Check Logs**
   - Backend: Terminal running `npm run start:dev`
   - Frontend: Browser console (F12)
   - Database: PostgreSQL logs

2. **Verify Configuration**
   - `.env` files are properly configured
   - All environment variables are set
   - Ports are not conflicting

3. **Common Commands**
   ```bash
   # Backend health check
   curl http://localhost:3000/

   # Database connection test
   psql -U postgres -d academic_management -c "SELECT NOW();"

   # Clear everything and restart
   cd backend && rm -rf node_modules dist && npm install
   cd ../frontend && rm -rf node_modules .next && npm install
   ```

4. **Update Dependencies**
   ```bash
   # Check for outdated packages
   npm outdated

   # Update all packages
   npm update

   # For major version updates
   npm install package@latest
   ```

## 🤝 Contributing

We welcome contributions to the Academic Management System! Here's how you can help:

### Development Workflow

1. **Fork the Repository**
   ```bash
   # Click 'Fork' on GitHub, then clone your fork
   git clone https://github.com/your-username/academic-management-system.git
   cd academic-management-system
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-fix
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend
   npm run test
   npm run test:e2e

   # Frontend tests
   cd frontend
   npm run build  # Ensure build works
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   
   # Follow conventional commit format:
   # feat: new feature
   # fix: bug fix
   # docs: documentation
   # style: formatting
   # refactor: code restructuring
   # test: adding tests
   # chore: maintenance
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create Pull Request**
   - Go to original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes
   - Submit for review

### Code Style Guidelines

#### TypeScript/JavaScript
```typescript
// Use meaningful variable names
const studentEnrollments = await this.getEnrollments();

// Add JSDoc comments for functions
/**
 * Retrieves all enrollments for a student
 * @param studentId - The student's unique identifier
 * @returns Promise resolving to array of enrollments
 */
async getEnrollments(studentId: string): Promise<Enrollment[]> {
  // Implementation
}

// Use async/await instead of callbacks
// Prefer const over let
// Use TypeScript types
```

#### Backend (NestJS)
- Use dependency injection
- Follow module-based architecture
- Use DTOs for validation
- Implement proper error handling
- Use Guards for authorization

#### Frontend (Next.js)
- Use functional components with hooks
- Implement proper loading and error states
- Follow component composition
- Use TypeScript interfaces
- Optimize for performance

### Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Test coverage
npm run test:cov

# Frontend build test
cd frontend
npm run build
```

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what and why
- **Screenshots**: For UI changes
- **Tests**: Ensure all tests pass
- **Documentation**: Update README if needed
- **Breaking Changes**: Clearly document

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Internationalization
- ⚡ Performance optimizations
- 🧪 Test coverage
- 🔒 Security enhancements

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2026 Academic Management System Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support & Contact

### Documentation
- **Setup Guide**: See [SETUP_REQUIREMENTS.md](SETUP_REQUIREMENTS.md)
- **API Docs**: Available at `/api` endpoint when running backend
- **Database Schema**: Use `npx prisma studio` to visualize

### Getting Help
- 🐛 Report bugs via GitHub Issues
- 💡 Request features via GitHub Issues
- 📧 Contact: Ashutosh Rajput - [2023csb1289@iitrpr.ac.in](mailto:2023csb1289@iitrpr.ac.in)

### Project Links
- 🌐 Repository: https://github.com/yourusername/academic-management-system
- 📋 Issues: https://github.com/yourusername/academic-management-system/issues
- 🔀 Pull Requests: https://github.com/yourusername/academic-management-system/pulls



**Made with ❤️ for educational institutions**

*Last Updated: January 27, 2026*
