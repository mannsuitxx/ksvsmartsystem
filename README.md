# KSV Smart Academic Monitoring System

## Project Overview
A Production-Ready University System designed for Kadi Sarva Vishwavidyalaya (KSV).
Stack: React.js (Frontend) + Node.js/Express (Backend) + MongoDB.

## Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on port 27017)

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Seed the database with test data
node seeder.js
# Start the server
npm run dev
```
Server runs on: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Client runs on: `http://localhost:3000`

## Login Credentials (Seed Data)
- **Student Login:**
  - Email: `student@ksv.ac.in`
  - Password: `123456`
- **Faculty Login:**
  - Email: `faculty@ksv.ac.in`
  - Password: `123456`

## Features Implemented
1.  **JWT Authentication:** Secure login for Students and Faculty.
2.  **Student Dashboard:**
    - Real-time Risk Score calculation (Logic: Attendance < 75% or Fails).
    - Interactive Charts (Attendance vs Subjects).
    - GPA and Metrics Cards.
3.  **Backend Architecture:**
    - Role-Based Access Control (RBAC).
    - Scalable Folder Structure (Controllers, Routes, Models).

## Design Philosophy
- **Inch-by-Inch Detail:** Every UI element maps to a backend data point.
- **Performance:** Aggregations happen on the server; Frontend is lightweight.
