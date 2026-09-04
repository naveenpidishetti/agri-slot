# AgriSlot – AI-Powered Smart Queue and Slot Booking System

> **Eliminating Long Queues, Mandi Traffic Congestion, and Waiting Times at Agricultural Procurement Centers**

AgriSlot is an end-to-end full-stack digital procurement and queue management system designed for farmers, procurement center officers, and agricultural marketing boards. Built with **React 18 + TypeScript + Tailwind CSS**, **Node.js + Express REST API**, and a relational database architecture following the **Google Stitch** Dark Emerald Agricultural design system (`#0A120C`, `#122217`, `#22C55E`, `#F59E0B`).

---

## 🌾 Key Platform Capabilities

### 1. 🚜 Farmer Experience
- **7-Step Intelligent Slot Booking**: Guided wizard (Crop → Quantity → Village Location → Procurement Center → AI Auto-Pick → Time Slot → Confirmation).
- **Instant Digital QR Token**: Generates unique verified passes (e.g. `AGR-2026-00124`) with scannable QR codes for weighbridge entry.
- **Live Queue Polling & Tracker**: Displays exact number of farmers ahead, estimated waiting countdown, and arrival alerts.
- **Multilingual KisanAI Assistant**: Floating bilingual AI assistant supporting **Telugu (తెలుగు)**, **Hindi (हिंदी)**, and **English**, with **Speech-to-Text (Voice)** and **Text-to-Speech** assistance.
- **Produce Quality Pre-Scanner**: Preliminary computer-vision visual inspection for grain moisture, discoloration, damaged grains, and foreign matter.
- **Calendar & Rescheduling**: Reschedule or cancel slots with instant capacity re-allocation.

### 2. 🏢 Procurement Staff Operations
- **Live Mandi Operations Hub**: Real-time counter of today's arrivals, active weighbridge processing, and completed procurements.
- **Token & QR Check-In**: One-click farmer arrival check-in.
- **Weighbridge & Moisture Recording**: Record official weighbridge net weight and moisture readings with receipt issuance.

### 3. ⚙️ Administrator Oversight
- **Real-Time Analytics & KPI Dashboard**: Capacity utilization rates, hourly traffic curves, and crop volume breakdowns.
- **Procurement Center & Crop Management**: Register new mandi centers, set daily limits, and update government Minimum Support Price (MSP) rates.

---

## 🚀 Demo Accounts & Credentials

| Role | Mobile Number | Password | Name / Details |
|---|---|---|---|
| **🌾 Farmer (Demo 1)** | `9876543210` | `farmer123` | Ramesh Reddy (Shamshabad, Ranga Reddy) |
| **🌾 Farmer (Demo 2)** | `9876543211` | `farmer123` | Suresh Kumar Patel (Medchal) |
| **🏢 Procurement Staff** | `9876543220` | `staff123` | K. Venkateshwarlu (Senior Procurement Officer) |
| **⚙️ Admin** | `9876543230` | `admin123` | Dr. Ananya Sharma (System Administrator) |

> *Tip: You can also use the one-click "Role: Farmer / Staff / Admin" switcher in the top navigation bar to test all personas instantly.*

---

## 🛠️ Quick Start & Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start the Backend API Server
```bash
npm run server
```
*Backend API will run on `http://localhost:5000` with health check at `/api/health`.*

### 2. Start the Frontend Development Server
```bash
npm run dev
```
*Vite frontend will run on `http://localhost:3000` (automatically proxied to backend).*

### 3. Production Build
```bash
npm run build
```

---

## 🧠 Modular AI Services

1. **`SlotRecommendationService` (`server/services/slotRecommendationService.js`)**:
   Multi-factor heuristic scoring algorithm evaluating center capacity remaining, distance, active queue size, and average unloading throughput.
2. **`AIChatService` (`server/services/aiChatService.js`)**:
   Context-aware conversational engine aware of farmer's active booking, token, queue position, MSP rates, and required documentation.
3. **`ProduceScannerService` (`server/services/produceScannerService.js`)**:
   Preliminary visual quality analyzer returning quality grades (`GRADE_A`, `GRADE_B`), estimated moisture, and loading recommendations with clear scientific disclaimers.

---

## 📁 Project Structure

```
agri-slot/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── server/
│   ├── index.js                  # Express API Server
│   ├── config/
│   │   ├── schema.sql            # MySQL Relational Schema
│   │   ├── seedData.js           # Comprehensive Mock Data
│   │   └── db.js                 # Unified Data Store Adapter
│   ├── middleware/
│   │   └── auth.js               # JWT & RBAC Middleware
│   ├── services/
│   │   ├── slotRecommendationService.js
│   │   ├── aiChatService.js
│   │   └── produceScannerService.js
│   └── routes/
│       ├── authRoutes.js
│       ├── centerRoutes.js
│       ├── bookingRoutes.js
│       ├── queueRoutes.js
│       ├── scannerRoutes.js
│       ├── chatRoutes.js
│       ├── adminRoutes.js
│       └── notificationRoutes.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                 # Stitch Dark Emerald Theme
    ├── types/                    # TypeScript Data Interfaces
    ├── locales/                  # English, Telugu, Hindi i18n
    ├── context/                  # AuthContext & LanguageContext
    ├── services/api.ts           # REST API Client with Offline Fallback
    └── components/
        ├── common/               # Navbar, BottomNav, Badges, Modals
        ├── public/               # LandingPage, HowItWorks, Features, Help, AuthModal
        ├── farmer/               # Dashboard, SlotBookingWizard, DigitalToken, LiveQueue, ProduceScanner, Calendar, KisanAI
        ├── staff/                # StaffDashboard, QueueManager
        └── admin/                # AdminDashboard, AnalyticsView
```
