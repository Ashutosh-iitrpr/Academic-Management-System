# Academic Management System

A comprehensive web-based platform for managing academic processes including course offerings, student enrollments, grade management, and academic records.

## Description

A full-stack application built with **NestJS** (backend) and **Next.js** (frontend) to streamline academic operations for administrators, instructors, and students.

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Nodemailer** - Email notifications

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client

## Features

### For Administrators
- **Course Management**: Create, edit, and manage courses
- **Course Offering Approvals**: Review and approve instructor course offering requests
- **Academic Calendar**: Set enrollment periods, drop/audit deadlines
- **User Management**: Manage student and instructor accounts
- **Transcript Generation**: View and generate student transcripts

### For Instructors
- **Course Offerings**: Request to teach courses for specific semesters
- **Enrollment Management**: 
  - Approve/reject student enrollment requests
  - Batch enroll students by branch and year
  - View all enrollments by status (Enrolled, Audit, Dropped)
- **Grade Management**: Upload and update grades for enrolled students
- **Feedback Forms**: Create and manage course feedback forms

### For Students
- **Course Browsing**: View available course offerings with filters
- **Enrollment Requests**: Request enrollment in courses
- **Enrollment Management**: Drop or audit courses within deadlines
- **Academic Record**: View semester-wise performance and GPA
- **Course Feedback**: Provide feedback for completed courses

## System Architecture

```
academic-management-system/
├── backend/                 # NestJS backend
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── constants/      # Constants
│   │   └── utils/          # Helper functions
│   └── dist/               # Compiled output
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── admin/         # Admin pages
│   │   ├── instructor/    # Instructor pages
│   │   └── student/       # Student pages
│   ├── components/        # Reusable components
│   ├── lib/               # API clients, utilities
│   └── public/            # Static assets
└── README.md
```

## Project Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with backend API URL

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/academic_management"
JWT_SECRET="your-secret-key"
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="your-email@example.com"
MAIL_PASSWORD="your-password"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3001
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Database Schema

Key models:
- **User**: Students, Instructors, and Admins
- **Course**: Course catalog with code, name, and credits
- **CourseOffering**: Specific course instances per semester
- **Enrollment**: Student course enrollments with grades
- **EnrollmentTrigger**: Batch enrollment automation
- **AcademicCalendar**: Semester dates and deadlines
- **FeedbackForm**: Course feedback collection
- **CourseFeedback**: Student feedback responses

### Enrollment Statuses
- `PENDING_INSTRUCTOR` - Awaiting instructor approval
- `ENROLLED` - Active enrollment for credit
- `AUDIT` - Auditing the course
- `DROPPED` - Student dropped the course
- `REJECTED` - Enrollment rejected by instructor
- `COMPLETED` - Course completed with grade

### Grade Scale
- **A** (10 points) - Excellent
- **A-** (9 points)
- **B** (8 points)
- **B-** (7 points)
- **C** (6 points)
- **C-** (5 points)
- **D** (4 points)
- **E** (2 points)
- **F** (0 points)

## API Endpoints

### Authentication
- `POST /auth/request-login` - Request OTP for login
- `POST /auth/verify-otp` - Verify OTP and get JWT token

### Admin
- `GET /admin/course-offerings` - Get pending course offerings
- `PATCH /admin/course-offerings/:id/approve` - Approve offering
- `PATCH /admin/course-offerings/:id/reject` - Reject offering
- `GET /courses` - Get all courses
- `POST /courses` - Create new course

### Instructor
- `POST /instructor/course-offerings` - Request course offering
- `GET /instructor/enrollments/pending` - Get pending enrollments
- `PATCH /instructor/enrollments/:id/approve` - Approve enrollment
- `PATCH /instructor/enrollments/:id/reject` - Reject enrollment
- `POST /instructor/course-offerings/:id/grades` - Upload grades
- `POST /instructor/enrollments/trigger` - Batch enroll students

### Student
- `GET /student/course-offerings` - Browse available offerings
- `POST /student/enrollments` - Request enrollment
- `DELETE /student/enrollments/:id/drop` - Drop enrollment
- `PATCH /student/enrollments/:id/audit` - Convert to audit
- `GET /student/enrollments` - Get my enrollments
- `GET /student/record` - Get academic record

## Key Features Implementation

### Academic Calendar Integration
The system enforces enrollment periods and deadlines:
- Enrollment requests only allowed during enrollment period
- Drop deadline enforcement
- Audit conversion deadline enforcement

### Batch Enrollment
Instructors can enroll entire batches by:
- Branch code (e.g., CSB, ECE)
- Batch year (e.g., 2023)
- Enrollment type (Credit, Credit Concentration, Credit Minor)

### Grade Management
- Instructors can upload/update grades for enrolled and audit students
- Grades automatically mark enrollment as `COMPLETED`
- GPA calculation based on weighted credit hours

## Common Issues & Solutions

### Prisma Schema Changes
After merging changes to `schema.prisma`:
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run build
npm run start:dev
```

### Port Conflicts
If ports 3000 or 3001 are in use:
- Backend: Change port in `backend/src/main.ts`
- Frontend: Change port with `npm run dev -- -p 3002`

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb academic_management`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
