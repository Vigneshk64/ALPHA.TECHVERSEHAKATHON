# Hospital Billing Transparency System

A modern healthcare billing platform that makes medical bills transparent, understandable, and patient-friendly.

## Problem Solved

Patients often struggle to understand hospital bills due to:
- Complex medical jargon
- Hidden or unclear costs
- No real-time bill updates
- Estimates that don't match final bills
- Lack of explanations for charges

## Solution

This system provides three integrated views:

### 1. **Patient View** (`/patient`)
- Real-time bill updates via Firebase Firestore listeners
- See all charges with procedure names and costs
- Running total always visible at the top
- **AI-Powered Explanations**: Click "What is this?" on any charge to get a plain-English explanation using Google Gemma 2 AI
- Notifications when new charges are added
- Simple, clean interface for understanding healthcare costs

### 2. **Doctor View** (`/doctor`)
- Easily add procedures and treatments to patient bills
- Choose from a curated list of common procedures
- Option to enter custom procedures
- Add cost and reason/notes for each charge
- Instant patient notification when charges are added
- Changes appear in real-time on patient's bill

### 3. **Billing Summary** (`/billing`)
- Final itemized bill with all charges
- Plain-language descriptions for every item
- "No Hidden Fees" transparency guarantee
- Print and download (CSV) functionality
- Professional billing format suitable for records and insurance

## Key Features

✅ **Real-time Updates** - Firebase Firestore listeners ensure bills update instantly
✅ **AI Explanations** - Medical jargon translated to plain English automatically
✅ **Transparency** - All charges visible upfront with clear reasons
✅ **No Hidden Fees** - Every charge listed and explained
✅ **Professional Design** - Clean, trustworthy blue and white theme
✅ **Patient-Centric** - Easy to understand for non-medical users
✅ **Printable** - Export bills for records and insurance claims

## Tech Stack

### Frontend
- **Next.js 14** - App Router for modern React framework
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Responsive, modern styling
- **React Hooks** - State management and side effects

### Backend & Data
- **Next.js API Routes** - Serverless API endpoints
- **Firebase Firestore** - Real-time database with listeners
- **OpenRouter API** - AI service integration

### AI
- **Google Gemma 2 27B IT** - Free, open-source language model for plain-language explanations
- **OpenRouter** - API gateway for model access

## Quick Start

### Installation
```bash
cd hospital-billing
npm install
```

### Configuration
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Get an OpenRouter API key at [openrouter.ai](https://openrouter.ai)
3. Update `.env.local` with your keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENROUTER_API_KEY=your_openrouter_key
```

### Run Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser

## Pages

- **Home** (`/`) - Landing page with overview
- **Patient View** (`/patient`) - Real-time bill display
- **Doctor View** (`/doctor`) - Add charges to bills
- **Billing Summary** (`/billing`) - Final bill with print/export

## Project Structure

```
app/
├── page.tsx              # Home page
├── patient/
│   └── page.tsx         # Patient bill view
├── doctor/
│   └── page.tsx         # Doctor charge entry
├── billing/
│   └── page.tsx         # Billing summary
└── api/
    └── explain/
        └── route.ts     # AI explanation endpoint

lib/
├── firebase.ts          # Firebase config
├── types.ts             # TypeScript types
└── hooks.ts             # Custom hooks
```

## API Endpoints

### POST `/api/explain`
Explains a medical procedure in plain English

**Request:**
```json
{
  "procedure": "MRI Scan"
}
```

**Response:**
```json
{
  "explanation": "An MRI scan uses strong magnets and radio waves..."
}
```

## Built With

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [OpenRouter AI](https://openrouter.ai/)
- [Google Gemma 2](https://ai.google.dev/gemma)

---

**Making Medical Billing Transparent for Healthcare Hackathon** 🏥
