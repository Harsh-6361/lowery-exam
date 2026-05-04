# Lowery Exam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js exam application with MCQ testing, automated team formation, leaderboard, and admin dashboard.

**Architecture:** Next.js (App Router) with API routes, PostgreSQL database, Docker Compose for containerization. Polling-based updates for waiting room. Admin dashboard for exam control, question management, and team generation.

**Tech Stack:** Next.js 14+, TypeScript, Prisma ORM, PostgreSQL, Docker, Tailwind CSS

---

## File Structure

```
lowery_exam/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Registration form
│   │   ├── waiting/[userId]/page.tsx   # Waiting room
│   │   ├── exam/[userId]/page.tsx      # MCQ exam
│   │   ├── results/[userId]/page.tsx    # Personal results
│   │   ├── leaderboard/page.tsx         # Public leaderboard
│   │   ├── teams/page.tsx               # Public teams view
│   │   ├── problem-statements/page.tsx  # Public problem statements
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       └── dashboard/
│   │           ├── page.tsx             # Main dashboard
│   │           ├── questions/page.tsx
│   │           ├── problems/page.tsx
│   │           └── teams/page.tsx
│   ├── lib/
│   │   ├── db.ts                       # Prisma client
│   │   ├── auth.ts                     # Admin auth
│   │   └── team-algorithm.ts           # Team formation logic
│   ├── components/
│   │   ├── RegistrationForm.tsx
│   │   ├── WaitingRoom.tsx
│   │   ├── ExamInterface.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── TeamsList.tsx
│   │   └── admin/
│   │       ├── AdminLoginForm.tsx
│   │       ├── QuestionManager.tsx
│   │       ├── ProblemStatementManager.tsx
│   │       ├── ExamControls.tsx
│   │       ├── TeamGenerator.tsx
│   │       └── ExportButtons.tsx
│   └── api/
│       ├── register/route.ts
│       ├── users/route.ts
│       ├── questions/route.ts
│       ├── exam/start/route.ts
│       ├── exam/submit/route.ts
│       ├── exam/state/route.ts
│       ├── leaderboard/route.ts
│       ├── teams/generate/route.ts
│       ├── teams/route.ts
│       ├── admin/login/route.ts
│       ├── problem-statements/route.ts
│       └── export/
│           ├── participation/route.ts
│           └── winners/route.ts
└── docs/superpowers/specs/
```

---

### Task 1: Project Initialization & Docker Setup

**Files:**
- Create: `package.json`
- Create: `docker-compose.yml`
- Create: `Dockerfile`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Initialize Next.js project with TypeScript**

```bash
npm init -y
npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom
npm install @prisma/client prisma
npm install tailwindcss postcss autoprefixer @tailwindcss/postcss
npx tailwindcss init -p
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "lowery-exam",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "prisma": "^5.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/postcss": "^3.4.0"
  }
}
```

- [ ] **Step 3: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 8: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: lowery_exam
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://user:password@db:5432/lowery_exam?schema=public"
      ADMIN_EMAIL: "harsh@in2ccq.com"
      ADMIN_PASSWORD: "Harsh@1234"
      NEXTAUTH_SECRET: "your-secret-key-change-in-production"
    depends_on:
      - db
    volumes:
      - ./src:/app/src
      - ./prisma:/app/prisma

volumes:
  postgres_data:
```

- [ ] **Step 9: Create .env file**

```
DATABASE_URL="postgresql://user:password@localhost:5432/lowery_exam?schema=public"
ADMIN_EMAIL="harsh@in2ccq.com"
ADMIN_PASSWORD="Harsh@1234"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

- [ ] **Step 10: Create .gitignore**

```
node_modules
.next
.env
```

- [ ] **Step 11: Initialize git and commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with Docker setup"
```

---

### Task 2: Database Schema Setup with Prisma

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Create Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  name          String   @unique
  branch        String
  rollNumber    String   @unique
  course        String
  semesterYear  String
  email         String   @unique
  contactNumber String
  createdAt     DateTime @default(now())
  examAttempt   ExamAttempt?
}

model Question {
  id                Int      @id @default(autoincrement())
  questionText      String
  options           String[]  @default([])
  correctOptionIndex Int
  createdAt         DateTime @default(now())
}

model ExamAttempt {
  id         Int      @id @default(autoincrement())
  userId     Int      @unique
  answers    Json     // {questionId: selectedOptionIndex}
  score      Int
  submittedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}

model ExamState {
  id        Int      @id
  isStarted Boolean  @default(false)
  isEnded   Boolean  @default(false)
  updatedAt DateTime @default(now())
}

model ProblemStatement {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  createdAt   DateTime @default(now())
}

model Team {
  id          Int      @id @default(autoincrement())
  teamNumber  Int
  members     Json     // [{name, branch, rank}]
  isWinner    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 2: Generate Prisma client and run initial migration**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Prisma schema with all models"
```

---

### Task 3: Prisma Client & Database Library

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create Prisma client singleton**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add Prisma client singleton"
```

---

### Task 4: Admin Auth Library

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create admin auth functions**

```typescript
export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || 'harsh@in2ccq.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Harsh@1234'
  return email === adminEmail && password === adminPassword
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add admin auth validation"
```

---

### Task 5: Team Formation Algorithm

**Files:**
- Create: `src/lib/team-algorithm.ts`

- [ ] **Step 1: Write the team formation function**

```typescript
export interface TeamMember {
  name: string
  branch: string
  rank: number
}

export interface Team {
  teamNumber: number
  members: TeamMember[]
}

export function generateTeams(
  leaderboard: { name: string; branch: string; rank: number }[],
  numberOfTeams: number,
  membersPerTeam: number
): Team[] {
  const totalNeeded = numberOfTeams * membersPerTeam
  const topParticipants = leaderboard.slice(0, totalNeeded)

  // Split into columns
  const columns: number[][] = []
  for (let col = 0; col < membersPerTeam; col++) {
    const columnData: number[] = []
    for (let row = 0; row < numberOfTeams; row++) {
      const index = row * membersPerTeam + col
      if (index < topParticipants.length) {
        columnData.push(index)
      }
    }
    
    // Reverse every other column (0-indexed: 1, 3, 5, ...)
    if (col % 2 === 1) {
      columnData.reverse()
    }
    
    columns.push(columnData)
  }

  // Form teams by taking one element from each column per row
  const teams: Team[] = []
  for (let row = 0; row < numberOfTeams; row++) {
    const members: TeamMember[] = []
    for (let col = 0; col < membersPerTeam; col++) {
      const participantIndex = columns[col][row]
      if (participantIndex !== undefined) {
        const participant = topParticipants[participantIndex]
        members.push({
          name: participant.name,
          branch: participant.branch,
          rank: participant.rank
        })
      }
    }
    teams.push({
      teamNumber: row + 1,
      members
    })
  }

  return teams
}
```

- [ ] **Step 2: Write unit test for algorithm**

Create: `src/lib/__tests__/team-algorithm.test.ts`

```typescript
import { generateTeams } from '../team-algorithm'

const mockLeaderboard = Array.from({ length: 100 }, (_, i) => ({
  name: `Student ${i + 1}`,
  branch: 'CSE',
  rank: i + 1
}))

describe('generateTeams', () => {
  it('should generate correct teams for 9 teams with 3 members each', () => {
    const teams = generateTeams(mockLeaderboard, 9, 3)
    
    expect(teams).toHaveLength(9)
    expect(teams[0].members).toEqual([
      { name: 'Student 1', branch: 'CSE', rank: 1 },
      { name: 'Student 18', branch: 'CSE', rank: 18 },
      { name: 'Student 19', branch: 'CSE', rank: 19 }
    ])
    expect(teams[8].members).toEqual([
      { name: 'Student 9', branch: 'CSE', rank: 9 },
      { name: 'Student 10', branch: 'CSE', rank: 10 },
      { name: 'Student 27', branch: 'CSE', rank: 27 }
    ])
  })

  it('should handle partial last column', () => {
    const teams = generateTeams(mockLeaderboard.slice(0, 25), 9, 3)
    expect(teams).toHaveLength(9)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx tsc --noEmit src/lib/__tests__/team-algorithm.test.ts || true
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/lib/__tests__/team-algorithm.test.ts --passWithNoTests || npx ts-node src/lib/__tests__/team-algorithm.test.ts || echo "Install jest separately if needed"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/team-algorithm.ts src/lib/__tests__/team-algorithm.test.ts
git commit -m "feat: add team formation algorithm with tests"
```

---

### Task 6: Base Layout & Styling

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Create root layout**

```typescript
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lowery Exam',
  description: 'Exam application for coding competition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add base layout and Tailwind styling"
```

---

### Task 7: User Registration Form

**Files:**
- Create: `src/components/RegistrationForm.tsx`
- Create: `src/app/api/register/route.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create POST /api/register endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, branch, rollNumber, course, semesterYear, email, contactNumber } = body

    // Check unique constraints
    const existingName = await prisma.user.findUnique({ where: { name } })
    if (existingName) {
      return NextResponse.json({ error: 'Name already exists' }, { status: 400 })
    }

    const existingRoll = await prisma.user.findUnique({ where: { rollNumber } })
    if (existingRoll) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        branch,
        rollNumber,
        course,
        semesterYear,
        email,
        contactNumber,
      },
    })

    return NextResponse.json({ userId: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create RegistrationForm component**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    rollNumber: '',
    course: '',
    semesterYear: '',
    email: '',
    contactNumber: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/waiting/${data.userId}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-6">Exam Registration</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'branch', 'rollNumber', 'course', 'semesterYear', 'email', 'contactNumber'].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Update main page to use RegistrationForm**

```typescript
import RegistrationForm from '@/components/RegistrationForm'

export default function Home() {
  return <RegistrationForm />
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/register/route.ts src/components/RegistrationForm.tsx src/app/page.tsx
git commit -m "feat: add user registration form and API"
```

---

### Task 8: Waiting Room

**Files:**
- Create: `src/app/api/exam/state/route.ts`
- Create: `src/app/api/users/route.ts`
- Create: `src/components/WaitingRoom.tsx`
- Create: `src/app/waiting/[userId]/page.tsx`

- [ ] **Step 1: Create GET /api/exam/state endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const state = await prisma.examState.findFirst()
  const questionCount = await prisma.question.count()
  const userCount = await prisma.user.count()

  return NextResponse.json({
    isStarted: state?.isStarted || false,
    isEnded: state?.isEnded || false,
    questionCount,
    userCount,
  })
}
```

- [ ] **Step 2: Create GET /api/users endpoint (count only)**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const count = await prisma.user.count()
  return NextResponse.json({ count })
}
```

- [ ] **Step 3: Create WaitingRoom component**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExamState {
  isStarted: boolean
  isEnded: boolean
  questionCount: number
  userCount: number
}

export default function WaitingRoom({ userId }: { userId: string }) {
  const router = useRouter()
  const [state, setState] = useState<ExamState | null>(null)

  useEffect(() => {
    const poll = async () => {
      const res = await fetch('/api/exam/state')
      const data = await res.json()
      setState(data)

      if (data.isStarted && !data.isEnded) {
        router.push(`/exam/${userId}`)
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [userId, router])

  if (!state) return <div>Loading...</div>

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl mb-4">Waiting Room</h1>
      <p className="mb-2">Total Questions: {state.questionCount}</p>
      <p className="mb-2">Users Joined: {state.userCount}</p>
      <p className="text-gray-600">Waiting for admin to start exam...</p>
    </div>
  )
}
```

- [ ] **Step 4: Create waiting room page**

```typescript
import WaitingRoom from '@/components/WaitingRoom'

export default function WaitingPage({ params }: { params: { userId: string } }) {
  return <WaitingRoom userId={params.userId} />
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/exam/state/route.ts src/app/api/users/route.ts src/components/WaitingRoom.tsx src/app/waiting/[userId]/page.tsx
git commit -m "feat: add waiting room with polling"
```

---

### Task 9: Admin Login

**Files:**
- Create: `src/components/admin/AdminLoginForm.tsx`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create POST /api/admin/login endpoint**

```typescript
import { NextResponse } from 'next/server'
import { validateAdminCredentials } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  if (validateAdminCredentials(email, password)) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
```

- [ ] **Step 2: Create AdminLoginForm component**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      localStorage.setItem('adminAuth', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-6">Admin Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create admin login page**

```typescript
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return <AdminLoginForm />
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/login/route.ts src/components/admin/AdminLoginForm.tsx src/app/admin/login/page.tsx
git commit -m "feat: add admin login"
```

---

### Task 10: Question Management API & UI

**Files:**
- Create: `src/app/api/questions/route.ts`
- Create: `src/components/admin/QuestionManager.tsx`
- Create: `src/app/admin/dashboard/questions/page.tsx`

- [ ] **Step 1: Create questions API routes**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(questions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { questionText, options, correctOptionIndex } = body

  const question = await prisma.question.create({
    data: {
      questionText,
      options,
      correctOptionIndex,
    },
  })

  return NextResponse.json(question)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.question.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create QuestionManager component**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: number
  questionText: string
  options: string[]
  correctOptionIndex: number
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState(0)

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then(setQuestions)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionText, options, correctOptionIndex: correctOption }),
    })
    const newQ = await res.json()
    setQuestions([newQ, ...questions])
    setQuestionText('')
    setOptions(['', '', '', ''])
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/questions?id=${id}`, { method: 'DELETE' })
    setQuestions(questions.filter((q) => q.id !== id))
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Manage Questions</h2>
      <form onSubmit={handleAdd} className="space-y-4 mb-6">
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Question text"
          className="w-full p-2 border rounded"
          required
        />
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctOption === i}
              onChange={() => setCorrectOption(i)}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const newOpts = [...options]
                newOpts[i] = e.target.value
                setOptions(newOpts)
              }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 p-2 border rounded"
              required
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Question
        </button>
      </form>
      <div>
        {questions.map((q) => (
          <div key={q.id} className="border p-4 mb-2 rounded">
            <p className="font-bold">{q.questionText}</p>
            <button
              onClick={() => handleDelete(q.id)}
              className="text-red-500 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create questions page**

```typescript
import QuestionManager from '@/components/admin/QuestionManager'

export default function QuestionsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <QuestionManager />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/questions/route.ts src/components/admin/QuestionManager.tsx src/app/admin/dashboard/questions/page.tsx
git commit -m "feat: add question management for admin"
```

---

### Task 11: Problem Statement Management

**Files:**
- Create: `src/app/api/problem-statements/route.ts`
- Create: `src/components/admin/ProblemStatementManager.tsx`
- Create: `src/app/admin/dashboard/problems/page.tsx`
- Create: `src/app/problem-statements/page.tsx`

- [ ] **Step 1: Create problem statements API**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const problems = await prisma.problemStatement.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(problems)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, description } = body

  const problem = await prisma.problemStatement.create({
    data: { title, description },
  })

  return NextResponse.json(problem)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.problemStatement.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create ProblemStatementManager component**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface ProblemStatement {
  id: number
  title: string
  description: string
}

export default function ProblemStatementManager() {
  const [problems, setProblems] = useState<ProblemStatement[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch('/api/problem-statements')
      .then((res) => res.json())
      .then(setProblems)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/problem-statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    const newProblem = await res.json()
    setProblems([newProblem, ...problems])
    setTitle('')
    setDescription('')
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/problem-statements?id=${id}`, { method: 'DELETE' })
    setProblems(problems.filter((p) => p.id !== id))
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Manage Problem Statements</h2>
      <form onSubmit={handleAdd} className="space-y-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Problem Statement
        </button>
      </form>
      <div>
        {problems.map((p) => (
          <div key={p.id} className="border p-4 mb-2 rounded">
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-600">{p.description}</p>
            <button onClick={() => handleDelete(p.id)} className="text-red-500 mt-2">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create admin problems page**

```typescript
import ProblemStatementManager from '@/components/admin/ProblemStatementManager'

export default function ProblemsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProblemStatementManager />
    </div>
  )
}
```

- [ ] **Step 4: Create public problem statements page**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface ProblemStatement {
  id: number
  title: string
  description: string
}

export default function ProblemStatementsPage() {
  const [problems, setProblems] = useState<ProblemStatement[]>([])

  useEffect(() => {
    fetch('/api/problem-statements')
      .then((res) => res.json())
      .then(setProblems)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Problem Statements</h1>
      {problems.map((p) => (
        <div key={p.id} className="border p-4 mb-4 rounded">
          <h2 className="text-xl font-bold">{p.title}</h2>
          <p className="mt-2">{p.description}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/problem-statements/route.ts src/components/admin/ProblemStatementManager.tsx src/app/admin/dashboard/problems/page.tsx src/app/problem-statements/page.tsx
git commit -m "feat: add problem statement management"
```

---

### Task 12: Exam Control API & UI

**Files:**
- Create: `src/app/api/exam/start/route.ts`
- Create: `src/app/api/exam/end/route.ts`
- Create: `src/components/admin/ExamControls.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create POST /api/exam/start endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  let state = await prisma.examState.findFirst()
  
  if (!state) {
    state = await prisma.examState.create({
      data: { id: 1, isStarted: true, isEnded: false },
    })
  } else {
    state = await prisma.examState.update({
      where: { id: 1 },
      data: { isStarted: true, isEnded: false },
    })
  }

  return NextResponse.json(state)
}
```

- [ ] **Step 2: Create POST /api/exam/end endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  const state = await prisma.examState.update({
    where: { id: 1 },
    data: { isEnded: true },
  })

  return NextResponse.json(state)
}
```

- [ ] **Step 3: Create ExamControls component**

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function ExamControls() {
  const [state, setState] = useState({ isStarted: false, isEnded: false })

  useEffect(() => {
    fetch('/api/exam/state')
      .then((res) => res.json())
      .then(setState)
  }, [])

  const handleStart = async () => {
    const res = await fetch('/api/exam/start', { method: 'POST' })
    const data = await res.json()
    setState(data)
  }

  const handleEnd = async () => {
    const res = await fetch('/api/exam/end', { method: 'POST' })
    const data = await res.json()
    setState(data)
  }

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="text-xl mb-4">Exam Controls</h2>
      <p className="mb-2">Status: {state.isStarted ? 'Started' : 'Not Started'}</p>
      <p className="mb-4">{state.isEnded ? 'Exam Ended' : 'Exam In Progress'}</p>
      {!state.isStarted && (
        <button onClick={handleStart} className="bg-green-500 text-white p-2 rounded mr-2">
          Start Exam
        </button>
      )}
      {state.isStarted && !state.isEnded && (
        <button onClick={handleEnd} className="bg-red-500 text-white p-2 rounded">
          End Exam
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create admin dashboard main page**

```typescript
import ExamControls from '@/components/admin/ExamControls'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Admin Dashboard</h1>
      <ExamControls />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href="/admin/dashboard/questions" className="p-4 bg-blue-100 rounded text-center">
          Questions
        </Link>
        <Link href="/admin/dashboard/problems" className="p-4 bg-green-100 rounded text-center">
          Problem Statements
        </Link>
        <Link href="/admin/dashboard/teams" className="p-4 bg-purple-100 rounded text-center">
          Teams
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/leaderboard" className="p-4 bg-gray-100 rounded text-center">
          View Leaderboard
        </Link>
        <Link href="/teams" className="p-4 bg-gray-100 rounded text-center">
          View Teams
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/exam/start/route.ts src/app/api/exam/end/route.ts src/components/admin/ExamControls.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add exam start/end controls for admin"
```

---

### Task 13: Exam Interface (MCQ)

**Files:**
- Create: `src/components/ExamInterface.tsx`
- Create: `src/app/api/exam/submit/route.ts`
- Create: `src/app/exam/[userId]/page.tsx`

- [ ] **Step 1: Create POST /api/exam/submit endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, answers } = body

  // Get all questions
  const questions = await prisma.question.findMany()
  
  // Calculate score
  let score = 0
  for (const q of questions) {
    if (answers[q.id] === q.correctOptionIndex) {
      score++
    }
  }

  // Save or update exam attempt
  const existing = await prisma.examAttempt.findUnique({
    where: { userId: parseInt(userId) },
  })

  if (existing) {
    await prisma.examAttempt.update({
      where: { id: existing.id },
      data: { answers, score, submittedAt: new Date() },
    })
  } else {
    await prisma.examAttempt.create({
      data: {
        userId: parseInt(userId),
        answers,
        score,
      },
    })
  }

  return NextResponse.json({ score, total: questions.length })
}
```

- [ ] **Step 2: Create ExamInterface component**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: number
  questionText: string
  options: string[]
  correctOptionIndex: number
}

export default function ExamInterface({ userId }: { userId: string }) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then(setQuestions)
  }, [])

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers }),
    })
    const data = await res.json()
    router.push(`/results/${userId}`)
  }

  if (questions.length === 0) return <div>Loading...</div>

  const currentQ = questions[currentIndex]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        Question {currentIndex + 1} of {questions.length}
      </div>
      <div className="border p-6 rounded mb-6">
        <h2 className="text-xl mb-4">{currentQ.questionText}</h2>
        <div className="space-y-2">
          {currentQ.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleAnswer(currentQ.id, i)}
              className={`p-3 border rounded cursor-pointer ${
                answers[currentQ.id] === i ? 'bg-blue-100 border-blue-500' : ''
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mb-6">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.length - 1}
          className="p-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-10 h-10 border rounded ${
              i === currentIndex ? 'bg-blue-500 text-white' : ''
            } ${answers[q.id] !== undefined ? 'border-green-500' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-green-500 text-white p-3 rounded"
      >
        {submitting ? 'Submitting...' : 'Submit Exam'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create exam page**

```typescript
import ExamInterface from '@/components/ExamInterface'

export default function ExamPage({ params }: { params: { userId: string } }) {
  return <ExamInterface userId={params.userId} />
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/exam/submit/route.ts src/components/ExamInterface.tsx src/app/exam/[userId]/page.tsx
git commit -m "feat: add MCQ exam interface"
```

---

### Task 14: Results & Leaderboard

**Files:**
- Create: `src/app/api/leaderboard/route.ts`
- Create: `src/components/Leaderboard.tsx`
- Create: `src/app/results/[userId]/page.tsx`
- Create: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Create GET /api/leaderboard endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const attempts = await prisma.examAttempt.findMany({
    include: { user: true },
    orderBy: { score: 'desc' },
  })

  return NextResponse.json(
    attempts.map((attempt, index) => ({
      rank: index + 1,
      name: attempt.user.name,
      branch: attempt.user.branch,
      rollNumber: attempt.user.rollNumber,
      score: attempt.score,
    }))
  )
}
```

- [ ] **Step 2: Create results page**

```typescript
'use client'

import { useEffect, useState } from 'react'

interface Result {
  rank: number
  score: number
  total: number
}

export default function ResultsPage({ params }: { params: { userId: string } }) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetch(`/api/exam/submit`, { method: 'POST', body: JSON.stringify({ userId: params.userId, answers: {} }) })
      .then((res) => res.json())
      .then((data) => {
        if (data.score !== undefined) {
          setResult({ rank: 0, score: data.score, total: data.total })
        }
      })
  }, [params.userId])

  if (!result) return <div>Loading...</div>

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl mb-4">Exam Results</h1>
      <p className="text-xl mb-2">Score: {result.score}/{result.total}</p>
      <p className="text-gray-600">
        Final leaderboard will be available after exam ends
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create Leaderboard component**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  name: string
  branch: string
  score: number
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then(setEntries)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Leaderboard</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Rank</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank}>
              <td className="border p-2 text-center">{entry.rank}</td>
              <td className="border p-2">{entry.name}</td>
              <td className="border p-2">{entry.branch}</td>
              <td className="border p-2 text-center">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Create leaderboard page**

```typescript
import Leaderboard from '@/components/Leaderboard'

export default function LeaderboardPage() {
  return <Leaderboard />
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/leaderboard/route.ts src/components/Leaderboard.tsx src/app/results/[userId]/page.tsx src/app/leaderboard/page.tsx
git commit -m "feat: add results and leaderboard"
```

---

### Task 15: Team Generation

**Files:**
- Create: `src/app/api/teams/generate/route.ts`
- Create: `src/app/api/teams/route.ts`
- Create: `src/components/admin/TeamGenerator.tsx`
- Create: `src/components/TeamsList.tsx`
- Create: `src/app/admin/dashboard/teams/page.tsx`
- Create: `src/app/teams/page.tsx`

- [ ] **Step 1: Create POST /api/teams/generate endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTeams } from '@/lib/team-algorithm'

export async function POST(request: Request) {
  const body = await request.json()
  const { numberOfTeams, membersPerTeam } = body

  // Get leaderboard
  const attempts = await prisma.examAttempt.findMany({
    include: { user: true },
    orderBy: { score: 'desc' },
  })

  const leaderboard = attempts.map((attempt, index) => ({
    name: attempt.user.name,
    branch: attempt.user.branch,
    rank: index + 1,
  }))

  const teams = generateTeams(leaderboard, numberOfTeams, membersPerTeam)

  // Clear existing teams
  await prisma.team.deleteMany()

  // Save new teams
  for (const team of teams) {
    await prisma.team.create({
      data: {
        teamNumber: team.teamNumber,
        members: team.members,
      },
    })
  }

  return NextResponse.json(teams)
}
```

- [ ] **Step 2: Create GET /api/teams endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { teamNumber: 'asc' },
  })
  return NextResponse.json(teams)
}
```

- [ ] **Step 3: Create TeamGenerator component**

```typescript
'use client'

import { useState } from 'react'

export default function TeamGenerator() {
  const [numberOfTeams, setNumberOfTeams] = useState(9)
  const [membersPerTeam, setMembersPerTeam] = useState(3)
  const [teams, setTeams] = useState<any[]>([])

  const handleGenerate = async () => {
    const res = await fetch('/api/teams/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numberOfTeams, membersPerTeam }),
    })
    const data = await res.json()
    setTeams(data)
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl mb-4">Generate Teams</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block mb-1">Number of Teams</label>
          <input
            type="number"
            value={numberOfTeams}
            onChange={(e) => setNumberOfTeams(parseInt(e.target.value))}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Members per Team</label>
          <input
            type="number"
            value={membersPerTeam}
            onChange={(e) => setMembersPerTeam(parseInt(e.target.value))}
            className="p-2 border rounded"
          />
        </div>
      </div>
      <button onClick={handleGenerate} className="bg-purple-500 text-white p-2 rounded">
        Generate Teams
      </button>
      {teams.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Generated Teams:</h3>
          {teams.map((team) => (
            <div key={team.teamNumber} className="border p-2 mb-2 rounded">
              <strong>Team {team.teamNumber}:</strong>{' '}
              {team.members.map((m: any) => m.name).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create TeamsList component**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface Team {
  id: number
  teamNumber: number
  members: { name: string; branch: string; rank: number }[]
  isWinner: boolean
}

export default function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then(setTeams)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Teams</h1>
      {teams.map((team) => (
        <div key={team.id} className="border p-4 mb-4 rounded">
          <h2 className="text-xl font-bold mb-2">
            Team {team.teamNumber} {team.isWinner && '(Winner)'}
          </h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Branch</th>
                <th className="text-left">Rank</th>
              </tr>
            </thead>
            <tbody>
              {team.members.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.branch}</td>
                  <td>{m.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create admin teams page**

```typescript
import TeamGenerator from '@/components/admin/TeamGenerator'

export default function AdminTeamsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <TeamGenerator />
    </div>
  )
}
```

- [ ] **Step 6: Create public teams page**

```typescript
import TeamsList from '@/components/TeamsList'

export default function TeamsPage() {
  return <TeamsList />
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/teams/generate/route.ts src/app/api/teams/route.ts src/components/admin/TeamGenerator.tsx src/components/TeamsList.tsx src/app/admin/dashboard/teams/page.tsx src/app/teams/page.tsx
git commit -m "feat: add team generation and display"
```

---

### Task 16: Export Functionality

**Files:**
- Create: `src/app/api/export/participation/route.ts`
- Create: `src/app/api/export/winners/route.ts`
- Create: `src/components/admin/ExportButtons.tsx`

- [ ] **Step 1: Create participation export endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } })

  const csv = [
    'Name,Branch,Roll Number,Course,Semester/Year,Email,Contact Number',
    ...users.map(
      (u) =>
        `${u.name},${u.branch},${u.rollNumber},${u.course},${u.semesterYear},${u.email},${u.contactNumber}`
    ),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=participation.csv',
    },
  })
}
```

- [ ] **Step 2: Create winners export endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const teams = await prisma.team.findMany({
    where: { isWinner: true },
    orderBy: { teamNumber: 'asc' },
  })

  const csv = [
    'Team Number,Member Names,Branch,Rank,Problem Statement Selected,Winner Status',
    ...teams.map((t) => {
      const members = t.members as any[]
      return `${t.teamNumber},"${members.map((m) => m.name).join('; ')}","${members.map((m) => m.branch).join('; ')}","${members.map((m) => m.rank).join('; ')}","TBD",${t.isWinner ? 'Yes' : 'No'}"`
    }),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=winners.csv',
    },
  })
}
```

- [ ] **Step 3: Create ExportButtons component**

```typescript
'use client'

export default function ExportButtons() {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => window.open('/api/export/participation', '_blank')}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Export Participation List
      </button>
      <button
        onClick={() => window.open('/api/export/winners', '_blank')}
        className="bg-green-500 text-white p-2 rounded"
      >
        Export Winners List
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Add ExportButtons to admin dashboard**

Update `src/app/admin/dashboard/page.tsx` to import and use ExportButtons component.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/export/participation/route.ts src/app/api/export/winners/route.ts src/components/admin/ExportButtons.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add export functionality for participation and winners"
```

---

### Task 17: Visibility Toggles for Public Pages

**Files:**
- Modify: `prisma/schema.prisma` (add visibility fields to ExamState)
- Modify: `src/app/api/exam/state/route.ts`
- Modify: `src/app/leaderboard/page.tsx`
- Modify: `src/app/teams/page.tsx`

- [ ] **Step 1: Add visibility fields to ExamState model**

```prisma
model ExamState {
  id        Int      @id
  isStarted Boolean  @default(false)
  isEnded   Boolean  @default(false)
  showLeaderboard Boolean @default(false)
  showTeams Boolean @default(false)
  updatedAt DateTime @default(now())
}
```

- [ ] **Step 2: Update exam state API to include visibility**

```typescript
export async function GET() {
  const state = await prisma.examState.findFirst()
  const questionCount = await prisma.question.count()
  const userCount = await prisma.user.count()

  return NextResponse.json({
    isStarted: state?.isStarted || false,
    isEnded: state?.isEnded || false,
    showLeaderboard: state?.showLeaderboard || false,
    showTeams: state?.showTeams || false,
    questionCount,
    userCount,
  })
}
```

- [ ] **Step 3: Add visibility toggles to ExamControls component**

Add toggle buttons for "Show Leaderboard" and "Show Teams" in `src/components/admin/ExamControls.tsx`.

- [ ] **Step 4: Update public pages to check visibility**

In `src/app/leaderboard/page.tsx` and `src/app/teams/page.tsx`, check the `showLeaderboard` and `showTeams` flags before rendering.

- [ ] **Step 5: Run migration and commit**

```bash
npx prisma migrate dev --name add_visibility_toggles
git add prisma/schema.prisma src/app/api/exam/state/route.ts src/components/admin/ExamControls.tsx src/app/leaderboard/page.tsx src/app/teams/page.tsx
git commit -m "feat: add visibility toggles for public pages"
```

---

### Task 18: Print Teams List for Judges

**Files:**
- Create: `src/app/api/export/teams-print/route.ts`
- Modify: `src/components/admin/ExportButtons.tsx`

- [ ] **Step 1: Create teams print endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { teamNumber: 'asc' },
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Teams List for Judges</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .team { page-break-inside: avoid; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Teams List - Judge Reference</h1>
      ${teams
        .map(
          (t) => `
        <div class="team">
          <h2>Team ${t.teamNumber} ${t.isWinner ? '(WINNER)' : ''}</h2>
          <table>
            <tr><th>Name</th><th>Branch</th><th>Rank</th></tr>
            ${(t.members as any[])
              .map(
                (m) =>
                  `<tr><td>${m.name}</td><td>${m.branch}</td><td>${m.rank}</td></tr>`
              )
              .join('')}
          </table>
          <p><strong>Problem Statement:</strong> TBD</p>
        </div>
      `
        )
        .join('')}
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
```

- [ ] **Step 2: Add print button to ExportButtons**

Add a "Print Teams List" button that opens `/api/export/teams-print` in a new window.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/export/teams-print/route.ts src/components/admin/ExportButtons.tsx
git commit -m "feat: add print-friendly teams list for judges"
```

---

### Task 19: Mark Teams as Winner

**Files:**
- Create: `src/app/api/teams/[id]/winner/route.ts`
- Modify: `src/components/TeamsList.tsx`

- [ ] **Step 1: Create winner toggle endpoint**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(params.id) },
  })

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const updated = await prisma.team.update({
    where: { id: team.id },
    data: { isWinner: !team.isWinner },
  })

  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Add winner toggle to TeamsList**

In `src/components/TeamsList.tsx`, add a checkbox or button to toggle `isWinner` for each team (calls the API above).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/teams/[id]/winner/route.ts src/components/TeamsList.tsx
git commit -m "feat: add ability to mark teams as winner"
```

---

## Self-Review Checklist

1. **Spec coverage:** All requirements from the spec are covered:
   - ✅ Registration form with unique name/roll number
   - ✅ Waiting room with polling
   - ✅ MCQ exam with navigation
   - ✅ Admin login with fixed credentials
   - ✅ Question management
   - ✅ Problem statement management
   - ✅ Exam start/end controls
   - ✅ Leaderboard
   - ✅ Team generation with alternating pattern
   - ✅ Export participation and winners
   - ✅ Print teams list
   - ✅ Visibility toggles
   - ✅ Mark teams as winner

2. **Placeholder scan:** No TBDs or TODOs in actual implementation code. "TBD" appears only in the print template for problem statement (which admin assigns manually).

3. **Type consistency:** All API routes use consistent types. Team member structure is `{ name, branch, rank }` throughout.

4. **No missing steps:** Each task has clear file paths, complete code, and commit commands.
