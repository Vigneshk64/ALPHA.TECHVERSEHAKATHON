# Hospital Billing Transparency System - Architecture

## System Overview

The Hospital Billing Transparency System is a modern web application built with Next.js that provides real-time, transparent medical billing with AI-powered explanations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browsers                             │
├─────────────┬──────────────────┬─────────────────────────────────┤
│  Patient    │     Doctor       │    Administrator/Billing         │
│  View (/    │     View (/      │    View (/billing)              │
│  patient)   │     doctor)      │                                  │
└─────────────┴──────────────────┴─────────────────────────────────┘
       │                │                      │
       └────────────────┼──────────────────────┘
                        │
                 Next.js App Router
                 (Pages & API Routes)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───────────┐  ┌────────────┐  ┌──────────┐
    │ Firestore │  │ OpenRouter │  │ Tailwind │
    │ Listener  │  │   API      │  │   CSS    │
    │ (Real-    │  │ (Google    │  │ (UI      │
    │  time)    │  │  Gemma 2)  │  │  Styling)│
    └───────────┘  └────────────┘  └──────────┘
```

## Technology Stack Details

### Frontend Layer
- **Framework:** Next.js 14 (React 19 compatible)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + Context
- **Build Tool:** Turbopack (Next.js)

### Backend Layer
- **API Routes:** Next.js serverless functions
- **Database:** Firebase Firestore (NoSQL)
- **AI Integration:** OpenRouter API
- **Authentication:** Firebase Auth (optional)

### Data Flow

```
Doctor Adds Charge
        ↓
POST /doctor/page.tsx → addDoc(Firestore)
        ↓
Firestore Triggers Update
        ↓
Patient View useBillListener Hook
        ↓
onSnapshot Listener Fires
        ↓
UI Re-renders with New Data
```

## Component Architecture

### Home Page (`/page.tsx`)
- Landing page component
- Navigation to all views
- Feature showcase
- Technology stack display
- No data fetching required

### Patient View (`/patient/page.tsx`)
```
PatientPage
├── useBillListener Hook
│   └── Firestore onSnapshot listener
├── Running Total Card (Blue gradient)
├── Bill Items List
│   └── BillItem Card
│       ├── Procedure Name
│       ├── Cost
│       ├── Reason/Notes
│       ├── "What is this?" Button
│       └── AI Explanation (Optional)
└── Demo Info Box
```

**Key Features:**
- Real-time data via Firestore listener
- AI explanation fetch on button click
- Local state for expanded items
- Animation on new charges
- Responsive grid layout

### Doctor View (`/doctor/page.tsx`)
```
DoctorPage
├── Form Section
│   ├── Patient ID Input
│   ├── Procedure Selector (Grid of buttons)
│   ├── Custom Procedure Input
│   ├── Cost Input (number field)
│   ├── Reason/Notes Textarea
│   └── Submit Button
└── Success/Error Messages
```

**Key Features:**
- Common procedures pre-populated
- Custom procedure support
- Form validation
- Error handling
- Success notification
- Loading state management

### Billing Summary (`/billing/page.tsx`)
```
BillingSummaryPage
├── Header (with Print/Download buttons)
├── Hospital Info
├── Bill Metadata
├── Charges Table
│   └── Rows: Procedure, Reason, Date, Cost
├── Transparency Guarantee Section
├── Total Calculation
├── Payment Methods
└── Footer
```

**Key Features:**
- Professional table layout
- Print-friendly styling
- CSV export functionality
- Responsive design
- No hidden fees guarantee message

## Data Structures

### BillItem (TypeScript)
```typescript
interface BillItem {
  id: string;                          // Firestore document ID
  procedure: string;                   // Procedure name
  cost: number;                        // Cost in dollars
  reason: string;                      // Why this charge
  timestamp: number;                   // When added
  status?: 'pending' | 'completed';   // Charge status
}
```

### PatientBill (TypeScript)
```typescript
interface PatientBill {
  patientId: string;                   // Patient ID
  items: BillItem[];                   // All charges
  total: number;                       // Calculated total
  lastUpdated: number;                 // Last update time
}
```

## Firebase Firestore Structure

### Collection: `bills`
```
bills/
├── auto-generated-doc-id-1
│   ├── patientId: "patient-demo-001"
│   ├── procedure: "Blood Test"
│   ├── cost: 150.00
│   ├── reason: "Annual checkup lab work"
│   ├── timestamp: 1715000000000
│   └── status: "completed"
│
├── auto-generated-doc-id-2
│   ├── patientId: "patient-demo-001"
│   ├── procedure: "X-Ray"
│   ├── cost: 250.00
│   ├── reason: "Chest imaging"
│   ├── timestamp: 1715100000000
│   └── status: "completed"
```

## API Endpoints

### POST `/api/explain`
**Purpose:** Get AI explanation for medical procedure

**Request:**
```javascript
{
  procedure: "MRI Scan"
}
```

**Response:**
```javascript
{
  explanation: "An MRI scan uses strong magnets and radio waves..."
}
```

**Flow:**
1. Receive procedure name
2. Call OpenRouter API with Google Gemma 2 model
3. Prompt: "Explain in simple language for non-medical person"
4. Return explanation
5. Error handling for API failures

## Hooks

### useBillListener
**Location:** `lib/hooks.ts`

```typescript
export function useBillListener(patientId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up Firestore listener
    const q = query(
      collection(db, 'bills'),
      where('patientId', '==', patientId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Process changes
      const billItems = [];
      snapshot.forEach((doc) => {
        billItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(billItems.sort(...));
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [patientId]);

  return { items, total, loading, error };
}
```

**Features:**
- Real-time Firestore listener
- Automatic cleanup
- Error handling
- Sorting by timestamp
- Total calculation

## Firebase Configuration

### Setup Steps
1. Initialize Firebase app
2. Get Firestore instance
3. Set up security rules
4. Create "bills" collection

### lib/firebase.ts
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## OpenRouter AI Integration

### Model: Google Gemma 2 27B IT
**Why This Model:**
- Free tier available
- Good at plain language explanations
- Fast response times
- Instruction-tuned for clarity

### Prompt Engineering
```
System: You are a healthcare educator explaining medical procedures.
User: "Explain the following medical procedure in simple, easy-to-understand 
language for someone without medical knowledge. Avoid all medical jargon. 
Keep it to 2-3 sentences.\n\nProcedure: [PROCEDURE_NAME]"
```

### Error Handling
- API key validation
- Rate limit handling
- Timeout management
- User-friendly error messages

## Real-time Update Flow

```
Step 1: Doctor adds charge
─────────────────────────
Doctor fills form → Click "Add Charge" → Form validation

Step 2: Save to Firestore
─────────────────────────
addDoc(collection(db, 'bills'), {
  patientId, procedure, cost, reason, timestamp, status
})

Step 3: Patient's hook detects change
────────────────────────────────────────
onSnapshot listener fires automatically
snapshot.forEach() processes changes
State updated with new bill item

Step 4: Patient UI updates
──────────────────────────
React component re-renders
New charge appears in list
Running total recalculated
Animation plays on new item
```

## UI/UX Design Decisions

### Color Scheme
- **Blue (#2563eb):** Medical trust, primary actions
- **Green (#16a34a):** Positive confirmations
- **Purple (#9333ea):** Billing section
- **White (#ffffff):** Clean backgrounds
- **Gray (#6b7280):** Secondary text

### Typography
- **Headings:** Bold, 24-48px (size depends on hierarchy)
- **Body:** Regular, 16px (readable)
- **Small:** 12-14px (secondary info)
- **Font:** System fonts (fast loading)

### Responsive Breakpoints
- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** > 1024px (full layout)

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance
- Focus states visible

## Performance Optimizations

### Frontend
- Lazy loading components
- CSS-in-JS with Tailwind
- Minimal JavaScript
- Efficient re-renders with React hooks
- Server-side rendering with Next.js

### Backend
- Firestore indexes on patientId
- Firestore query optimization
- API response caching
- Minimal data transfer

### Database
- Document structure optimized
- Timestamp indexing
- Efficient query patterns
- Real-time listeners (not polling)

## Security Considerations

### Development
- Environment variables for secrets
- No sensitive data in code
- Firebase rules in development

### Production
- Firebase Authentication required
- Row-level security via Firebase Rules
- API key restrictions
- HTTPS only
- CORS configuration

## Testing Strategy

### Unit Tests (Recommended)
- Hook tests: useBillListener
- API route tests: /api/explain
- Component tests: individual pages

### Integration Tests (Recommended)
- Full workflow: Add charge → See in patient view
- Real-time updates
- Error handling

### E2E Tests (Recommended)
- User flows in Playwright/Cypress
- Cross-browser testing
- Mobile responsiveness

## Deployment Checklist

- [ ] Firebase production project setup
- [ ] Firestore security rules finalized
- [ ] OpenRouter API key configured
- [ ] Environment variables set
- [ ] Build test: `npm run build`
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to Vercel/hosting
- [ ] SSL certificate verified
- [ ] Monitoring setup

## Scalability Considerations

### Current Capacity
- Works for small to medium clinics
- ~1000 patients
- ~10,000 bills

### To Scale Further
1. **Multi-region Firebase deployment**
2. **Caching layer (Redis)**
3. **Database sharding by patient**
4. **CDN for static assets**
5. **API rate limiting**
6. **Load balancing**

## Future Enhancements

1. **Authentication & Authorization**
   - Firebase Auth
   - Doctor/Patient roles
   - Multi-clinic support

2. **Notifications**
   - Email notifications
   - SMS alerts
   - In-app notifications

3. **Advanced Features**
   - Insurance claim integration
   - Payment gateway (Stripe)
   - Appointment scheduling
   - Patient portal

4. **Analytics**
   - Usage metrics
   - AI explanation analytics
   - Bill patterns

5. **Internationalization**
   - Multi-language support
   - Currency conversion
   - Localization

## Monitoring & Logging

### Current Setup
- Browser console logging
- Firebase console errors
- API error responses

### Recommended for Production
- Sentry for error tracking
- LogRocket for session replay
- CloudFlare Analytics
- Firebase Performance Monitoring

---

**Built with modern web technologies for healthcare transparency** 🏥
