# Database Integration Status & Next Steps

## ✅ COMPLETED

### Services Created
1. **capacityService.ts** - Classrooms, waitlist, capacity stats
2. **paymentService.ts** - Payments, invoices, payment methods
3. **providerDashboardService.ts** - Attendance, children, bookings
4. **parentDashboardService.ts** - Family data, bookings, invoices

### UI Connected to Real Data
1. **CapacityDashboard** - Fully connected to database

## 🔨 NEXT STEPS

### 1. Connect PaymentDashboard (src/pages/PaymentDashboard.tsx)

Replace mock data with:
```typescript
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';

// In component:
const { user } = useAuth();

const { data: stats } = useQuery({
  queryKey: ['payment-stats', user?.id],
  queryFn: () => paymentService.getPaymentStats(user!.id),
  enabled: !!user?.id,
});

const { data: recentPayments } = useQuery({
  queryKey: ['recent-payments', user?.id],
  queryFn: () => paymentService.getRecentPayments(user!.id, 4),
  enabled: !!user?.id,
});
```

### 2. Connect ProviderDashboard (src/pages/ProviderDashboard.tsx)

Replace mock data arrays with:
```typescript
import { useQuery } from '@tanstack/react-query';
import { providerDashboardService } from '@/services/providerDashboardService';

const { data: stats } = useQuery({
  queryKey: ['provider-stats', user?.id],
  queryFn: () => providerDashboardService.getDashboardStats(user!.id),
  enabled: !!user?.id,
});

const { data: attendance } = useQuery({
  queryKey: ['todays-attendance', user?.id],
  queryFn: () => providerDashboardService.getTodaysAttendance(user!.id),
  enabled: !!user?.id,
});

const { data: bookings } = useQuery({
  queryKey: ['pending-bookings', user?.id],
  queryFn: () => providerDashboardService.getPendingBookings(user!.id),
  enabled: !!user?.id,
});
```

### 3. Connect ParentDashboard (src/pages/ParentDashboard.tsx)

Add real data fetching:
```typescript
import { useQuery } from '@tanstack/react-query';
import { parentDashboardService } from '@/services/parentDashboardService';

const { data: stats } = useQuery({
  queryKey: ['parent-stats', user?.id],
  queryFn: () => parentDashboardService.getDashboardStats(user!.id),
  enabled: !!user?.id,
});

const { data: children } = useQuery({
  queryKey: ['my-children', user?.id],
  queryFn: () => parentDashboardService.getMyChildren(user!.id),
  enabled: !!user?.id,
});

const { data: upcomingBookings } = useQuery({
  queryKey: ['my-bookings', user?.id],
  queryFn: () => parentDashboardService.getMyBookings(user!.id),
  enabled: !!user?.id,
});
```

## 📊 DATABASE TABLES READY TO USE

### Capacity System
- `classrooms` - Licensed capacity, current enrollment, available spots
- `waitlist` - Waitlist entries with position tracking

### Payment System  
- `payment_methods` - ACH, card, FSA/HSA
- `invoices` - Invoice tracking
- `payments` - Payment transactions
- `autopay_schedules` - Automated payment schedules

### Core System
- `children` - Child profiles with enrollment status
- `bookings` - Booking requests and confirmations
- `attendance` - Check-in/check-out tracking
- `provider_profiles` - Provider business information

## 🎯 IMPLEMENTATION PRIORITY

1. **PaymentDashboard** (HIGHEST) - Critical for revenue tracking
2. **ProviderDashboard** (HIGH) - Most used dashboard
3. **ParentDashboard** (MEDIUM) - Parent-facing features

## 💾 SEED DATA NEEDED

Before testing, you'll need to:
1. Run `supabase/seed_classrooms.sql` for capacity data
2. Create sample payment/invoice records
3. Add test children and bookings

## 🔧 TYPE SAFETY NOTES

Some tables (`classrooms`, `waitlist`, `invoices`, `payments`) don't exist in the generated TypeScript types yet. Services use `as any` type assertions for now. To fix:

```bash
# Regenerate types after confirming migrations are applied
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## 📝 TESTING CHECKLIST

After connecting each dashboard:
- [ ] Add loading states (spinner while fetching)
- [ ] Add error states (error message if fetch fails)
- [ ] Add empty states (message when no data)
- [ ] Test with real data
- [ ] Test with no data
- [ ] Build and deploy

## 🚀 DEPLOYMENT STEPS

After UI updates:
```bash
npm run build
git add -A && git commit -m "Connect [Dashboard Name] to real data"
git push origin main
npx @azure/static-web-apps-cli deploy ./dist --deployment-token [TOKEN]
```
