# Core Feature: Master Student List & Bulk Upload

This system includes a robust **Student Management Module** designed for Faculty and Admins.

## Features Implemented

### 1. Bulk CSV Upload
*   **API:** `POST /api/students/upload`
*   **Functionality:**
    *   Parses CSV files (Excel/Google Sheets compatible).
    *   **Robust Header Detection:** Accepts `Enrollment No`, `enrollment_no`, `enrollment`, etc.
    *   **Auto-Sanitization:** Trims spaces and handles case-sensitivity issues in emails.
    *   **Automatic Account Creation:** If a student does not have a login, the system **automatically creates a User Account** (Default Password: `123456`) and links it.

### 2. Manual "Add Student"
*   **API:** `POST /api/students/add`
*   **Functionality:**
    *   Allows adding a single student via a form.
    *   Instantly grants login access.

### 3. Student Directory & Search
*   **API:** `GET /api/students?q=...`
*   **Functionality:**
    *   Real-time search by Name or Enrollment Number.
    *   Filters for Department and Semester.
    *   **Delete Functionality:** Removes both the Student Profile and the User Account.

## Usage Guide (Faculty)

1.  **Navigate:** Go to `Student List` in the Sidebar.
2.  **Bulk Upload:**
    *   Click "Bulk Upload".
    *   Select `students.csv`.
    *   Verify the Preview Table.
    *   Click "Upload".
3.  **Manual Add:**
    *   Click "+ Add Student".
    *   Fill details and click "Create Account".
4.  **Delete:**
    *   Find a student in the Directory list.
    *   Click "Delete" and confirm.

## CSV Format Reference
```csv
enrollment,name,department,semester,email
KSV001,Amit Patel,Computer Engineering,5,amit@ksv.ac.in
KSV002,Priya Shah,IT,5,priya@ksv.ac.in
```
