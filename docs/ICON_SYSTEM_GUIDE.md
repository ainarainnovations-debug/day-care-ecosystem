# 🎨 Unified Icon System

A comprehensive, consistent icon system for the Day-Care Ecosystem platform with standardized sizes, variants, and styling.

## 📚 Overview

The unified icon system provides:
- **6 Standard Sizes**: xs (12px) to 2xl (48px)
- **8 Color Variants**: default, primary, secondary, accent, muted, success, warning, danger
- **Background Support**: Optional colored backgrounds with padding
- **Rounded Styles**: none, sm, md, lg, full
- **Interactive Components**: IconButton with hover states
- **Consistent Stroke Width**: Automatically adjusted per size

---

## 🚀 Quick Start

### Basic Icon
```tsx
import { Icon } from '@/components/ui/icon';
import { Heart } from 'lucide-react';

<Icon icon={Heart} size="md" variant="primary" />
```

### Icon with Background
```tsx
import { IconBadge } from '@/components/ui/icon';
import { Bell } from 'lucide-react';

<IconBadge icon={Bell} size="lg" variant="primary" rounded="full" />
```

### Interactive Icon Button
```tsx
import { IconButton } from '@/components/ui/icon';
import { Settings } from 'lucide-react';

<IconButton 
  icon={Settings} 
  size="md" 
  variant="muted" 
  onClick={() => console.log('Settings clicked')} 
/>
```

---

## 📏 Sizes

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 12px | Inline text icons, badges |
| `sm` | 16px | Small buttons, compact lists |
| `md` | 20px | Default size, body content |
| `lg` | 24px | Section headers, cards |
| `xl` | 32px | Feature highlights, hero sections |
| `2xl` | 48px | Large displays, landing pages |

### Example
```tsx
<Icon icon={Star} size="xs" variant="accent" />
<Icon icon={Star} size="sm" variant="accent" />
<Icon icon={Star} size="md" variant="accent" />
<Icon icon={Star} size="lg" variant="accent" />
<Icon icon={Star} size="xl" variant="accent" />
<Icon icon={Star} size="2xl" variant="accent" />
```

---

## 🎨 Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Foreground | Standard content icons |
| `primary` | Brand color | Important actions, branding |
| `secondary` | Secondary theme | Alternative actions |
| `accent` | Accent color | Highlights, special features |
| `muted` | Muted gray | Less important icons |
| `success` | Green | Confirmations, success states |
| `warning` | Yellow | Cautions, warnings |
| `danger` | Red | Errors, destructive actions |

### Example
```tsx
<Icon icon={Check} variant="success" size="lg" />
<Icon icon={AlertTriangle} variant="warning" size="lg" />
<Icon icon={X} variant="danger" size="lg" />
```

---

## 🎯 Components

### Icon (Base Component)
The foundation component for all icons.

**Props:**
- `icon: LucideIcon` - The Lucide icon component
- `size?: IconSize` - Size preset (default: 'md')
- `variant?: IconVariant` - Color variant (default: 'default')
- `className?: string` - Additional CSS classes
- `strokeWidth?: number` - Custom stroke width
- `background?: boolean` - Add background (default: false)
- `rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'` - Background rounding

```tsx
<Icon 
  icon={Heart} 
  size="lg" 
  variant="primary" 
  strokeWidth={2.5}
/>
```

---

### IconBadge (Background Variant)
Icon with colored background - perfect for cards and feature highlights.

**Props:** Same as `Icon`, but `background` is always true.

```tsx
<IconBadge 
  icon={Baby} 
  size="xl" 
  variant="primary" 
  rounded="lg" 
/>
```

**Background Colors:**
- Each variant has a corresponding background with 10% opacity
- Text color automatically adjusts for contrast
- Padding scales with size

---

### IconButton (Interactive)
Clickable icon with hover states.

**Props:** Same as `Icon` + `onClick` handler.

```tsx
<IconButton 
  icon={Bell} 
  size="md" 
  variant="default"
  onClick={() => showNotifications()}
/>
```

**States:**
- Hover: Light accent background
- Active: Darker accent background
- Disabled: 50% opacity, no pointer

---

## 🏗️ Real-World Examples

### Dashboard Stat Card
```tsx
<div className="bg-popover rounded-xl p-4 border flex items-center gap-3">
  <IconBadge icon={Users} size="lg" variant="primary" rounded="lg" />
  <div>
    <p className="text-2xl font-bold">24</p>
    <p className="text-sm text-muted-foreground">Total Children</p>
  </div>
</div>
```

### List Item with Icon
```tsx
<div className="bg-popover rounded-xl p-3 border flex items-center gap-3">
  <IconBadge icon={Mail} size="md" variant="primary" rounded="full" />
  <div>
    <p className="text-sm font-medium">Email Address</p>
    <p className="text-xs text-muted-foreground">parent@example.com</p>
  </div>
</div>
```

### Feature Grid Item
```tsx
<div className="text-center space-y-2">
  <div className="flex justify-center">
    <IconBadge icon={BookOpen} size="xl" variant="accent" rounded="lg" />
  </div>
  <p className="text-sm font-medium">Learning</p>
  <p className="text-xs text-muted-foreground">Education Programs</p>
</div>
```

### Navigation Button
```tsx
<IconButton 
  icon={Settings} 
  size="md" 
  variant="muted"
  onClick={() => navigate('/settings')}
/>
```

---

## 🔧 Using Constants

Import predefined constants for type safety:

```tsx
import { 
  Icon, 
  ICON_SIZES, 
  ICON_VARIANTS 
} from '@/components/ui/icon';

<Icon 
  icon={Star} 
  size={ICON_SIZES.LG} 
  variant={ICON_VARIANTS.ACCENT} 
/>
```

**Available Constants:**
```tsx
ICON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  XXL: '2xl',
}

ICON_VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ACCENT: 'accent',
  MUTED: 'muted',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
}
```

---

## 🎭 Live Demo

Visit `/icons` in your app to see the full interactive showcase with:
- All size variations
- All color variants
- Icon badges with backgrounds
- Different rounded styles
- Icon buttons with hover states
- Real-world usage examples
- Copy-paste code snippets

---

## 📋 Migration Guide

### Before (Inconsistent)
```tsx
// Different sizes, no standard
<Heart className="w-4 h-4 text-red-500" />
<Settings className="w-6 h-6 text-gray-600" />
<Bell size={20} className="text-blue-500" />
```

### After (Consistent)
```tsx
// Unified system with standard sizes and variants
<Icon icon={Heart} size="sm" variant="danger" />
<Icon icon={Settings} size="lg" variant="muted" />
<Icon icon={Bell} size="md" variant="primary" />
```

---

## 🎯 Best Practices

### ✅ Do
- Use size presets (`sm`, `md`, `lg`) for consistency
- Choose semantic variants (`success`, `warning`, `danger`)
- Use `IconBadge` for cards and feature highlights
- Use `IconButton` for interactive icons
- Keep stroke width consistent (use defaults)

### ❌ Don't
- Don't use arbitrary sizes (stick to presets)
- Don't mix custom colors with variants
- Don't use background icons for inline text
- Don't override padding on IconBadge
- Don't use primary variant for everything

---

## 🔄 Common Patterns

### Status Indicators
```tsx
<Icon icon={Check} variant="success" size="sm" />  // Approved
<Icon icon={Clock} variant="warning" size="sm" />  // Pending
<Icon icon={X} variant="danger" size="sm" />       // Rejected
```

### User Actions
```tsx
<IconButton icon={Heart} variant="danger" />      // Favorite
<IconButton icon={Share2} variant="primary" />    // Share
<IconButton icon={Bookmark} variant="accent" />   // Save
```

### Info Cards
```tsx
<IconBadge icon={MapPin} variant="primary" rounded="full" />
<IconBadge icon={Calendar} variant="accent" rounded="full" />
<IconBadge icon={Clock} variant="muted" rounded="full" />
```

---

## 🚀 Performance

- **Tree-shakable**: Only imports icons you use
- **No runtime overhead**: Pure component wrapping
- **CSS-based**: Leverages Tailwind classes
- **Type-safe**: Full TypeScript support

---

## 🛠️ Customization

### Custom Stroke Width
```tsx
<Icon icon={Heart} size="xl" strokeWidth={3} />
```

### Custom Classes
```tsx
<Icon 
  icon={Star} 
  size="lg" 
  variant="primary"
  className="animate-pulse"
/>
```

### Custom Background Styles
```tsx
<IconBadge 
  icon={Bell}
  size="lg"
  variant="primary"
  rounded="md"
  className="shadow-lg"
/>
```

---

## 📦 File Structure

```
src/
  components/
    ui/
      icon.tsx           # Icon system components
  pages/
    IconShowcase.tsx     # Interactive demo page
  docs/
    ICON_SYSTEM_GUIDE.md # This file
```

---

## 🤝 Contributing

When adding new icon patterns:

1. **Ensure consistency** - Use existing variants and sizes
2. **Document usage** - Add examples to IconShowcase
3. **Test responsiveness** - Check all screen sizes
4. **Verify accessibility** - Ensure proper contrast ratios

---

## 📚 Related Resources

- [Lucide Icons](https://lucide.dev/) - Icon library
- [Tailwind CSS](https://tailwindcss.com/) - Styling system
- [Shadcn/ui](https://ui.shadcn.com/) - Component library

---

## ✨ Summary

The unified icon system provides:
- ✅ **Consistency** across the entire app
- ✅ **Scalability** with standard size presets
- ✅ **Flexibility** with 8 color variants
- ✅ **Reusability** through composable components
- ✅ **Type Safety** with TypeScript support
- ✅ **Performance** through tree-shaking

**Result**: Outstanding, professional-looking icons that match the design language shown in your reference images! 🎨
