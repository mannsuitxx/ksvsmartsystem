# PRD Improvements & Action Plan (Updated)

Summary:
This document lists prioritized improvements for the project. Completed items are marked below.

Priority (P1 = high):

- [x] **P1: Add Acceptance Criteria and Success Metrics to each core feature.** (Completed: Added in PRD.md V3.0.0)
- [x] **P1: Add a Table of Contents and Version History at top of PRD.** (Completed: Formatted at top of PRD.md V3.0.0)
- [x] **P1: Add a short "How to run locally" quick-start into README.** (Completed: Root package.json created, concurrently setup, and README.md updated)
- [x] **P1: Add CI pipeline (GitHub Actions) that runs tests.** (Completed: Setup .github/workflows/pr_checks.yml)

Priority (P2):

- [ ] **P2: Add explicit API contract examples for critical endpoints.** (Owner: Backend)
- [x] **P2: Add test plan and unit tests for riskCalculator.js.** (Completed: Added riskCalculator.test.js with passing Jest tests)
- [x] **P2: Document environment variable requirements and secure handling of keys.** (Completed: Documented in README.md)

Priority (P3):

- [ ] **P3: Add UX wireframes or links to designs; create Storybook for reusable UI components.** (Owner: Frontend)
- [ ] **P3: Add observability checklist: metrics, Sentry, and log retention policy.** (Owner: SRE)

Immediate Quick Wins (Completed):
1. Add a short TOC and Version History to prd.md.
2. Add a PR template with checklist for security, tests, and docs. (Added .github/pull_request_template.md)
3. Add package.json script `test:unit` that runs unit tests. (Added in backend/package.json)

