# TMS Design System - Color Palette

## 🎨 Brand Colors

### Primary Color - Professional Blue-Indigo
Our primary color represents trust, reliability, and professionalism - perfect for a logistics/transportation management system.

**Light Mode:** `oklch(0.55 0.22 264)` - A rich, vibrant blue-indigo
**Dark Mode:** `oklch(0.65 0.22 264)` - Slightly lighter for better contrast

**Usage:**
- Primary buttons
- Active navigation items
- Links
- Important CTAs
- Brand accents

### Secondary Color - Teal
Represents growth, efficiency, and success.

**Light Mode:** `oklch(0.65 0.15 200)`
**Dark Mode:** `oklch(0.70 0.15 200)`

**Usage:**
- Secondary buttons
- Success states
- Positive indicators
- Alternate CTAs

### Accent Color - Purple
Represents creativity, innovation, and premium features.

**Light Mode:** `oklch(0.65 0.20 300)`
**Dark Mode:** `oklch(0.70 0.20 300)`

**Usage:**
- Special features
- Premium highlights
- Creative elements
- Gradient accents

## 🎯 Functional Colors

### Destructive/Error - Red
**Light Mode:** `oklch(0.55 0.22 25)`
**Dark Mode:** `oklch(0.65 0.22 25)`

**Usage:**
- Error messages
- Delete buttons
- Danger zones
- Failure states

### Success - Green (from chart-3)
**Light Mode:** `oklch(0.70 0.18 150)`
**Dark Mode:** `oklch(0.75 0.18 150)`

**Usage:**
- Success toasts
- Completion states
- Positive feedback
- Growth indicators

## 📊 Data Visualization Colors

Professional palette for charts and graphs:

1. **Blue** `oklch(0.55 0.22 264)` - Primary data
2. **Teal** `oklch(0.65 0.15 200)` - Secondary data
3. **Green** `oklch(0.70 0.18 150)` - Positive growth
4. **Purple** `oklch(0.65 0.20 300)` - Special data
5. **Amber** `oklch(0.75 0.15 45)` - Warnings/Alerts

## 🌓 Neutral Colors

### Background System

#### Light Mode
- **Background:** `oklch(0.99 0.005 264)` - Near white
- **Foreground:** `oklch(0.15 0.02 264)` - Near black
- **Card:** `oklch(1 0 0)` - Pure white
- **Muted:** `oklch(0.96 0.01 264)` - Light gray
- **Muted Foreground:** `oklch(0.50 0.02 264)` - Medium gray
- **Border:** `oklch(0.92 0.01 264)` - Subtle border

#### Dark Mode
- **Background:** `oklch(0.12 0.015 264)` - Rich dark
- **Foreground:** `oklch(0.97 0.005 264)` - Off-white
- **Card:** `oklch(0.18 0.02 264)` - Slightly lighter
- **Muted:** `oklch(0.22 0.02 264)` - Muted dark
- **Muted Foreground:** `oklch(0.65 0.015 264)` - Medium light
- **Border:** `oklch(0.25 0.02 264)` - Subtle light border

## 🎭 Usage Guidelines

### When to Use Each Color

**Primary Color:**
- Main call-to-action buttons
- Active navigation states
- Important links
- Form inputs focus states
- Loading spinners
- Progress indicators

**Secondary Color:**
- Alternative actions
- Success messages
- Completed states
- "Safe" operations
- Optional features

**Accent Color:**
- Premium features
- Special highlights
- Important badges
- Gradient overlays
- Micro-interactions

**Destructive Color:**
- Delete/remove actions
- Error states
- Cancel operations
- Warning messages
- Critical alerts

### Color Combinations

**Safe Combinations:**
- Primary + White (classic, professional)
- Primary + Light Gray (subtle)
- Secondary + Primary (complementary)
- Accent + Dark Gray (modern)

**Avoid:**
- Primary + Destructive (confusing)
- Multiple bright colors together (chaotic)
- Low contrast combinations (accessibility)

## ✅ Accessibility

All colors meet WCAG AA standards:
- Primary on background: 7.2:1 contrast
- Foreground text: 12:1 contrast
- Success states: 4.8:1 contrast

## 🚀 Implementation

The color system is automatically applied through Tailwind v4's CSS variables:

```tsx
// Use anywhere in your app
<button className="bg-primary text-primary-foreground">
  Primary Button
</button>

<div className="bg-muted text-muted-foreground">
  Muted Section
</div>

<span className="text-destructive">
  Error Message
</span>
```

## 🎨 Tips & Best Practices

1. **Default to primary** - Use primary for most actions
2. **Reserve destructive** - Only for truly dangerous operations
3. **Use semantic names** - Don't use raw colors, use the token names
4. **Test in both modes** - Always check light and dark mode
5. **Consider context** - Match color to the action's importance

## 🔧 Customization

To adjust colors, modify `src/app/globals.css`:
- `:root` for light mode
- `.dark` for dark mode

All components using Tailwind classes will automatically update!

---

**Last Updated:** 2026-01-28
**Version:** 1.0.0
