# Lowery Exam Application - Design Spec

## Overview
An exam application for conducting MCQ exams with automated team formation and leaderboard generation. Built with Next.js, PostgreSQL, and Docker.

## Architecture

**Tech Stack:**
- **Frontend/Backend:** Next.js (App Router) — single project handling UI + API routes
- **Database:** PostgreSQL in Docker container
- **Real-time updates:** Polling every 3-5 seconds for waiting room status
- **Deployment:** Docker Compose with Next.js app container + PostgreSQL container
- **Domain:** Local domain `ccodequest.in` (via hosts file / local DNS)

**Container Structure:**
```
docker-compose.yml
├── app (Next.js on port 3000)
└── db (PostgreSQL on port 5432)
```

## Data Model

### Tables

1. **`users`** — Exam registrants
   - `id` (serial PK)
   - `name` (unique)
   - `branch` (varchar)
   - `roll_number` (unique)
   - `course` (varchar)
   - `semester_year` (varchar)
   - `email` (unique)
   - `contact_number` (varchar)
   - `created_at` (timestamp)

2. **`questions`** — Admin-created MCQs
   - `id` (serial PK)
   - `question_text` (text)
   - `options` (JSON array of 4 strings)
   - `correct_option_index` (integer 0-3)
   - `created_at` (timestamp)

3. **`exam_attempts`** — User submissions
   - `id` (serial PK)
   - `user_id` (FK to users)
   - `answers` (JSON: {questionId: selectedOptionIndex})
   - `score` (integer)
   - `submitted_at` (timestamp)

4. **`exam_state`** — Admin-controlled exam status
   - `id` (integer PK, single row)
   - `is_started` (boolean, default false)
   - `is_ended` (boolean, default false)
   - `updated_at` (timestamp)

5. **`problem_statements`** — Static problem statements
   - `id` (serial PK)
   - `title` (varchar)
   - `description` (text)
   - `created_at` (timestamp)

6. **`teams`** — Generated team lists
   - `id` (serial PK)
   - `team_number` (integer)
   - `members` (JSON array of user objects: {name, branch, rank})
   - `is_winner` (boolean, default false)
   - `created_at` (timestamp)

**Admin credentials:** Stored in environment variables: `ADMIN_EMAIL=harsh@in2ccq.com`, `ADMIN_PASSWORD=Harsh@1234`

## User Flow

### Page 1 — Registration (`/`)
- Form fields: Name, Branch, Roll Number, Course, Semester/Year, Email ID, Contact Number
- Unique validation on Name and Roll Number
- On submit → redirect to waiting room

### Page 2 — Waiting Room (`/waiting/[userId]`)
- Shows: total questions set by admin, total users joined (live count via polling)
- Status: "Waiting for admin to start exam..."
- Exam start triggered by admin

### Page 3 — Exam (`/exam/[userId]`)
- One MCQ at a time with question navigator (shows all Q numbers, clickable)
- "Previous" and "Next" buttons for free navigation
- Submit button (active after answering at least 1 question)

### Page 4 — Results (`/results/[userId]`)
- Personal score and rank immediately after submission
- Message: "Final leaderboard will be available after exam ends"

### After Exam Ends — Public Pages:
- `/leaderboard` — All participants with scores, ranks, branches (controlled by admin toggle)
- `/teams` — Generated teams with problem statements, winner status (controlled by admin toggle)
- `/problem-statements` — All static problem statements (always public, students pick for their team)

## Admin Flow

### Admin Login (`/admin/login`)
- Fixed credentials: `harsh@in2ccq.com` / `Harsh@1234`
- Session stored in HTTP-only cookie or localStorage

### Admin Dashboard (`/admin/dashboard`)

**Tabs:**
1. **Questions** — Add/edit/delete MCQs (question text, 4 options, correct answer)
2. **Problem Statements** — Add/edit static problem statements (title + description)
3. **Exam Control** — "Start Exam" button (sets `is_started=true`), "End Exam" button (sets `is_ended=true`)
4. **Generate Teams** — Input: `Number of Teams` + `Members per Team`, runs team formation algorithm
5. **Teams** — View teams, mark "Winner" checkbox per team
6. **Export** — Download CSV/Print

**Visibility Toggles:** Leaderboard ON/OFF, Teams ON/OFF (controls public pages)

## Team Formation Algorithm

Given N teams and M members per team:
1. Take top (N × M) students from leaderboard
2. Split into M columns of N rows each
3. Column pattern: Column 1 = order, Column 2 = reversed, Column 3 = order, Column 4 = reversed, etc.
4. Each team = one row across all M columns

**Example: 9 teams, 3 members each (top 27 students)**

| Col 1 (order) | Col 2 (reversed) | Col 3 (order) |
|---------------|------------------|---------------|
| 1 | 18 | 19 |
| 2 | 17 | 20 |
| 3 | 16 | 21 |
| 4 | 15 | 22 |
| 5 | 14 | 23 |
| 6 | 13 | 24 |
| 7 | 12 | 25 |
| 8 | 11 | 26 |
| 9 | 10 | 27 |

**Teams:**
| Team | Members |
|------|---------|
| 1 | 1, 18, 19 |
| 2 | 2, 17, 20 |
| 3 | 3, 16, 21 |
| 4 | 4, 15, 22 |
| 5 | 5, 14, 23 |
| 6 | 6, 13, 24 |
| 7 | 7, 12, 25 |
| 8 | 8, 11, 26 |
| 9 | 9, 10, 27 |

## Export Functionality

### Participation Certificate List
Fixed columns: `Name, Branch, Roll Number, Course, Semester/Year, Email, Contact Number`

### Winner Teams List
Fixed columns: `Team Number, Member Names, Branch, Rank, Problem Statement Selected, Winner Status`

### Print Teams List
HTML print view with team details + problem statements for judges

## UI/UX
- Beginner and simple design
- Focus on working functionality first
- Clean forms and clear navigation
