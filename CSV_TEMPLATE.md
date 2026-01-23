# CSV Upload Format for User Management

## Overview
The CSV upload feature allows bulk creation of users (Students, Instructors, and Admins) in a single operation.

## Required CSV Format

Your CSV file **must contain the following columns in this order:**

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| name | ✅ Yes | User's full name | John Doe |
| email | ✅ Yes | User's email address | john@university.edu |
| role | ✅ Yes | User role: STUDENT, INSTRUCTOR, or ADMIN | STUDENT |
| entryNumber | ⚠️ Conditional | Entry number (required only for STUDENT role) | 2023CSB1289 |
| department | ⚠️ Conditional | Department name (required only for INSTRUCTOR role) | Computer Science |

## Sample CSV File

```csv
name,email,role,entryNumber,department
John Doe,john@university.edu,STUDENT,2023CSB1289,
Jane Smith,jane@university.edu,INSTRUCTOR,,Computer Science
Alice Johnson,alice@university.edu,STUDENT,2023ECE0521,
Bob Wilson,bob@university.edu,INSTRUCTOR,,Electrical Engineering
Admin User,admin@university.edu,ADMIN,,
```

## Important Rules

1. **Column Names (Headers)**: Must be lowercase and in exact format:
   - `name`
   - `email`
   - `role`
   - `entryNumber`
   - `department`

2. **Role Values**: Must be exactly one of:
   - `STUDENT`
   - `INSTRUCTOR`
   - `ADMIN`

3. **Entry Number Requirements**:
   - **Required for STUDENT**: Leave empty for other roles
   - Format: Typically YYYYXXXNNN (e.g., 2023CSB1289)
   - Must be unique per student

4. **Department Requirements**:
   - **Required for INSTRUCTOR**: Leave empty for other roles
   - Provide the department name (e.g., "Computer Science", "Mathematics")

5. **Email**: Must be unique across the system. Duplicate emails will fail.

6. **File Format**: Must be a valid `.csv` file (comma-separated values)

## Upload Response

After successful upload, you'll see:
- ✅ **createdCount**: Number of users successfully created
- ❌ **failedCount**: Number of users that failed
- ⚠️ **errors**: List of errors (up to first 10)

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing required fields | name, email, or role not provided | Add all three columns and ensure they're filled |
| Invalid role | Role is not STUDENT, INSTRUCTOR, or ADMIN | Use exact case: STUDENT, INSTRUCTOR, ADMIN |
| Entry number required for students | A student row missing entryNumber | Add entryNumber for all STUDENT rows |
| Department required for instructors | An instructor row missing department | Add department for all INSTRUCTOR rows |
| Email already exists | Duplicate email in system | Change the email to a unique value |
| Entry number already exists | Duplicate entry number in system | Change the entry number to a unique value |

## Example Valid CSV

**For Students:**
```csv
name,email,role,entryNumber,department
Priya Sharma,priya@college.edu,STUDENT,2023CSB0001,
Rahul Kumar,rahul@college.edu,STUDENT,2023CSB0002,
```

**For Instructors:**
```csv
name,email,role,entryNumber,department
Dr. Amit Patel,amit@college.edu,INSTRUCTOR,,Computer Science
Prof. Neha Singh,neha@college.edu,INSTRUCTOR,,Mathematics
```

**Mixed:**
```csv
name,email,role,entryNumber,department
John Doe,john@college.edu,STUDENT,2023CSB0001,
Jane Smith,jane@college.edu,INSTRUCTOR,,Computer Science
Admin,admin@college.edu,ADMIN,,
```

## Tips for Success

✅ Use a spreadsheet application (Excel, Google Sheets) to create CSV files
✅ Always include the header row
✅ Double-check email addresses for typos
✅ Ensure entry numbers are in correct format
✅ Use a CSV validator tool before uploading if you're unsure
✅ Export from Excel as "CSV (Comma delimited)" format

## Troubleshooting

**Issue**: "CSV must contain columns: name, email, role"
- **Solution**: Ensure these three columns are present and have exact spelling (lowercase)

**Issue**: "Entry number required for students"
- **Solution**: All rows with role=STUDENT must have an entryNumber value

**Issue**: "Email or entry number already exists"
- **Solution**: Check your CSV for duplicate emails/entry numbers, or check if these users already exist in the system
