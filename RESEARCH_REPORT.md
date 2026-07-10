# RESEARCH REPORT: KSV Smart Academic Monitoring System Codebase Survey
**Author:** Senior Engineering Researcher  
**Target:** Kadi Sarva Vishwavidyalaya (KSV), Gujarat  
**Date:** July 9, 2026  

---

## 1. Executive Summary

This report presents a thorough audit of the KSV Smart Academic Monitoring System codebase. The survey covers all backend controllers, routes, models, configuration files, and the React frontend dashboards. 

### Key Findings:
1. **Database Fallback Mechanics:** The application uses a clever connection fallback mechanism in [db.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/backend/config/db.js) that starts an in-memory database (`mongodb-memory-server`) if a local MongoDB service isn't active on port 27017. However, the initial auto-seeder was extremely minimal (1 student, 3 faculty, no interventions, medical leaves, or calendar events), which made the system appear empty or dysfunctional during local runs.
2. **Mock Data Prevalence:** While the database schemas are well-structured, several crucial dashboards rely on mock data. In the backend HOD controller, subject performance metrics are hardcoded. In the frontend, the Academic Planner, Goal Setting, and Assessment Difficulty pages depend entirely on hardcoded arrays or mathematical mock distributions.
3. **Product Requirement Document (PRD) Gaps:** There is a significant gap between the PRD specifications and the actual codebase. Key schemas described in the PRD (such as `AuditLog.js`, `Timetable.js`, `Assignment.js`, `Message.js`, and `Session.js`) are completely missing, and their corresponding dashboards utilize other logs or mock states.
4. **Upgraded Seeder:** We have successfully rewritten `backend/seeder.js` and updated the automatic seeder in `backend/config/db.js` to initialize the system with **25 students** (across CE, IT, and ME departments and Semesters 3 & 5), **5 faculty members**, **2 mentors**, **1 HOD**, **1 Admin**, 30 days of lecture attendance logs, marks across 3 subjects, interventions, medical leaves, achievements, and academic calendar events.

---

## 2. Mock Data Inventory

Below is a detailed list of every hardcoded, simulated, or fake data point currently used in the codebase:

| Component / File | Line / Function | Data Point Description | Impact / Severity |
| :--- | :--- | :--- | :--- |
| **Backend HOD Controller**<br>[hodController.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/backend/controllers/hodController.js) | L22-27<br>`getAnalytics` | The array of subject performance stats (Java, Data Structures, Web Tech, DBMS) is hardcoded. It returns dummy statistics for `enrolled`, `passed`, `passRate`, and `avgAttendance` rather than aggregating database collections. | **High** (Displays fake stats to HODs) |
| **Backend HOD Controller**<br>[hodController.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/backend/controllers/hodController.js) | L80<br>`getDeepAnalytics` | Faculty impact metrics hardcode average attendance as a placeholder (`avgAttendance: 45`) for all faculty members. | **Medium** (Skewed performance analytics) |
| **Student Academic Planner**<br>[StudentAcademicPlanner.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/frontend/src/pages/StudentAcademicPlanner.js) | L14-43<br>`mockCalendar` | The academic events calendar and task counts are hardcoded locally in the frontend state. It does not contact any backend API. | **Medium** (Static calendar page) |
| **Student Goal Setting**<br>[StudentGoalSetting.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/frontend/src/pages/StudentGoalSetting.js) | L7<br>`StudentGoalSetting` | The student's current CGPA is hardcoded as `7.2` inside the state, and target goals are saved only in `localStorage` rather than the database. | **Medium** (No persistence of goals) |
| **Assessment Difficulty Analyzer**<br>[AssessmentDifficultyAnalyzer.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/frontend/src/pages/AssessmentDifficultyAnalyzer.js) | L78-81<br>`labels/datasets` | The detailed student count distribution for mark ranges (Fail, Average, Good, Excel) is mocked by multiplying `passedCount` by static multipliers (0.4, 0.4, 0.2) because the API does not return distribution ranges. | **Low** (Visually simulated chart) |
| **Mentor Dashboard**<br>[MentorDashboard.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/frontend/src/pages/MentorDashboard.js) | L113<br>`workload` | "Last Meeting" status for all mentees is hardcoded as `'Pending'` because there's no lookup of the latest logged intervention. | **Low** (Minor dashboard placeholder) |
| **Admin Audit Logs**<br>[AuditLogs.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/frontend/src/pages/admin/AuditLogs.js) | L25, L33<br>`fetchLogs` | IP addresses for all audit entries are hardcoded as `'N/A'` because IP logging is missing from database schemas. | **Medium** (Weak security auditing) |

---

## 3. Missing API Endpoints Table

The following backend endpoints are expected by the frontend or defined in the PRD, but are missing from the routing and controller structure:

| Required Endpoint | Proposed HTTP Route | Description | Affected Frontend Dashboard |
| :--- | :--- | :--- | :--- |
| **Student Calendar Events** | `GET /api/calendar` | Fetch all academic calendar events for the current semester to replace the hardcoded ones. | Student Academic Planner |
| **Student Goals & CGPA** | `GET /api/student/goals`<br>`POST /api/student/goals` | Retrieve and save target CGPA and SPI metrics to database. | Student Goal Setting |
| **Assessments Score Distribution** | `GET /api/faculty/assessments/:id/distribution` | Returns aggregated count of students falling into specific mark brackets (0-40%, 40-60%, etc.). | Assessment Difficulty Analyzer |
| **Timetable Management** | `GET /api/timetable`<br>`POST /api/admin/timetable` | CRUD operations for managing department, semester, and division timetables. | Student & Faculty Dashboard |
| **Assignment Tracking** | `GET /api/assignments`<br>`POST /api/assignments/submit` | Creating coursework, tracking submissions, and registering evaluation marks. | Student & Faculty Dashboard |
| **System Security Audit Log** | `GET /api/admin/audit-logs` | Fetch real system activity logs from a unified `AuditLog` collection, including source IP. | Admin Dashboard (Audit Logs) |
| **In-App Messaging** | `GET /api/messages`<br>`POST /api/messages` | Load threaded chats between students, mentors, HODs, and faculty. | All Dashboards |
| **Database Backup Management** | `GET /api/admin/backup/list`<br>`POST /api/admin/backup/create` | Trigger, list, delete, and download system database compressed snapshots. | Admin Dashboard (Data Import/Export) |

---

## 4. Seeder Data Upgrades

We have refactored both [seeder.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/backend/seeder.js) and the auto-seeder in [db.js](file:///C:/Users/patel/OneDrive/Desktop/ksvsmartsystem/backend/config/db.js) to build a realistic and comprehensive database.

### What We Added:
1. **Institutions & Structure:** Added `CE`, `IT`, and `ME` departments and mapped subjects.
2. **Faculty Profiles (Employee IDs KSV-EMP-001 to KSV-EMP-008):**
   * **HOD:** Dr. Chirag Trivedi (Computer Engineering)
   * **Mentors:** Priya Shah, Vivek Pandya
   * **Faculty:** Amit Desai, Sneha Mehta, Rajesh Patel, Harish Shah, Sandeep Sharma
3. **Student Directory (25 Students):** Distributed across multiple semesters (Sem 3, Sem 5), departments, and divisions. Fully mapped to mentors and supplied with parent email credentials.
4. **Lecture Attendance (30 Working Days):** Generated 30 distinct daily logs prior to the local time (June-July 2026), skipping weekends. Attendance status probabilities are aligned with the student's risk profile level (Safe = 88%, Moderate = 68%, High = 48%).
5. **Internal Marks:** Populated marks for all students across 3 subjects of their respective semesters. Seeding covers 3 exam types: `Mid-Sem` (max 30), `Quiz` (max 10), and `Assignment` (max 10), matching the database schema constraints.
6. **Interventions:** Seeded logs for all High Risk (3 interventions: meeting, phone call, warning nudge) and Moderate Risk (1 intervention: academic counseling session) students.
7. **Leaves & Achievements:** Seeded medical leaves (approved, pending, rejected) to simulate attendance correction loops. Seeded prestigious verified student achievements (SIH Winners, NPTEL Gold Medalists, ACM ICPC Finalists).
8. **Academic Calendar:** Seeded 10 key semester dates matching the current Odd Semester 2026 schedule.

---

## 5. Feature Gap Analysis Per Dashboard Role

### 🛡️ Student Dashboard Gaps
* **Static Planner:** The planner does not show actual events added by the HOD or Admin; it displays mock events.
* **No Course Materials:** The "Resources" section shows a simple list without the ability to download files or view category structures.
* **Missing Assignments Panel:** There is no portal for students to see pending homework or submit documents online.
* **Goals Isolation:** Target CGPA calculations are not persisted in the database; they clear if a student logs in from a different browser.

### 👨‍🏫 Faculty Dashboard Gaps
* **Fragile CSV Processing:** If a CSV has missing enrollment numbers or incorrect status labels, the upload fails without returning a detailed report download of the exact rows containing errors.
* **No Bulk Attendance Editing:** Attendance can only be entered once. There is no interface to query historical logs and correct errors.
* **Lecture Scheduling Gaps:** The "Class Updates" feature is a simple string input that is not linked to any timetable, making HOD audit reporting manual and error-prone.

### 👥 Mentor Dashboard Gaps
* **Workload Calculations:** Mentorship analytics, intervention effectiveness rates, and history are computed via loops in Javascript at the controller level for every request, which will cause performance degradation as the mentee count grows.
* **No In-App Chat:** Mentors cannot chat directly with at-risk mentees. Communication is restricted to manual email notifications (which fail if the third-party Brevo service is not configured).

### 📈 HOD Dashboard Gaps
* **Mocked Departmental Performance:** Since subject statistics are mock arrays, the HOD cannot see real failing subjects or course attendance averages.
* **Detention Calculation Load:** Detention list calculations load all historical attendance records, which will fail under production loads. This process needs caching (Redis layer) or a consolidated summary database model.

### 🔑 Admin Dashboard Gaps
* **Simulated Security Logs:** The system has no real unified audit trail. The "Audit Logs" screen acts as a proxy, fetching email logs and class updates and joining them.
* **No Backup UI:** The "Data Import/Export" and backup restore buttons do not map to working backend controllers, leaving system backups manual.

---

## 6. Actionable Improvements Ranked by Impact

The following 20 improvements are ranked by their engineering impact and institutional necessity:

1. **Implement Real HOD Analytics Aggregations:** Rewrite `getAnalytics` in `hodController.js` to run MongoDB `$group` and `$lookup` aggregations to fetch real subject pass rates and averages.
2. **Build Academic Calendar API:** Register `GET /api/calendar` in `studentRoutes.js` and connect the frontend Academic Planner calendar to dynamically fetch seeded events.
3. **Aggregate Real Marks Distribution:** Add a database grouping query for marks to return count brackets (0-40, 40-60, etc.) so `AssessmentDifficultyAnalyzer.js` displays real distributions.
4. **Implement HOD Analytics Caching:** Add a Redis caching layer to the HOD analytics routes with a 1-hour TTL to prevent heavy database queries.
5. **Create Unified Audit Logging Model:** Build `backend/models/AuditLog.js` and write middleware to automatically log all write requests (IP, user ID, timestamp, and details).
6. **Connect Admin Audit Interface:** Direct `AuditLogs.js` to fetch logs from the new `AuditLog` collection, showing true action timestamps and IP addresses.
7. **Replace HOD Faculty Attendance Placeholders:** Query the `LectureAttendance` collection to compute real average attendance rates for faculty members.
8. **Build Database Backup & Restore API:** Implement a controller mapping to `mongodump` and `mongorestore` and wire it to the Admin Backup utility.
9. **Implement Persisted Student Goals:** Create a `Goal` database schema to persist student targets and roadmaps.
10. **Build Timetable Management System:** Create the `Timetable` model, routing, and a scheduler UI for departments and divisions.
11. **Implement Assignment & Project Evaluation:** Build an assignment creation panel for faculty and a file-upload portal for students.
12. **Enable WebSocket/Real-Time Nudges:** Integrate Socket.io in `server.js` to dispatch immediate popup notifications to students when faculty/mentors issue nudges.
13. **Return CSV Upload Ingestion Report:** Update the CSV upload controllers to generate an error CSV specifying row-wise validation faults.
14. **Upgrade HOD Detention List Calculations:** Calculate detention forecasts using a cron job that updates student risk profiles nightly, avoiding on-the-fly calculations.
15. **Add Department & Subject Deletion:** Complete the Admin dashboard setup pages by adding "Edit" and "Delete" capability with cascading database validation.
16. **Integrate Real-Time Email Service Configuration:** Implement an SMTP fallback mechanism in `emailService.js` in case Brevo API credentials are not set.
17. **Implement Frontend Account Lockout Warning:** Add visual countdowns on the login screen if the backend rate limiters block the user.
18. **Add Mentor-Mentee In-App Chat:** Build a direct message portal using the `Message.js` database model.
19. **Develop HOD Student Performance Comparison:** Add charts comparing student SPI/CPI distributions across multiple semesters.
20. **Enable PDF/Excel Export on HOD deep-analytics:** Add frontend export capabilities to download the Detention Forecast and Failure Analysis lists as formatted Excel worksheets.

---

## 7. Sample Realistic KSV University Data Context

To maintain consistency during manual data entry and CSV imports, the system uses the following standards:

### Enrollment Number Scheme
KSV follows a standard pattern: `KSV` + `[Year of Admission]` + `[Dept Code]` + `[Serial No.]`
* **Computer Engineering (2023 Intake):** `KSV2023CE001` to `KSV2023CE099`
* **Information Technology (2023 Intake):** `KSV2023IT001` to `KSV2023IT099`
* **Mechanical Engineering (2023 Intake):** `KSV2023ME001` to `KSV2023ME099`

### Faculty Employee ID Scheme
* `KSV-EMP-` + `[Serial No.]` (e.g., HOD: `KSV-EMP-001`, Mentors: `KSV-EMP-002`, `KSV-EMP-003`).

### Indian Gujarati Context Student Names
* **Computer Engineering:** Rahul Patel, Aayushi Joshi, Meet Shah, Nidhi Trivedi, Karan Solanki, Parth Mehta, Dharti Vaghela, Yash Rathod, Tanvi Dave, Harsh Bhatt, Poonam Chauhan, Nirav Gandhi, Darshan Vyas.
* **Information Technology:** Riya Kapoor, Dhruv Agarwal, Simran Malhotra, Preet Thakkar, Aditya Kumar, Nehal Desai.
* **Mechanical Engineering:** Raj Sharma, Bhavna Rao, Siddharth Nair, Prachi Jain, Akash Mishra, Vijay Vaghela.

---
*Report compiled by the KSV Smart Academic Monitoring System Engineering Research Team.*
