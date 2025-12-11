# Coders Adda - Driving Automotive Intelligence

EY Techathon 6.0 Submission

## Architecture

### Master AI Agent
Orchestrates all worker agents and provides centralized decision-making

### 7 Worker AI Agents
1. **Data Analytics** - Vehicle telemetry and performance insights
2. **Diagnostics** - Predictive maintenance and fault detection
3. **Customer Outreach** - Personalized engagement campaigns
4. **Service Booking** - Automated scheduling and reminders
5. **Continuous Feedback** - Customer satisfaction monitoring
6. **Security & Compliance** - Data protection and regulatory adherence
7. **AI Chatbot** - 24/7 intelligent customer support with automotive knowledge base

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 20, Express, TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Visualization**: Recharts, React Three Fiber

## Getting Started

```bash
# Install dependencies
npm install

# Run development servers (both frontend and backend)
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

## User Roles & Login

The application supports two types of users with separate dashboards:

### Customer Portal
- **Email**: customer@example.com
- **Password**: customer123
- **Features**: 
  - View vehicle health and diagnostics
  - Book service appointments
  - Submit feedback
  - Chat with AI assistant

### Employee Dashboard
- **Email**: admin@codersadda.com
- **Password**: admin123
- **Features**:
  - Master AI Agent orchestration
  - Full analytics and insights
  - Customer outreach management
  - Security and compliance monitoring
  - All 7 AI agents access

## Project Structure

```
/web          - Next.js frontend
/server       - Express backend
```
