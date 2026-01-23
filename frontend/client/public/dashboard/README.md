# Healthcare Dashboard

A modern, responsive healthcare dashboard built with React, TailwindCSS, and React Router.

## Features

- **Dashboard View**: Overview of patient health metrics, medications, and vital signs
- **Schedule View**: Appointment management and calendar (coming soon)
- **Analytics View**: Health metrics tracking and visualization (coming soon)
- **History View**: Complete medical history timeline (coming soon)

## Routes

The healthcare dashboard is accessible through the following routes:

- `/healthcare/dashboard` - Main dashboard view
- `/healthcare/schedule` - Schedule and appointments
- `/healthcare/analytics` - Health analytics and metrics
- `/healthcare/history` - Medical history timeline

## Testing

### HTML Prototype
The HTML prototypes are located in `dashboard/` directory:
- `dash.html` - Main dashboard
- `schedule.html` - Schedule page
- `analytics.html` - Analytics page
- `history.html` - History page

You can open these files directly in a browser to test the static version.

### React Version
1. Make sure dependencies are installed:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to:
   - http://localhost:5173/healthcare/dashboard
   - http://localhost:5173/healthcare/schedule
   - http://localhost:5173/healthcare/analytics
   - http://localhost:5173/healthcare/history

## Component Structure

```
HealthcareDashboard.jsx (Main Component)
├── DashboardView
│   ├── ResearchCard
│   ├── MedicationList
│   └── ScheduleCard
├── ScheduleView (placeholder)
├── AnalyticsView (placeholder)
└── HistoryView (placeholder)
```

## Tech Stack

- **React 19.2.0** - UI framework
- **React Router DOM 7.12.0** - Routing
- **TailwindCSS 4.1.18** - Styling
- **FontAwesome** - Icons
- **Vite 7.2.4** - Build tool

## Next Steps

1. ✅ Create HTML prototypes with routing
2. ✅ Test HTML navigation
3. ✅ Convert to React components
4. ✅ Add React Router integration
5. 🔄 Implement full Schedule view
6. 🔄 Implement full Analytics view with charts
7. 🔄 Implement full History view with timeline
8. 🔄 Add state management (Recoil already configured)
9. 🔄 Connect to backend API
10. 🔄 Add authentication and user context

## Conversion Notes

The React version maintains the same visual design and layout as the HTML prototype while adding:
- Component-based architecture for reusability
- React Router for client-side navigation
- State management preparation
- Better code organization and maintainability
