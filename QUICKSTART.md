# 🚀 Quick Start Guide - Coders Adda

## Application is Running!

✅ **Backend Server**: http://localhost:4000
✅ **Frontend App**: http://localhost:3000

## Demo Login Credentials

```
Email: admin@codersadda.com
Password: admin123
```

## Available Routes

### Frontend
- `/` - Landing page
- `/login` - Login page
- `/dashboard` - Master Agent Dashboard
- `/dashboard/analytics` - Data Analytics Agent
- `/dashboard/diagnostics` - Diagnostics Agent
- `/dashboard/outreach` - Customer Outreach Agent
- `/dashboard/booking` - Service Booking Agent
- `/dashboard/feedback` - Feedback Agent
- `/dashboard/security` - Security & Compliance Agent

### Backend API Endpoints

**Master Agent**
- `GET /api/master-logs` - Decision logs and agent statuses
- `GET /api/master/stats` - Master agent statistics

**Data Analytics**
- `GET /api/telemetry` - Vehicle telemetry data
- `GET /api/telemetry/:vehicleId` - Specific vehicle data

**Diagnostics**
- `GET /api/diagnostics` - All diagnostic results
- `POST /api/diagnostics` - Run diagnostics (Zod validated)

**Customer Outreach**
- `GET /api/outreach` - All campaigns
- `GET /api/outreach/:id` - Specific campaign

**Service Booking**
- `GET /api/booking` - All bookings
- `POST /api/booking` - Create booking (Zod validated)
- `GET /api/booking/:id` - Specific booking

**Feedback**
- `GET /api/feedback` - All feedback
- `GET /api/feedback/trends` - Feedback trends

**Security**
- `GET /api/security` - Security events
- `GET /api/security/compliance` - Compliance status
- `GET /api/security/threats` - Threat intelligence

**Other**
- `GET /api/presence` - User presence/collaboration
- `POST /api/login` - Demo authentication
- `GET /health` - Health check

## Development Commands

```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run dev:server

# Run frontend only
npm run dev:web

# Build everything
npm run build
```

## Tech Stack

**Frontend**
- Next.js 14.2.5
- React 18.2.0
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- TanStack Query (Data Fetching)
- Recharts (Charts)
- Lucide React (Icons)

**Backend**
- Node.js 20
- Express
- TypeScript
- Zod (Validation)
- CORS enabled

## Features Implemented

✅ Master AI Agent orchestrator
✅ 6 Worker AI Agents (Analytics, Diagnostics, Outreach, Booking, Feedback, Security)
✅ Real-time data updates (5s polling)
✅ Demo authentication with route protection
✅ Comprehensive dashboard with sidebar navigation
✅ Interactive charts and data visualizations
✅ Responsive design with Tailwind CSS
✅ TypeScript strict mode
✅ In-memory mock data (no database required)
✅ API request validation with Zod
✅ RESTful API architecture

## Next Steps

1. Open http://localhost:3000
2. Click "Login" or navigate to /login
3. Use demo credentials to sign in
4. Explore the Master Agent dashboard
5. Navigate to each worker agent page via sidebar
6. See live data updates every 5 seconds

## Project Structure

```
automotive-project/
├── server/               # Backend Express API
│   ├── src/
│   │   ├── index.ts     # Main server file
│   │   └── routes/      # API route handlers
│   └── package.json
├── web/                 # Frontend Next.js app
│   ├── src/
│   │   ├── app/         # Pages and layouts
│   │   ├── components/  # React components
│   │   ├── lib/         # API client & utilities
│   │   └── store/       # Zustand stores
│   └── package.json
└── package.json         # Root monorepo config
```

## Notes

- All data is mock data stored in-memory
- Frontend auto-refreshes data every 5 seconds
- No database setup required
- Demo login bypasses real authentication
- CORS is enabled for local development
