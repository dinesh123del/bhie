# Premium Animations & Components Guide

## 🎨 Overview

Complete collection of production-ready premium SaaS components built with **Framer Motion** and **Tailwind CSS**.

---

## 📦 Installation

### Install Framer Motion (if not already installed)
```bash
npm install framer-motion
```

### Import CSS
Add to your main `main.tsx`:
```typescript
import './styles/animations.css'
```

---

## 🧩 Components

### 1. PremiumButton
Premium animated button with multiple variants.

**Usage:**
```typescript
import { PremiumButton } from '@/components'

export default function Example() {
  return (
    <>
      <PremiumButton variant="primary" size="md">
        Click Me
      </PremiumButton>

      <PremiumButton variant="secondary" onClick={() => console.log('Clicked')}>
        Secondary Action
      </PremiumButton>

      <PremiumButton variant="outline">
        Outline Button
      </PremiumButton>

      <PremiumButton isLoading>
        Loading...
      </PremiumButton>
    </>
  )
}
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `isLoading`: `boolean`
- `onClick`: `() => void`
- `className`: `string`

---

### 2. PremiumCard
Glassmorphism card with animated hover effects.

**Usage:**
```typescript
import { PremiumCard } from '@/components'

export default function CardExample() {
  return (
    <PremiumCard delay={0.1}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2">Card Title</h3>
        <p className="text-gray-300">Card content goes here</p>
      </div>
    </PremiumCard>
  )
}
```

**Props:**
- `children`: React content
- `hover`: `boolean` (default: true)
- `delay`: `number` (animation delay in seconds)
- `className`: `string`

---

### 3. StatCard
Pre-styled card for displaying metrics.

**Usage:**
```typescript
import { StatCard } from '@/components'

export default function Stats() {
  return (
    <StatCard
      label="Total Records"
      value="2,543"
      icon={<span>📊</span>}
      trend={{ value: 12.5, isPositive: true }}
    />
  )
}
```

**Props:**
- `label`: `string`
- `value`: `string | number`
- `icon`: `React.ReactNode`
- `trend`: `{ value: number; isPositive: boolean }`
- `className`: `string`

---

### 4. ProgressBar
Animated progress bar with smooth transitions.

**Usage:**
```typescript
import { ProgressBar } from '@/components'

export default function Progress() {
  return (
    <ProgressBar
      value={65}
      max={100}
      label="Completion"
      color="from-emerald-500 to-emerald-600"
    />
  )
}
```

**Props:**
- `value`: `number`
- `max`: `number` (default: 100)
- `color`: `string` (Tailwind gradient class)
- `label`: `string` (optional)

---

### 5. CounterAnimation
Animated number counter (counts up on mount).

**Usage:**
```typescript
import { CounterAnimation } from '@/components'

export default function Counter() {
  return (
    <div>
      <CounterAnimation
        value={1500}
        duration={2}
        className="text-3xl font-bold"
        format={(n) => `$${n.toLocaleString()}`}
      />
    </div>
  )
}
```

**Props:**
- `value`: `number`
- `duration`: `number` (seconds)
- `format`: `(num: number) => string`
- `className`: `string`

---

### 6. PremiumBadge
Animated badge with status variants.

**Usage:**
```typescript
import { PremiumBadge } from '@/components'

export default function Badges() {
  return (
    <>
      <PremiumBadge variant="success">✓ Active</PremiumBadge>
      <PremiumBadge variant="warning">⚠ Pending</PremiumBadge>
      <PremiumBadge variant="error">✕ Failed</PremiumBadge>
      <PremiumBadge variant="info">ℹ Info</PremiumBadge>
    </>
  )
}
```

**Props:**
- `variant`: `'success' | 'warning' | 'error' | 'info'`
- `children`: React content
- `className`: `string`

---

### 7. Modal
Premium modal dialog with glassmorphism.

**Usage:**
```typescript
import { Modal, PremiumButton } from '@/components'
import { useState } from 'react'

export default function ModalExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <PremiumButton onClick={() => setIsOpen(true)}>
        Open Modal
      </PremiumButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
      >
        <p className="mb-4">Are you sure?</p>
        <div className="flex gap-3">
          <PremiumButton variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </PremiumButton>
          <PremiumButton onClick={() => setIsOpen(false)}>
            Confirm
          </PremiumButton>
        </div>
      </Modal>
    </>
  )
}
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string`
- `children`: React content
- `footer`: `React.ReactNode`

---

### 8. Toast
Toast notification with animations.

**Usage:**
```typescript
import { Toast } from '@/components'

export default function ToastExample() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Toast
        message="Operation completed successfully!"
        type="success"
        duration={3000}
        onClose={() => console.log('Closed')}
        action={{ label: 'Undo', onClick: () => console.log('Undone') }}
      />
    </div>
  )
}
```

**Props:**
- `message`: `string`
- `type`: `'success' | 'error' | 'warning' | 'info'`
- `duration`: `number` (ms)
- `onClose`: `() => void`
- `action`: `{ label: string; onClick: () => void }`

---

### 9. FloatingInput
Input with animated floating label.

**Usage:**
```typescript
import { FloatingInput } from '@/components'
import { useState } from 'react'

export default function InputExample() {
  const [email, setEmail] = useState('')

  return (
    <FloatingInput
      id="email"
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={email && !email.includes('@') ? 'Invalid email' : ''}
    />
  )
}
```

**Props:**
- `id`: `string`
- `label`: `string`
- `type`: `string` (default: 'text')
- `value`: `string`
- `onChange`: `(e: ChangeEvent) => void`
- `error`: `string`
- `className`: `string`

---

### 10. AnimatedListItem
List item with smooth animations.

**Usage:**
```typescript
import { AnimatedListItem } from '@/components'

export default function List() {
  const items = ['Item 1', 'Item 2', 'Item 3']

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <AnimatedListItem
          key={i}
          index={i}
          className="p-3 bg-white/5 rounded-lg hover:bg-white/10"
        >
          {item}
        </AnimatedListItem>
      ))}
    </div>
  )
}
```

**Props:**
- `children`: React content
- `index`: `number`
- `onClick`: `() => void`
- `className`: `string`

---

### 11. SkeletonCard
Loading skeleton for cards.

**Usage:**
```typescript
import { SkeletonCard } from '@/components'

export default function SkeletonExample() {
  const [isLoading, setIsLoading] = useState(true)

  return isLoading ? (
    <div className="grid grid-cols-3 gap-6">
      <SkeletonCard count={3} />
    </div>
  ) : (
    <div>Content loaded</div>
  )
}
```

**Props:**
- `count`: `number` (number of skeletons to show)

---

### 12. ShimmerLoading
Shimmer loading effect.

**Usage:**
```typescript
import { ShimmerLoading } from '@/components'

export default function ShimmerExample() {
  return (
    <ShimmerLoading className="h-12 w-full rounded-lg mb-4" />
  )
}
```

**Props:**
- `className`: `string`

---

## 🎨 CSS Animations & Utilities

### Animation Classes

Use these utility classes in your JSX:

```jsx
// Fade in animations
<div className="animate-fade-in-up">Content</div>
<div className="animate-fade-in-down">Content</div>
<div className="animate-slide-in-right">Content</div>
<div className="animate-slide-in-left">Content</div>
<div className="animate-scale-in">Content</div>

// Continuous animations
<div className="animate-float">Floating</div>
<div className="animate-float-slow">Slow Float</div>
<div className="animate-pulse-glow">Glowing</div>
```

### Premium Utility Classes

```jsx
// Glassmorphism
<div className="glassmorphism">Blurred background</div>
<div className="glassmorphism-dark">Dark glassmorphism</div>

// Shadows
<div className="shadow-glow-blue">Blue glow</div>
<div className="shadow-glow-purple">Purple glow</div>
<div className="shadow-glow-pink">Pink glow</div>
<div className="shadow-premium">Premium shadow</div>

// Gradient Text
<h1 className="gradient-text-blue">Gradient Text</h1>
<h2 className="gradient-text-primary">Primary Gradient</h2>

// Transitions
<div className="transition-smooth">Smooth 300ms</div>
<div className="transition-smooth-slow">Smooth 500ms</div>

// Hover Effects
<button className="hover-lift">Lifts on hover</button>
<div className="hover-glow">Glows on hover</div>

// Backgrounds
<div className="bg-premium">Premium dark gradient</div>
<div className="bg-premium-light">Premium light gradient</div>
```

---

## 🚀 Advanced Examples

### Dashboard with Animations

```typescript
import { 
  PremiumCard, 
  StatCard, 
  ProgressBar, 
  CounterAnimation 
} from '@/components'
import { motion } from 'framer-motion'

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          label="Total Revenue"
          value={<CounterAnimation value={125000} format={n => `$${(n/1000).toFixed(0)}K`} />}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          label="Active Users"
          value={<CounterAnimation value={2543} />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          label="Conversion Rate"
          value={<CounterAnimation value={3.24} format={n => `${n.toFixed(2)}%`} />}
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

      <PremiumCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
          <ProgressBar value={72} label="Q1 Target" />
        </div>
      </PremiumCard>
    </motion.div>
  )
}
```

### Form with Floating Inputs

```typescript
import { FloatingInput, PremiumButton } from '@/components'
import { useState } from 'react'

export default function PremiumForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  return (
    <div className="space-y-4">
      <FloatingInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <FloatingInput
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <PremiumButton className="w-full">
        Sign In
      </PremiumButton>
    </div>
  )
}
```

---

## 🎯 Performance Tips

1. **Use `useMemo` for expensive calculations**
   ```typescript
   const total = useMemo(() => items.reduce((a, b) => a + b, 0), [items])
   ```

2. **Lazy load components**
   ```typescript
   const HeavyComponent = lazy(() => import('./Heavy'))
   ```

3. **Disable animations for reduced motion**
   - Already handled in CSS with `@media (prefers-reduced-motion: reduce)`

4. **Use React.memo for child components**
   ```typescript
   export const OptimizedCard = memo(PremiumCard)
   ```

---

## 🌈 Color Schemes

### Blue-Purple
```css
from-blue-600 to-purple-600
```

### Emerald-Teal
```css
from-emerald-600 to-teal-600
```

### Rose-Pink
```css
from-rose-600 to-pink-600
```

### Orange-Amber
```css
from-orange-600 to-amber-600
```

---

## 📱 Responsive Design

All components are fully responsive. Use Tailwind's responsive modifiers:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Layouts adapt to screen size */}
</div>
```

---

## ♿ Accessibility

- All components respect `prefers-reduced-motion`
- Proper focus management
- ARIA labels on interactive elements
- Color contrast compliance

---

## 🎬 Animation Timing Functions

Common presets:

```typescript
// Fast
{ duration: 0.2, ease: 'easeOut' }

// Normal
{ duration: 0.5, ease: [0.23, 1, 0.320, 1] }

// Spring
{ type: 'spring', stiffness: 300, damping: 30 }

// Slow
{ duration: 1, ease: 'easeInOut' }
```

---

## 📋 Checklist for Implementation

- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Add CSS import to `main.tsx`
- [ ] Import components from `@/components`
- [ ] Replace old components with premium versions
- [ ] Test animations on multiple devices
- [ ] Verify accessibility (keyboard nav, reduced motion)
- [ ] Optimize lazy loading for heavy components
- [ ] Test performance with DevTools

---

**Ready to use! Copy, paste, and customize.** ✨
