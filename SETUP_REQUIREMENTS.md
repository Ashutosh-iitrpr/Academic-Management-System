# Setup Requirements

Complete guide for setting up the Academic Management System development environment.

## System Prerequisites

### Required Software
- **Node.js** - v18.0.0 or higher (LTS recommended)
  - Download: https://nodejs.org/
  - Verify: `node --version`
- **npm** - v9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`
- **PostgreSQL** - v14 or higher
  - Download: https://www.postgresql.org/download/
  - Verify: `psql --version`
- **Git** - for version control
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional But Recommended
- **pgAdmin** - PostgreSQL GUI management tool
  - Download: https://www.pgadmin.org/
- **Postman** or **VS Code REST Client** - For API testing
- **VS Code** - Recommended code editor

## Step-by-Step Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Academic-Management-System-changesss
```

### 2. PostgreSQL Setup
```bash
# Start PostgreSQL service (if not already running)
# Windows: PostgreSQL runs as a service by default

# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE academic_management;

# Create user (optional, if needed)
CREATE USER academic_user WITH PASSWORD 'your_password';
ALTER ROLE academic_user SET client_encoding TO 'utf8';
ALTER ROLE academic_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE academic_user SET default_transaction_deferrable TO on;
ALTER ROLE academic_user SET timezone TO 'UTC';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE academic_management TO academic_user;

# Exit psql
\q
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
# Edit with your database credentials
cp .env.example .env

# Configure .env with:
# - DATABASE_URL
# - JWT_SECRET
# - Email credentials (MAIL_HOST, MAIL_PORT, etc.)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with initial data
npx prisma db seed

# Return to root
cd ..
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Configure .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Download PDF.js (REQUIRED)
# Visit: https://mozilla.github.io/pdf.js/getting_started/#download
# Extract the distribution and place in: frontend/public/pdfjs/
# Required files: build/pdf.js, build/pdf.worker.js

# Return to root
cd ..
```

### 5. Verify Installation

**Check Node.js/npm:**
```bash
node --version
npm --version
```

**Check PostgreSQL connection:**
```bash
psql -U postgres -d academic_management
\dt  # List tables (should show Prisma tables)
\q   # Exit
```

**Check backend dependencies:**
```bash
cd backend
npm list nest
```

**Check frontend dependencies:**
```bash
cd frontend
npm list next
```

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/academic_management"

# Authentication
JWT_SECRET="your-super-secret-key-min-32-chars"

# Email Service (configure based on your provider)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"
MAIL_FROM="noreply@academicmanagement.com"

# Optional: API Port (default 3000)
PORT=3000
```

### Frontend (.env.local)
```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optional: Frontend Port
# PORT=3001
```

## Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev
# Runs on http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Runs on http://localhost:3001

# Terminal 3 - (Optional) Prisma Studio
cd backend
npx prisma studio
# Runs on http://localhost:5555
```

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

## Common Setup Issues

### PostgreSQL Connection Refused
- Ensure PostgreSQL is running: `services.msc` (Windows)
- Verify DATABASE_URL in `.env` is correct
- Check credentials match PostgreSQL user

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### PDF.js Not Found
- Ensure `public/pdfjs/build/` folder exists in frontend
- Download latest PDF.js from: https://mozilla.github.io/pdf.js/getting_started/#download
- Extract files and place in `frontend/public/pdfjs/`

### Prisma Migration Issues
```bash
cd backend
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually resolve conflicts
npx prisma migrate dev --name <migration-name>
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

## Useful Commands

### Database
```bash
# Connect to database
psql -U postgres -d academic_management

# Backup database
pg_dump academic_management > backup.sql

# Restore database
psql academic_management < backup.sql
```

### Backend
```bash
# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend
```bash
# Build for production
npm run build

# Start production build
npm start

# Export static site
npm run export
```

## Next Steps

1. Verify all services are running
2. Create an admin user (see backend setup documentation)
3. Log in and configure academic calendar
4. Set up course offerings
5. Start managing enrollments

## Additional Resources

- NestJS Documentation: https://docs.nestjs.com/
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in console
3. Consult framework documentation
4. Create an issue in the repository
