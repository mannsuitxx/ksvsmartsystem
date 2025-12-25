# KSV Smart Academic Monitoring System - User Role Definitions

**Document Version:** 1.0.0
**Context:** Deployment at Kadi Sarva Vishwavidyalaya (KSV), Gujarat.

This document serves as the official definition of user roles within the system.

---

### 1. The Student
**Access Level:** Read-Only / Consumer

#### Section 1: Who is this user?
The Student represents an individual enrolled in an Undergraduate or Postgraduate program. They are the data subject whose academic and behavioral performance is being monitored.

#### Section 2: Authorized Actions
*   **Personal Dashboard:** Access a personalized dashboard (`/student/dashboard`).
*   **Real-Time Monitoring:** View attendance percentages and internal marks immediately upon upload.
*   **Risk Status:** View their calculated "Risk Profile" (Safe, Moderate, or High Risk).

#### Section 3: Restrictions
*   **Data Modification:** Zero write access. Cannot modify marks or attendance.
*   **Peer Access:** Strictly prohibited from viewing data of other students.

#### Section 4: Criticality
Critical for **Self-Regulation**. By providing real-time transparency into their "Risk Status," the system empowers students to take corrective action early.

---

### 2. The Faculty
**Access Level:** Operational / Data Provider

#### Section 1: Who is this user?
Academic staff responsible for conducting lectures and evaluating students. They are the primary source of truth for all academic data.

#### Section 2: Authorized Actions
*   **Master Student Management:** Upload Master Student Lists via CSV and add single students manually.
*   **Attendance Management:** Upload daily lecture attendance (Bulk CSV/Manual).
*   **Evaluation:** Upload internal marks.
*   **Directory:** Search and filter the student directory.

#### Section 3: Restrictions
*   **System Architecture:** Cannot modify underlying Risk Logic or database schemas.
*   **User Deletion:** Cannot delete other Faculty or Admin accounts.

#### Section 4: Criticality
The Faculty is the **Data Engine**. The system's intelligence relies on the timeliness and accuracy of their data entry.

---

### 3. The Mentor
**Access Level:** Supervisory / Interventionist

#### Section 1: Who is this user?
A Faculty member assigned to a small group of students (mentees) for behavioral guidance.

#### Section 2: Authorized Actions
*   **Mentee Dashboard:** View only assigned students.
*   **Risk Alert Management:** Receive alerts for "High Risk" mentees.
*   **Intervention:** Upload remedial attendance and log counseling notes.

#### Section 3: Restrictions
*   **Record Alteration:** Cannot change original marks/attendance set by Subject Teachers.

#### Section 4: Criticality
Critical for **Student Support**. Mentors close the feedback loop by documenting interventions to save students from detention.

---

### 4. Head of Department (HOD)
**Access Level:** Tactical / Analyst

#### Section 1: Who is this user?
The academic head of a specific branch (e.g., Computer Engineering).

#### Section 2: Authorized Actions
*   **Analytics:** Access failure trends and faculty performance metrics.
*   **Reporting:** Generate Detention Lists and NAAC/NBA reports.

#### Section 3: Restrictions
*   **Micro-Management:** Discouraged from daily data entry to maintain strategic focus.

#### Section 4: Criticality
Critical for **Quality Assurance**. HODs use the system for high-level decision-making and curriculum adjustments.

---

### 5. Admin
**Access Level:** Strategic / System Controller

#### Section 1: Who is this user?
University Registrar or IT System Administrator.

#### Section 2: Authorized Actions
*   **User Management:** Create/Delete Faculty, HODs, and Mentors.
*   **Configuration:** Define Semesters, Subjects, and Academic Years.
*   **System Health:** Monitor performance and backups.

#### Section 3: Restrictions
*   **None:** "God Mode" access.

#### Section 4: Criticality
Critical for **System Integrity**. Ensures the digital system matches the real-world university structure.
