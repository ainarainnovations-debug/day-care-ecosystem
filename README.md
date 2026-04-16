# 🏡 CareConnect - Day Care Ecosystem

A comprehensive day-care management platform connecting parents, providers, and teachers with real-time communication and automation.

## ✨ Latest Features

### 🔔 Real-time Notifications System (NEW!)
- **Instant Updates** - Real-time notifications via Supabase
- **Browser Notifications** - Native desktop alerts
- **Sound Alerts** - Audio feedback for important events
- **15 Notification Types** - Complete coverage for all platform events
- **Auto-triggers** - Automatic notifications for check-ins, clock-ins, bookings, and more

[📖 Full Documentation](./docs/NOTIFICATIONS_COMPLETE.md) | [🚀 Implementation Guide](./docs/NOTIFICATIONS_IMPLEMENTATION.md)

---

## 🎯 Features

### For Parents
- **Search & Book** - Find and book daycare providers
- **Child Profiles** - Manage multiple children
- **Real-time Alerts** - Instant check-in/out notifications
- **Activity Feed** - See daily activities and photos
- **Messaging** - Direct communication with providers
- **Billing** - View invoices and payment history

### For Providers
- **Provider Dashboard** - Manage your daycare business
- **Teacher Management** - Hire and manage teachers
- **Attendance Tracking** - Monitor child check-ins/outs
- **Time & Labor** - Approve teacher time entries
- **Booking Management** - Handle parent bookings
- **Real-time Alerts** - Teacher clock-in/out notifications

### For Teachers
- **Punch Clock** - Clock in/out with GPS verification
- **Child Check-in/out** - Manage daily attendance
- **Activity Logging** - Post updates with photos
- **Time Tracking** - View hours and earnings
- **Notifications** - Instant approval/rejection alerts

### For Admins
- **User Management** - Manage all platform users
- **Invite Codes** - Generate teacher invite codes
- **Application Review** - Approve/reject providers
- **Analytics** - Platform-wide insights

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for Supabase local development)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ainarainnovations-debug/day-care-ecosystem.git
cd day-care-ecosystem

# Install dependencies
npm install

# Start Supabase (requires Docker Desktop)
npx supabase start

# Run database migrations
npx supabase db reset

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management:** TanStack Query
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Notifications:** Supabase Realtime + Web Notifications API

---

## 📚 Documentation

- **[Notifications System](./docs/NOTIFICATIONS_COMPLETE.md)** - Real-time notification system
- **[Teacher Implementation](./docs/TEACHER_IMPLEMENTATION_COMPLETE.md)** - Teacher role system
- **[Icon System](./docs/ICON_SYSTEM_GUIDE.md)** - Unified icon design system

---

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Notifications
1. Visit `http://localhost:5173/icons`
2. Scroll to "Notification Tester"
3. Click quick test buttons
4. Check notification bell in navbar

### Enable Browser Notifications
1. Visit `/notifications`
2. Click "Enable Notifications"
3. Allow in browser prompt

---

## 📦 Project Structure

```
day-care-ecosystem/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Business logic services
│   ├── lib/            # Utilities
│   └── integrations/   # Third-party integrations
├── supabase/
│   ├── migrations/     # Database migrations
│   └── config.toml     # Supabase config
└── docs/               # Documentation
```

---

## 🎨 Key Features in Detail

### Real-time Notifications
- **15 notification types** covering all platform events
- **Automatic triggers** via PostgreSQL functions
- **Browser notifications** with native desktop alerts
- **Sound alerts** with customizable volume
- **Read/unread tracking** with badge counts
- **Auto-cleanup** after 30 days

### Teacher Role System
- **7-phase implementation** with complete CRUD operations
- **GPS-verified punch clock** for accurate time tracking
- **Automatic pay calculation** based on hourly rates
- **Time entry approval** workflow for providers
- **Child check-in/out** with photo verification
- **Activity logging** with rich media support

### Icon System
- **6 standardized sizes** (xs to 2xl)
- **8 color variants** for different contexts
- **IconBadge** and **IconButton** components
- **Consistent styling** across all components
- **Live showcase** at `/icons`

---

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** via Supabase Auth
- **Role-based access control** (parent, provider, teacher, admin)
- **SECURITY DEFINER** functions for system operations
- **Input validation** on all forms
- **XSS protection** via React

---

## 📈 Roadmap

### Phase 1: Foundation (Complete ✅)
- [x] User authentication
- [x] Parent/Provider/Teacher/Admin roles
- [x] Basic dashboards
- [x] Icon system

### Phase 2: Teacher System (Complete ✅)
- [x] Teacher onboarding via invite codes
- [x] GPS-verified punch clock
- [x] Child check-in/out
- [x] Time entry approval workflow

### Phase 3: Notifications (Complete ✅)
- [x] Real-time notification system
- [x] Browser notifications
- [x] Sound alerts
- [x] 15 notification types

### Phase 4: Enhanced Features (In Progress 🚧)
- [ ] Photo upload system
- [ ] Complete messaging system
- [ ] Payment integration (Stripe)
- [ ] Reviews & ratings
- [ ] Activity logging with photos
- [ ] Dashboard analytics

### Phase 5: Mobile & PWA (Planned 📋)
- [ ] Progressive Web App (PWA)
- [ ] Mobile-first redesign
- [ ] Offline support
- [ ] Push notifications (mobile)

### Phase 6: Advanced Features (Planned 📋)
- [ ] Background checks integration
- [ ] Teacher scheduling
- [ ] Payroll export
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📝 License

[Your License Here]

---

## 👥 Team

Built with ❤️ by the Ainara Innovations team

---

## 🆘 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/ainarainnovations-debug/day-care-ecosystem/issues)
- **Email:** support@careconnect.com

---

**Status:** 🚀 Active Development  
**Version:** 1.0.0  
**Last Updated:** April 13, 2026
