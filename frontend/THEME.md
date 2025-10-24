# Theme Documentation

## Overview

The Movie Community Platform uses a Netflix-inspired dark theme with a focus on cinematic aesthetics and high contrast for readability.

## Color Palette

### Primary Colors
- **Background**: `#141414` - Near black, main background
- **Foreground**: `#ffffff` - White, primary text
- **Primary**: `#e50914` - Netflix red, CTAs and highlights
- **Primary Foreground**: `#ffffff` - White text on red

### Secondary Colors
- **Card Background**: `#1a1a1a` - Slightly lighter than background
- **Muted Background**: `#2a2a2a` - Elevated surfaces (cards, inputs)
- **Secondary**: `#333333` - Hover states
- **Border**: `#404040` - Subtle dividers

### Text Colors
- **Primary Text**: `#ffffff` - High contrast white
- **Secondary Text**: `#b3b3b3` - Muted gray for less important text

## Typography

### Font Family
- **Primary**: Inter - Modern, readable sans-serif
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)
- 6xl: 3.75rem (60px)
- 7xl: 4.5rem (72px)

## Component Styling

### Buttons

**Primary Button**
```tsx
<Button>Click Me</Button>
```
- Background: Netflix red (#e50914)
- Text: White
- Hover: Slightly darker red
- Focus: Red ring

**Secondary Button**
```tsx
<Button variant="outline">Click Me</Button>
```
- Background: Transparent
- Border: White/gray
- Text: White
- Hover: Subtle background

**Ghost Button**
```tsx
<Button variant="ghost">Click Me</Button>
```
- Background: Transparent
- Text: White
- Hover: Subtle background

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

- Background: `#1a1a1a` or `#2a2a2a`
- Border: Subtle `#404040`
- Hover: Slight background change
- Padding: Consistent spacing

### Forms

**Input Fields**
```tsx
<Input type="text" placeholder="Enter text" />
```
- Background: `#2a2a2a`
- Border: `#404040`
- Text: White
- Focus: Red ring
- Placeholder: Muted gray

**Labels**
```tsx
<Label>Field Label</Label>
```
- Text: White
- Font weight: Medium

## Layout Guidelines

### Spacing
- Use consistent padding: 4, 6, 8, 12, 16, 20, 24px
- Section spacing: 80px (py-20)
- Card spacing: 24px (p-6)

### Containers
- Max width: 1280px (max-w-7xl)
- Padding: 16px on mobile, 24px on desktop

### Grid Layouts
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Gap: 24px (gap-6)

## Accessibility

### Contrast Ratios
- Primary text on background: 21:1 (AAA)
- Secondary text on background: 7:1 (AA)
- Primary button: 4.5:1 (AA)

### Focus States
- All interactive elements have visible focus rings
- Focus ring color: Netflix red
- Focus ring width: 2px
- Focus ring offset: 2px

### Keyboard Navigation
- Tab order follows visual order
- All interactive elements are keyboard accessible
- Skip links for main content

## Responsive Design

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)

## Animation & Transitions

### Hover Effects
- Duration: 200ms
- Easing: ease-in-out
- Properties: background-color, transform, opacity

### Page Transitions
- Smooth scroll behavior
- Fade-in animations for content
- Loading states with skeletons

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #141414;
}

::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: #333333;
}
```

## Usage Examples

### Hero Section
```tsx
<section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
  <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
  <div className="relative z-10 mx-auto max-w-4xl text-center">
    <h1 className="mb-6 text-5xl font-bold text-foreground">
      Welcome to <span className="text-primary">Movie Community</span>
    </h1>
    <p className="mb-8 text-xl text-muted-foreground">
      Your description here
    </p>
    <Button size="lg">Get Started</Button>
  </div>
</section>
```

### Content Grid
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card className="border-border bg-card transition-colors hover:bg-muted/50">
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
  </Card>
</div>
```

### Form Layout
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
  <Button type="submit" className="w-full">Submit</Button>
</form>
```

## Best Practices

1. **Always use semantic HTML** - Use proper heading hierarchy, nav, main, section tags
2. **Maintain contrast** - Ensure text is readable against backgrounds
3. **Consistent spacing** - Use Tailwind's spacing scale
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Accessibility** - Include ARIA labels, focus states, keyboard navigation
6. **Performance** - Optimize images, lazy load content
7. **Dark theme only** - This platform is designed for dark mode exclusively

## Tailwind Configuration

The theme uses Tailwind CSS v4 with custom CSS variables defined in `globals.css`. All colors are defined using HSL values for better manipulation and consistency.

## Component Library

We use shadcn/ui components which are:
- Fully customizable
- Accessible by default
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Type-safe with TypeScript

## Adding New Components

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, input, label, dialog, dropdown-menu, toast, and more.
