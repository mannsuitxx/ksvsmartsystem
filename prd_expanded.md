# Product Requirement Document (Expanded)
KSV Smart Academic Monitoring System — Production-Grade PRD (Expanded)

Version History
- 1.0.0 — Initial production-ready specification — 2026-07-09
- 1.1.0 — Expanded PRD with acceptance criteria, API contracts, security, monitoring, test strategy — 2026-07-09

Table of Contents
1. Executive Summary
2. Scope & Stakeholders
3. Goals, Objectives & Success Metrics
4. High-Level Architecture
5. Detailed Feature Specifications
  5.1 Authentication & Authorization
  5.2 Student Dashboard
  5.3 Faculty Interfaces
  5.4 Mentor / Intervention Workflows
  5.5 HOD Analytics & Reports
  5.6 Admin Controls & System Management
  5.7 CSV Ingestion & Data Normalization
  5.8 Risk Calculation Engine (in-depth)
  5.9 Notifications and Email Engine
  5.10 Real-time features (Socket.io)
6. API Specification (Contracts, Examples)
7. Data Model & Schemas (detailed)
8. Database Indexing & Performance
9. CSV Formats & Parsing Rules
10. UI/UX Guidelines & Accessibility
11. Testing Strategy (unit, integration, e2e)
12. CI/CD, Release & Rollout Plan
13. Observability, Monitoring & SLOs
14. Security & Threat Model
15. Backup, DR, and Data Retention
16. Operational Runbooks & Playbooks
17. Compliance, Privacy & Data Governance
18. Scalability & Capacity Planning
19. Roadmap & Backlog
20. Appendix: Templates, Error Codes, Sample Payloads, Wireframes

---

1. Executive Summary
The KSV Smart Academic Monitoring System provides an integrated platform for tracking students’ attendance, internal marks, interventions, and communications with parents. The platform focuses on early risk detection, mentor-driven remediation, and data-driven analytics for department heads and administrators. This expanded PRD details feature-level acceptance criteria, API contracts, operational requirements, security posture, and the non-functional requirements required to produce a truly production-ready service.

2. Scope & Stakeholders
Scope: University-level monitoring for Kadi Sarva Vishwavidyalaya (KSV). Includes front-end portal, back-end APIs, email integration, scheduled reporting, and support for bulk ingestion and administrative tools.
Primary stakeholders:
- Students — consumers of dashboards and communication
- Faculty — attendance & marks uploaders
- Mentors — interventions and approvals
- HODs — analytics and compliance
- Admins — system configuration & user management
- IT/Ops — deployment, monitoring, backups

3. Goals, Objectives & Success Metrics
Goals:
- Accurate, timely identification of at-risk students
- Minimal manual effort to upload and correct data
- Full auditability of interventions and notifications
Success metrics (KPI):
- Precision of High-Risk classification: target >= 85% (validated against historical labels)
- Mean time to notify mentor after data ingestion: < 30 minutes
- CSV ingestion error rate: < 2% per upload by non-technical staff
- API 95th percentile latency: < 300ms (for common endpoints)
- Uptime (system availability): 99.9% monthly
- Test coverage for critical modules (risk calculation, CSV ingestion): 90%+

Acceptance Criteria (General):
- All core endpoints have OpenAPI-compatible request/response examples and error codes
- Every critical workflow has an integration test that runs in CI
- Read/Write operations are authorized and audited

4. High-Level Architecture
- Frontend: React (component library), Bootstrap 5 (or Tailwind option), Storybook for UI library
- Backend: Node.js, Express.js, JWT-based auth, role-based middleware
- Database: MongoDB (Atlas recommended) with Mongoose ODM
- Queue/Worker: optional Redis + Bull for heavy asynchronous tasks (email batching, report generation)
- Scheduler: node-cron or hosted scheduler (e.g., AWS EventBridge)
- Email: Brevo (sib-api-v3-sdk)
- Observability: Prometheus metrics + Grafana + Sentry for errors
- CI/CD: GitHub Actions; containerized deployments to cloud provider

Deployment Topology:
- Stateless backend instances behind a load balancer
- Shared MongoDB Atlas cluster with primary & read replicas
- CDN for frontend static assets
- Secrets in platform-managed store (GitHub Secrets, AWS Secrets Manager)

5. Detailed Feature Specifications
(Each feature below contains: description, user story, acceptance criteria, success metrics, API endpoints involved, UI wireframe reference)

5.1 Authentication & Authorization
Description: Secure multi-role authentication with JWT, refresh token support, password reset, account activation.
User stories:
- As a user, I can log in and receive a token granting role-appropriate access.
- As an admin, I can create user accounts and assign roles.
Acceptance Criteria:
- Passwords hashed with bcrypt (10+ salt rounds)
- Access tokens expire per config (JWT_EXPIRE), refresh tokens rotate
- Protected endpoints return 401/403 for unauthorized access
- Admin actions are logged in AuditLog
APIs:
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/register (admin only)
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

5.2 Student Dashboard
Description: Student-facing dashboard showing current risk, attendance, marks summary, notifications, and what-if simulation.
User stories:
- Students view their risk level and contributing reasons
- Students run a what-if calculator to project SPI
Acceptance Criteria:
- Risk & metrics match backend calculated values
- Dashboard loads within 2 seconds under normal load
- What-if simulation runs in-browser matching server-side logic
APIs:
- GET /api/student/dashboard
- POST /api/student/simulate

5.3 Faculty Interfaces
Description: Upload and manage attendance/marks, create class updates, and send nudges
Acceptance:
- CSV uploads processed with clear error reporting
- Faculty can correct individual attendance entries
APIs:
- POST /api/faculty/attendance-csv
- POST /api/faculty/attendance
- POST /api/faculty/marks-csv
- POST /api/faculty/marks

5.4 Mentor / Intervention Workflows
Description: Mentors track mentees, log interventions, approve medical leaves and achievements
Acceptance:
- Intervention log entries are immutable once closed
- Mentor notifications are delivered via email + in-app
APIs:
- GET /api/mentor/mentees
- POST /api/mentor/intervention
- PUT /api/mentor/intervention/:id

5.5 HOD Analytics & Reports
Description: Department-level analytics including detention forecasts and assessment difficulty analysis
Acceptance:
- Forecast algorithm flagged students match manual sample verification >= 90% of cases
- Reports downloadable as CSV/PDF
APIs:
- GET /api/hod/analytics
- GET /api/hod/deep-analytics

5.6 Admin Controls & System Management
Description: System settings, user administration, calendar management
Acceptance:
- Only admin role can perform system resets
- SystemConfig keys stored and versioned
APIs:
- POST /api/admin/users
- PUT /api/admin/system/config/:key
- POST /api/admin/system/reset-semester

5.7 CSV Ingestion & Data Normalization
CSV ingestion rules:
- Accept flexible header names; map common variations (enrollment, enrollment_no, enrollment_number)
- Validate data types; produce detailed error CSV with line numbers and error messages
- Idempotency: each upload includes an uploadId to make replays safe
Acceptance:
- Upload feedback includes processed, skipped, failed counts and downloadable error report

5.8 Risk Calculation Engine (in-depth)
Overview:
- Risk is calculated using time-series of attendance and marks
- Configurable thresholds via SystemConfig
Algorithm (pseudocode):
1. Compute attendance percentage over last N lectures and semester-to-date
2. Compute weighted marks percentage across assessments (weights configurable by examType)
3. Apply decay factor to older data to prioritize recent performance
4. Compute composite riskScore = w1*attendanceFactor + w2*marksFactor + w3*behaviorSignals
5. Map score to level using thresholds
Example formula:
- attendanceFactor = max(0, (100 - attendancePercent))
- marksFactor = max(0, (minMarksThreshold - avgMarks)) * 2
- riskScore = clamp(attendanceFactor * 0.6 + marksFactor * 0.4, 0, 100)
Considerations:
- Support semester-weighted calculations, exam weights, and remedial overrides
- Allow manual mentor flags to increase or reduce risk temporarily
Acceptance Criteria:
- Unit tests covering edge cases and no-data scenarios
- Benchmarks for calculation time for 10k students < 5 minutes on production hardware

5.9 Notifications and Email Engine
- Use Brevo API with exponential retry and dead-letter logging
- Batch monthly reports into one per parent per month
- Track EmailLog entries with status and errors
Acceptance:
- Email delivery success rate > 95% (dependent on provider)

5.10 Real-time features (Socket.io)
- Real-time nudges and interventions delivered via websockets
- Fallback to polling when websocket unavailable
Acceptance:
- Delivery latency for real-time events < 2s under normal load

6. API Specification (Contracts, Examples)
Standard response format:
{
  "success": true|false,
  "data": { ... },
  "error": { code: string, message: string }
}

6.1 POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}
Response 200:
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "refreshToken": "<refresh>",
    "user": {"id":"...","role":"student","email":"..."}
  }
}
Error responses:
- 400 invalid payload
- 401 invalid credentials
- 429 rate limit

6.2 GET /api/student/dashboard
Response (summarized):
{
  "success": true,
  "data": {
    "student": {"enrollmentNumber":"...","name":"..."},
    "riskProfile": {"score":50,"level":"Moderate Risk","reasons":["Low attendance"]},
    "attendanceBreakdown": [{"subject":"Math","percent":70}],
    "marksBreakdown": [{"subject":"Math","avg":64}],
    "notifications": [{"id":"n1","message":"..."}]
  }
}

6.3 POST /api/faculty/attendance-csv
- multipart/form-data, fields: file, semester, subject
Success: returns uploadId and counts

6.4 Error Codes (standardized)
- E_VALIDATION: Input validation failed
- E_NOT_FOUND: Resource not found
- E_AUTH: Authentication/Authorization error
- E_CSV_PARSE: CSV parsing error
- E_INTERNAL: Internal server error

7. Data Model & Schemas (detailed)
(For each schema include field, type, constraints, indexes, and example document.)

7.1 User
- _id: ObjectId, index
- email: String, unique, required, index
- passwordHash: String, required
- role: Enum (student, faculty, mentor, hod, admin)
- isActive: Boolean, default true
- createdAt, updatedAt: Date

Example:
{
  "_id": "64...",
  "email": "student@ksv.edu.in",
  "role": "student",
  "isActive": true
}

7.2 Student
- _id: ObjectId
- userId: ObjectId -> User
- enrollmentNumber: String, unique, required, index
- firstName, lastName
- department, currentSemester, division
- mentorId: ObjectId -> User
- parentEmail: String
- riskProfile: { score: Number, level: String, reasons: [String], lastCalculated: Date }
- academicMetrics: { overallAttendance: Number, overallMarks: Number }

Indexing recommendations:
- Index on enrollmentNumber
- Compound indexes for department + currentSemester to speed HOD queries

7.3 LectureAttendance
- subjectName, facultyId, date
- records: [{ studentId, status }]
Consider storing aggregated attendance per student per subject and a separate detailed per-lecture log for audit.

7.4 InternalMarks
- studentId, subjectName, examType, marksObtained, maxMarks, percentage
- index on studentId, subjectName

7.5 Intervention
- studentId, mentorId, type, date, status, remarks, actionPlan, isRead
- Audit fields: createdBy, closedBy, closedAt
Immutable record rules: closed interventions are append-only; updates recorded as versions or separate log entries.

7.6 SystemConfig
- key, value, description, updatedBy, version
- Use change history for each key (for audit and rollback)

8. Database Indexing & Performance
- Ensure counts by risk level use aggregated fields and avoid full collection scans
- Use partial indexes for active students: { isActive: true }
- TTL index for temporary upload logs or processed CSV staging tables
- Consider materialized views (or scheduled aggregates) for HOD analytics updated daily to avoid heavy queries on demand

9. CSV Formats & Parsing Rules
- Strict UTF-8 encoding recommended
- Provide sample templates with required/optional headers
- On error, produce an errors.csv with columns: rowNumber,errorCode,errorMessage,rawRow
- For ambiguous columns, attempt fuzzy header mapping (Levenshtein) and prompt user when mapping confidence low

10. UI/UX Guidelines & Accessibility
- Use a design system with a color palette, spacing scale, and responsive breakpoints
- Provide Storybook for component isolation and review
- Accessibility targets: WCAG 2.1 AA compliance
- Keyboard navigation, high contrast mode, aria labels on interactive elements
- Error states: Provide inline field errors and summary at top for forms

11. Testing Strategy (unit, integration, e2e)
Unit tests:
- riskCalculator logic, CSV parser, mapping utilities
Integration tests:
- controller -> DB mocks (mongodb-memory-server) for student flows
E2E tests:
- Cypress for critical user journeys: login, upload CSV, mentor intervention, HOD report
Test data:
- Use deterministic fixtures for CI to ensure stable results
Coverage targets:
- 90%+ on critical modules

12. CI/CD, Release & Rollout Plan
CI:
- GitHub Actions pipeline (lint, unit tests, integration where possible, build)
CD:
- Deploy to staging on merge to develop branch
- Run smoke tests on staging
- Promote artifact to production on release tag
Rollback:
- Keep database migration scripts reversible where possible
- Maintain retention window for backups to allow point-in-time restore

13. Observability, Monitoring & SLOs
Metrics to capture:
- HTTP requests per endpoint, latency percentiles, error rates
- Background job queue lengths and worker health
- Email delivery success/failure counts
- Monthly report generation time
SLOs:
- Availability: 99.9%
- Error rate: < 1% for 5xx
Alerting:
- Pager duty on sustained 5xx > 1% for 5 minutes
- Queue backlog > threshold triggers an alert
Logging:
- Structured JSON logs via Winston
- Correlate logs by requestId and userId
Tracing:
- Add request tracing headers for distributed tracing

14. Security & Threat Model
Authentication/Authorization:
- Enforce least privilege per role
- Rotate JWT secret periodically and support revocation via token blacklist
Transport & Storage:
- TLS everywhere for frontend/backends and DB connections
- Encrypt sensitive fields at rest if required
Secrets management:
- Use platform secret manager
Threat model:
- Protect against NoSQL injection: whitelist filters and use mongoose parameterization
- XSS: sanitize user-provided HTML or disallow rich HTML in user inputs
- CSRF: use same-site cookies or JWT in Authorization header, and CSRF tokens for forms where cookies used
Penetration testing:
- Quarterly security scans and dependency vulnerability scans

15. Backup, DR, and Data Retention
- Daily snapshots of database with 30-day retention
- Point-in-time recovery for 7 days
- Archive older email logs to cold storage (90+ days)
- Legal retention: store student records for X years per institution policy

16. Operational Runbooks & Playbooks
Runbook: Incident — High 5xx
1. Acknowledge alert
2. Check logs and recent deploys
3. If deploy caused regression, rollback to last known good tag
4. Contact on-call and open incident ticket
Runbook: Restore DB from snapshot
- Retrieve latest snapshot before incident
- Restore to staging and verify integrity
- Promote to production with maintenance window

17. Compliance, Privacy & Data Governance
- Store parent emails and student PII securely
- Provide data export and delete requests (GDPR-like) for subjects
- Audit logs for access to sensitive student records

18. Scalability & Capacity Planning
- Capacity assumptions: N students, M lectures per month, K concurrent users
- Benchmark plans for sharding or read-replica scaling on MongoDB as load increases
- Plan for horizontal scaling of backend instances and autoscaling rules

19. Roadmap & Backlog
Short term (0-3 months):
- Harden CSV ingestion, add CI tests, add Storybook
Medium term (3-9 months):
- Add analytics dashboards, scheduled aggregated views, mobile readiness
Long term (9-18 months):
- Integrate with ERP, advanced ML-based predictive analytics, SMS provider integration

20. Appendix
20.1 Error code catalog
- E_VALIDATION: 400 — Input validation failed
- E_AUTH: 401 — Authentication failed
- E_FORBIDDEN: 403 — Role insufficient
- E_NOT_FOUND: 404 — Resource missing
- E_INTERNAL: 500 — Unhandled server error

20.2 Sample Email Template (Monthly Report)
Subject: Monthly Academic Update for {{studentName}} — {{month}}
Body (HTML):
<html>
  <body>
    <p>Dear Parent/Guardian,</p>
    <p>Here is the monthly update for {{studentName}} (Enrollment: {{enrollment}}):</p>
    <ul>
      <li>Attendance this month: {{attendancePercent}}%</li>
      <li>Overall Risk Level: {{riskLevel}}</li>
      <li>Key reasons: {{reasons}}</li>
    </ul>
    <p>Please contact {{mentorName}} for further discussion.</p>
    <p>Regards,<br/>KSV Academic Monitoring System</p>
  </body>
</html>

20.3 Sample CSV Error Report
rowNumber,errorCode,errorMessage,rawRow
12,E_VALIDATION,Missing enrollment,\"\",",\n"

20.4 Glossary
- SPI: Semester Performance Index
- HOD: Head of Department
- TTL: Time To Live

---

Change log & next steps
- File: prd_expanded.md created as comprehensive specification
- Next recommended actions:
  1. Review and assign owners for each acceptance criteria
  2. Break P1 items into tracked todos / issues
  3. Start implementing Storybook and add sample UI components
  4. Add integration tests for riskCalculator and CSV parser to CI

End of expanded PRD (summary). For more depth in specific sections (e.g., security checklist, schema ER diagrams, API OpenAPI spec), indicate which section to expand and it will be generated as a follow-up.

---

APPENDIX: Full OpenAPI (partial, starter)

openapi: 3.0.3
info:
  title: KSV Academic Monitoring API
  version: 1.1.0
  description: API endpoints for KSV Smart Academic Monitoring System
servers:
  - url: https://api.ksv.edu.in
    description: Production server
  - url: http://localhost:5000
    description: Local development
paths:
  /api/auth/login:
    post:
      summary: User login
      tags:
        - auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
  /api/student/dashboard:
    get:
      summary: Get student dashboard
      tags: [student]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Student dashboard
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StudentDashboard'
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    AuthResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            token:
              type: string
            refreshToken:
              type: string
            user:
              $ref: '#/components/schemas/User'
    User:
      type: object
      properties:
        id:
          type: string
        role:
          type: string
          enum: [student, faculty, mentor, hod, admin]
        email:
          type: string
          format: email
    StudentDashboard:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            student:
              $ref: '#/components/schemas/Student'
            riskProfile:
              $ref: '#/components/schemas/RiskProfile'
            attendanceBreakdown:
              type: array
              items:
                type: object
                properties:
                  subject:
                    type: string
                  percent:
                    type: number
            marksBreakdown:
              type: array
              items:
                type: object
                properties:
                  subject:
                    type: string
                  avg:
                    type: number
    Student:
      type: object
      properties:
        enrollmentNumber:
          type: string
        firstName:
          type: string
        lastName:
          type: string
    RiskProfile:
      type: object
      properties:
        score:
          type: number
        level:
          type: string
        reasons:
          type: array
          items:
            type: string

---

APPENDIX: ER Diagram (textual)

Entities:
- User (id PK, email, passwordHash, role, isActive, createdAt, updatedAt)
- Student (id PK, userId FK->User, enrollmentNumber, firstName, lastName, department, currentSemester, division, mentorId FK->User, parentEmail, riskProfile, academicMetrics)
- LectureAttendance (id PK, subjectName, facultyId FK->User, date, records [studentId, status])
- InternalMarks (id PK, studentId FK->Student, subjectName, semester, examType, marksObtained, maxMarks, percentage)
- Intervention (id PK, studentId FK->Student, mentorId FK->User, type, date, status, remarks, actionPlan, isRead, audit[])
- SystemConfig (key PK, value, description, updatedBy FK->User, version)
- EmailLog (id PK, senderId FK->User, recipientEmail, subject, status, type, error, createdAt)
- AcademicCalendar (id PK, title, startDate, endDate, type)

Relationships:
- User 1--1 Student (via userId)
- User 1--N LectureAttendance (facultyId)
- Student 1--N LectureAttendance.records
- Student 1--N InternalMarks
- Mentor(User) 1--N Intervention

Notes:
- Consider a separate AttendanceSummary collection for fast queries: (studentId, subject, totalLectures, presentLectures, percent)
- Intervention.audit: store history of changes (who changed, timestamp, changes)

---

APPENDIX: Security Checklist (detailed)

A. Identity & Access Management
1. Use strong password policy: min 12 chars, complexity, block common passwords
2. Support MFA for Admin and HOD roles (TOTP or FIDO2)
3. Implement refresh token rotation and revocation list
4. Audit logs: store who changed role assignments and when

B. Transport & Storage
1. Enforce TLS 1.2+ on all services and APIs
2. Use HSTS headers for frontend
3. Encrypt sensitive fields at rest using KMS-managed keys (e.g., AES-256)

C. Application Security
1. Input validation at boundary (express-validator), deny-by-default
2. Use parameterized queries and mongoose schema validation
3. Enable CSP header for frontend to reduce XSS
4. Use helmet and sanitize user content before rendering

D. Dependency Management
1. Automated dependency scanning (Dependabot)
2. Block builds on critical vulnerabilities

E. Secrets & Config
1. Store secrets in GitHub Actions secrets / cloud secret manager
2. Never log secrets; redact in logs

F. Operational Security
1. Quarterly pen tests and monthly vulnerability scans
2. Incident response plan documented and tested annually

---

APPENDIX: Operational Runbooks (expanded)

Incident: Email Delivery Failures
- Symptom: > 10% emails failing in 30 minutes
Steps:
1. Check EmailLog for failing error messages
2. Validate Brevo API key validity via provider dashboard
3. Check network egress to Brevo endpoints
4. If provider incident, switch to backup SMTP provider (if configured)
5. Notify stakeholders with incident summary

Incident: Risk Calculation Job Fails
- Symptom: cron job exit code non-zero or exceptions in logs
Steps:
1. Check job logs in logs/monthly-report.log or job worker logs
2. Run job interactively in staging with sample data
3. If MongoDB timeouts, check replica set health and connection strings
4. Backfill any missed calculations by running calculateAllStudentsRisk manually with batching

Runbook: CSV ingestion with schema drift
Steps to remediate:
1. Capture the uploaded CSV and produce error report
2. If header mismatch, use fuzzy header mapping and prompt admin to map columns
3. If bulk fix needed, provide a GUI to rename headers and re-parse

---

APPENDIX: Testing Matrix (selected)

Endpoints & Test Types:
- /api/auth/login: unit (validation), integration (login flows), e2e (UI login)
- /api/faculty/attendance-csv: unit (parser), integration (DB writes mocked), e2e (upload + verify counts)
- /api/student/dashboard: integration (returns computed fields), performance (latency under load)

Test Cases (example for riskCalculator):
1. No attendance, no marks -> safe with 0 score (edge case)
2. Low attendance, no marks -> moderate risk
3. Low attendance + low marks -> high risk
4. Marks below min in one subject -> moderate risk
5. With SystemConfig override (minAttendance=60) behavior changes accordingly

CI Strategy:
- Fast unit tests run on each push
- Integration tests run on PRs and nightly builds (require mongodb-memory-server)
- E2E tests run on staging after deployment

---

APPENDIX: Monitoring Dashboard Spec

Suggested Grafana dashboard panels:
- API: requests per minute, p95 latency, 5xx rate
- Jobs: monthly-report job duration, success/failure count
- Queue: email queue length, retry rate
- Database: connections, oplog lag (if using replica set)
- System: CPU, memory of backend pods/instances

Alerts:
- p95 latency for /api/student/dashboard > 500ms for 5m
- Error rate > 1% sustained for 5m
- DB primary replica CPU > 80% for 10m

---

APPENDIX: Database Migration Strategy

Principles:
- Use idempotent migration scripts versioned in /server/migrations
- Support up/down methods for each migration
- Run migrations automatically in CI on release candidate and require manual approval for production

Sample migration (Add academicMetrics to Student):
module.exports.up = async function(db) {
  await db.collection('students').updateMany({ academicMetrics: { $exists: false } }, { $set: { academicMetrics: { overallAttendance: 0, overallMarks: 0 } } });
};

module.exports.down = async function(db) {
  await db.collection('students').updateMany({}, { $unset: { academicMetrics: "" } });
};

---

APPENDIX: Storybook & Frontend Component Plan

Components to scaffold in Storybook:
- Navbar (with role-based links)
- Sidebar (collapsible)
- RiskCard (badge + progress bar + reasons)
- AttendanceTable (with inline edit)
- CSVUploader (progress + error report link)
- NotificationList (real-time + history)
- InterventionModal (create/edit)

Each component should have accessible stories and snapshot tests.

---

APPENDIX: Data Retention & Export Policies

- Student PII: retain for 7 years after graduation
- Email logs: 1 year in hot storage, archive to cold storage for 5 years
- Audit logs: 2 years with indexing for quick search

Data export API (admin):
- GET /api/admin/export/students?format=csv&since=YYYY-MM-DD -> streams CSV

---

APPENDIX: Sample Operational Queries & Aggregations

1. Students by risk level:
db.students.aggregate([
  { $group: { _id: '$riskProfile.level', count: { $sum: 1 } } }
])

2. Average attendance by department/semester:
db.lectureattendance.aggregate([
  { $unwind: '$records' },
  { $lookup: { from: 'students', localField: 'records.studentId', foreignField: '_id', as: 'student' } },
  { $unwind: '$student' },
  { $group: { _id: { department: '$student.department', semester: '$student.currentSemester' }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$records.status','P'] },1,0] } } } },
  { $project: { department: '$_id.department', semester: '$_id.semester', attendancePercent: { $multiply: [{ $divide: ['$present','$total'] },100] } } }
])

---

APPENDIX: Example Webhook/Event Schema (for external integrations)
{
  "event": "student.risk.updated",
  "data": {
    "studentId": "...",
    "riskProfile": { "score": 80, "level": "High Risk" },
    "updatedAt": "2026-07-09T00:00:00Z"
  }
}

---

APPENDIX: Long-term Enhancements and R&D (brief)
- Build ML model for predictive risk using features: attendance trends, marks, intervention history, behavioral signals (library access, LMS activity)
- Explore federated data ingestion from ERP and LMS
- Mobile apps for mentors with offline support

---

End of expanded appendices. This update significantly enlarges the PRD with actionable specifications, OpenAPI starter, ER notes, security checklist, runbooks, testing matrix, monitoring spec, migrations, Storybook plan, and operational examples. If a targeted section should be further deepened into an OpenAPI YAML file, an ER diagram image, or a Sentry/Grafana dashboard JSON, specify which and it will be generated next.