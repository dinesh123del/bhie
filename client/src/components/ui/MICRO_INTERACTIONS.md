# Premium Micro Interactions Reference

## Overview
This documentation covers all premium Apple-level micro interactions implemented in the BHIE app.

---

## 1. Button Interactions

### PremiumButton Component
```tsx
<PremiumButton
  variant="primary"
  size="md"
  loading={false}
  icon={<ArrowRight />}
>
  Click Me
</PremiumButton>
```

**Animations:**
- Hover: `scale(1.05)` + shadow glow
- Active (tap): `scale(0.97)`
- Icon rotation on hover: `5°`
- Duration: `150ms` (tween)

**Variants:**
- `primary`: Gradient indigo→purple with glow
- `secondary`: White transparent with border
- `danger`: Red-tinted with error styling
- `ghost`: Minimal white text

---

## 2. Card Interactions

### PremiumCard Component
```tsx
<PremiumCard hoverable gradient>
  <h3>Content</h3>
</PremiumCard>
```

**Animations (when hoverable=true):**
- Hover: `scale(1.02)`, `y: -4px` (lift effect)
- Border glow on hover: `rgba(255, 255, 255, 0.15)`
- Shadow expansion
- Duration: `200ms` (tween, ease-out)

---

## 3. Input Focus Effects

### FormInput Component or Input Fields
```tsx
<FormInput
  label="Email"
  type="email"
  icon={<Mail />}
  value={email}
  onChange={handleChange}
  error={error}
/>
```

**Animations:**
- Focus: `scale(1.01)` + ring glow
- Icon color change on focus: gray → indigo
- Error state: red border + ring
- Duration: `200ms`

---

## 4. Loading States

### LoadingSpinner
```tsx
<LoadingSpinner size="md" />
```

**Animations:**
- Continuous 360° rotation
- Duration: `1.5s`

### PageLoader
```tsx
<PageLoader />
```

Animated loading screen with spinner and fade effect.

### Skeleton Loaders
```tsx
<SkeletonCard />
<SkeletonTable />
```

**Animations:**
- Shimmer effect: slides left to right
- Duration: `1.5s`
- Infinite loop

---

## 5. Success / Error Feedback

### SuccessAnimation
```tsx
<SuccessAnimation message="Account created!" />
```

- Icon scale pulse: `1 → 1.2 → 1`
- SVG path draw animation
- Initial scale-up from center

### ErrorAnimation
```tsx
<ErrorAnimation message="Invalid email" />
```

- Shake animation: `[-8, 8, -8, 8, -4, 4, 0]`
- Duration: `500ms`

### FeedbackToast
```tsx
<FeedbackToast
  type="success"
  message="Saved!"
  onClose={handleClose}
/>
```

- Slide-in from right
- Icon scale animation
- Supports success/error/info types

---

## 6. Sidebar Animations

### Sidebar Component
```tsx
<Sidebar
  items={navItems}
  active={currentPage}
  onNavigate={handleNav}
/>
```

**Animations:**
- Initial fade-in + slide-left
- Mobile toggle: rotate icon on state change
- Nav items: staggered fade-in (`delay: 0.05 + idx * 0.03`)
- Active indicator: layout animation with spring physics
- Hover: slide right + highlight
- Tap: scale 0.98

---

## 7. Hover Details

### IconButton Component
```tsx
<IconButton icon={<Bell />} onClick={handleClick} />
```

- Hover: `scale(1.1)` + `rotate(5°)`
- Tap: `scale(0.95)`
- Duration: `150ms`

### Icons in Navbar
```tsx
<motion.button whileHover={{ scale: 1.1, rotate: 5 }}>
  <Bell />
</motion.button>
```

- Pulsing notification dot
- Scale animation: `1 → 1.2 → 1`
- Duration: `2s` (infinite)

---

## 8. Tooltip Component
```tsx
<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>
```

**Animations:**
- Fade in: `opacity: 0 → 1`
- Scale: `0.8 → 1`
- Smooth entrance: `150ms`
- Positions: top, bottom, left, right

---

## 9. Modal & Confirm Dialogs

### Modal Component
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Settings"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

**Animations:**
- Backdrop fade: `0 → 1`
- Modal scale + slide: `scale(0.9), y(20) → scale(1), y(0)`
- Spring physics: stiffness 300, damping 30
- Close button: rotate on hover

### ConfirmDialog Component
```tsx
<ConfirmDialog
  isOpen={isOpen}
  title="Delete?"
  message="This cannot be undone"
  type="danger"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

- Same modal animations
- Icon pulse animation
- Type-based styling (danger/warning/info)

---

## 10. Micro-Interaction Utilities

### Table Row Hover
```tsx
<TableRowHover>
  <td>Data</td>
</TableRowHover>
```

- Hover: background fade + slide right (`x: 4`)
- Duration: `150ms`

### ScaleOnHover
```tsx
<ScaleOnHover>
  <img src="..." />
</ScaleOnHover>
```

- Hover: `scale(1.02)`
- Tap: `scale(0.98)`

### Pulse Glow
```tsx
<PulseGlow className="w-4 h-4 bg-indigo-500" />
```

- Outer shadow pulse
- Duration: `2s` (infinite)

### Stagger List
```tsx
<StaggerList>
  {items.map(item => <div key={item.id}>{item}</div>)}
</StaggerList>
```

- Children fade-in with stagger
- Delay: `0.1s` between items

---

## 11. Text Animations

### TextAnimated
```tsx
<TextAnimated delay={0.1}>Animated Text</TextAnimated>
```

- Fade + slide up: `(0, 10) → (1, 0)`
- Duration: `300ms`

### NumberTicker
```tsx
<NumberTicker value={1000} duration={2} decimals={0} />
```

- Counts from 0 to value over duration
- Smooth easing

---

## 12. Link Animations

### SmoothLink
```tsx
<SmoothLink href="/dashboard">Go to Dashboard</SmoothLink>
```

- Hover: slide right (`x: 4`)
- Tap: scale 0.98

---

## Performance Optimization

### Rules Applied:
✅ All animations under 300ms (except infinite loops like spinner)  
✅ Use `transform` (translate, scale, rotate) instead of layout changes  
✅ Spring physics for natural motion (stiffness 200-400)  
✅ Tween for precise timing (login forms, focus states)  
✅ No heavy re-renders during animations  
✅ Lazy loading of heavy components  

---

## Animation Duration Reference

| Type | Duration | Easing |
|------|----------|--------|
| Button hover | 150ms | tween |
| Card hover | 200ms | tween (ease-out) |
| Input focus | 200ms | - |
| Page transition | 300ms | ease-out |
| Modal open | 200ms | spring |
| Loading spinner | 1500ms | linear |
| Skeleton shimmer | 1500ms | linear |
| Stagger delay | 80-100ms | - |

---

## Import Examples

```tsx
import {
  PremiumButton,
  PremiumCard,
  PremiumBadge,
  KPICard,
  FormInput,
  FeedbackToast,
  LoadingSpinner,
  PageLoader,
  SkeletonCard,
  Tooltip,
  Modal,
  ConfirmDialog,
  MicroInteractions,
  IconButton,
  ScaleOnHover,
  Stagger,
  NumberTicker,
} from '@/components/ui';
```
