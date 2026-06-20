# 🌍 CarbonWise AI

CarbonWise AI is a complete production-ready full-stack AI application designed to help users track, understand, and reduce their carbon footprint through intelligent insights, eco-action verification, and gamification.

## 🚀 Features

- **Carbon Footprint Engine**: Calculates daily, monthly, and annual footprint based on transportation, energy, and dietary habits.
- **AI Carbon Coach**: A Gemini-powered conversational agent that provides personalized reduction strategies.
- **Eco Action Verification**: Users upload photos of eco-friendly actions (e.g., planting trees), which are verified by Gemini Vision AI, awarding Green Points.
- **Bill & Receipt Scanner**: OCR extraction of utility bills using AI to automatically calculate the carbon impact of energy consumed.
- **Gamified Challenges**: Weekly and monthly sustainability challenges, leaderboards, and an achievement badge system.
- **Community Social Feed**: A dedicated hub where users can share their milestones, like, and comment on other eco-warriors' posts.
- **Admin Dashboard**: A moderation queue to manually review edge-case AI verifications and manage users.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL mapped with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: Vercel AI SDK, Google GenAI SDK (Gemini 1.5 Pro)

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd carbonwise-ai
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the project and provide the following keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://user:password@localhost:5432/carbonwise
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`. 
Since it's protected by Clerk, you will need to sign in/up to access `/dashboard`.

## 🎨 Design System
CarbonWise AI uses a custom dark-mode "Green sustainability theme" implemented via Tailwind CSS and `shadcn/ui`. It leverages `framer-motion` for fluid onboarding steps and dashboard transitions.
