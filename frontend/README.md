# IIT Ropar Academic Management System

A comprehensive, role-based academic management portal built with **Next.js 16**, **Material-UI (MUI)**, and **TypeScript**. The system features a professional light interface with IIT Ropar's signature maroon and gold color scheme, along with transparent geometric design elements.

## 🎨 Design & Branding

### Color Palette
- **Primary (Maroon)**: #8B3A3A - IIT Ropar brand color
- **Secondary (Gold)**: #D4A574 - IIT Ropar accent color
- **Background**: #f8f7f5 (Light warm cream)
- **Sidebar**: #1a1a1a (Professional black)
- **Text**: #1a1a1a (Dark gray) / #555555 (Body text)

### Visual Elements
- Light background with subtle transparent radial gradients
- Black fixed sidebar (280px width)
- Diagonal line pattern overlay at 6% opacity
- Clean, professional Material-UI components
- Responsive design for mobile, tablet, and desktop

## 🔐 Authentication

### OTP-Based Login Flow
1. **Step 1**: Enter email address
2. **Step 2**: Enter 6-digit OTP sent to email
3. **Step 3**: Automatic role-based redirect to dashboard

### Demo Credentials
```
Admin: admin@iitropar.ac.in | OTP: 123456
Instructor: instructor@iitropar.ac.in | OTP: 123456
Student: student@iitropar.ac.in | OTP: 123456
```

## 👥 User Roles & Dashboards

### 1. Admin Dashboard (`/admin/dashboard`)
**Features:**
- System-wide statistics (users, courses, pending approvals, active semesters)
- Academic calendar with enrollment deadlines and countdowns
- Quick action cards for user/course creation and transcript lookup
- Pending course offering approvals management
- Course offering approval/rejection interface

**Mock Data Included:**
- Total Users: 342
- Total Courses: 127
- Pending Approvals: 5
- Active Semesters: 2
- Academic Calendar: Odd 2024

### 2. Instructor Dashboard (`/instructor/dashboard`)
**Features:**
- Course offering statistics
- Total students enrolled across courses
- Pending enrollment requests counter
- Active feedback forms
- My course offerings with enrollment counts
- Pending enrollment requests table with approve/reject actions
- Request new course offering button

**Mock Data Included:**
- 3 Course offerings (2 approved, 1 pending)
- 83 total students
- 2 pending enrollment requests
- Courses: Data Structures, Algorithms, Database Design

### 3. Student Dashboard (`/student/dashboard`)
**Features:**
- Academic statistics (CGPA, semester GPA, credits earned, enrollments)
- Current enrollments table with grades and drop/audit options
- Available course offerings for enrollment
- Quick links (Transcript, Feedback, Academic Record, Course Catalog)

**Mock Data Included:**
- CGPA: 3.85
- Semester GPA: 3.9
- Credits Earned: 45
- Current Enrollments: 3 courses
- Available Courses: 2 courses

## 🏗️ Project Structure

```
/app
├── /admin
│   └── /dashboard
│       └── page.tsx
├── /instructor
│   └── /dashboard
│       └── page.tsx
├── /student
│   └── /dashboard
│       └── page.tsx
├── /profile
│   └── page.tsx
├── /unauthorized
│   └── page.tsx
├── /login
│   └── page.tsx
├── page.tsx (Landing)
├── layout.tsx
└── globals.css

/lib
├── /api
│   └── axiosClient.ts
├── /auth
│   └── AuthContext.tsx
├── /routes
│   └── ProtectedRoute.tsx
├── /theme
│   └── ThemeProvider.tsx
├── /types
│   └── index.ts
└── /utils
    └── academicUtils.ts

/components
├── /layout
│   ├── Sidebar.tsx (Fixed black sidebar with navigation)
│   ├── Topbar.tsx (White sticky header)
│   └── DashboardLayout.tsx (Main layout wrapper)
└── /ui
    ├── StatCard.tsx (Statistics display card)
    ├── StatusChip.tsx (Status badge component)
    ├── ConfirmDialog.tsx (Confirmation modal)
    └── LoadingSkeleton.tsx (Skeleton loaders)
```

## 🎯 Key Features

### 1. Authentication System
- Email-based OTP login
- JWT token management
- Role-based access control (RBAC)
- Auto-logout on unauthorized access
- Protected route wrapper

### 2. Layout & Navigation
- **Fixed Sidebar**: Black sidebar with role-based menu items
- **Sticky Topbar**: White header with user profile dropdown and page title
- **Responsive**: Mobile-friendly hamburger menu
- **IIT Themed**: Watermark and transparent geometric patterns

### 3. Components & UI
- Material-UI components with custom theming
- Stat cards with icons and progress indicators
- Status chips for various states (PENDING, APPROVED, ACTIVE, etc.)
- Loading skeletons for async data
- Confirmation dialogs for critical actions
- Tables with role-based actions

### 4. Mock Data
All dashboards are pre-populated with comprehensive mock data for immediate preview:
- Realistic course names and codes
- Accurate academic metrics
- Sample enrollment data
- Pending approvals and requests

### 5. Academic Utilities
- Deadline countdown calculations
- Credit validation (12-24 per semester)
- Branch extraction from entry numbers
- Date formatting with dayjs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Next.js 16 requirement)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Navigation
- Landing page redirects to login
- Use demo credentials to test each role
- Each role sees their respective dashboard
- Navigation menu updates based on user role

## 🔌 Integration Points

All API calls are currently mocked but ready for backend integration:

### Authentication
- `POST /auth/request-otp` - Request OTP for email
- `POST /auth/verify-otp` - Verify OTP and login

### Admin APIs
- `GET /admin/stats` - System statistics
- `GET /admin/calendar` - Academic calendar
- `GET /admin/pending-offerings` - Pending course approvals
- `POST /admin/approve-offering` - Approve course offering
- `POST /admin/reject-offering` - Reject course offering

### Instructor APIs
- `GET /instructor/offerings` - My course offerings
- `GET /instructor/pending-enrollments` - Pending requests
- `POST /instructor/approve-enrollment` - Approve student
- `POST /instructor/reject-enrollment` - Reject student

### Student APIs
- `GET /student/enrollments` - My current enrollments
- `GET /student/available-offerings` - Available courses
- `POST /student/enroll` - Enroll in course
- `POST /student/drop` - Drop course
- `POST /student/audit` - Switch to audit

## 🎨 Theming

### Custom MUI Theme
- Primary color: #8B3A3A (Maroon)
- Secondary color: #D4A574 (Gold)
- Background: #f8f7f5 (Light cream)
- Typography: Inter font family
- Border radius: 8px components, 12px cards

### Transparent Design Elements
- Radial gradients at 3-4% opacity
- Diagonal line patterns at 1-6% opacity
- Smooth hover effects with shadow elevation

## 📱 Responsive Design

- **Mobile** (< 600px): Full-width layout, drawer sidebar
- **Tablet** (600-900px): 2-column grid layouts
- **Desktop** (> 900px): Full-featured 3-4 column layouts

## 🔒 Security Features

- Protected routes with role validation
- JWT token management
- OTP-based authentication
- Secure logout functionality
- Error boundary pages

## 📚 Component Documentation

### StatCard
Display metrics with optional progress bars and color coding.

### StatusChip
Status badges for enrollment types and approval states.

### LoadingSkeleton
Placeholder loaders for cards, tables, and grids during data fetch.

### ConfirmDialog
Customizable confirmation modals for critical actions.

## 🎯 Next Steps for Development

1. **Backend Integration**: Connect to actual API endpoints
2. **Database**: Implement database models and migrations
3. **Course Management**: Add course creation and editing
4. **Grade Management**: Grade entry and transcript generation
5. **Batch Operations**: Batch enrollment and result uploads
6. **Email Notifications**: Real OTP and notification system
7. **Audit Trail**: Logging system for all actions
8. **Analytics**: Dashboard analytics and reports

## 📄 License

IIT Ropar Academic Management System - All Rights Reserved

---

**Built with** ❤️ using Next.js, Material-UI, and TypeScript
