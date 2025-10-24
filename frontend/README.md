# Frontend - Movie Community Platform

Next.js 14 frontend application with Netflix-inspired dark theme.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── theme-provider.tsx
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── public/               # Static assets
```

## Theme

The application uses a Netflix-inspired dark theme with:
- Primary background: `#141414` (near black)
- Accent color: `#e50914` (Netflix red)
- High contrast text for readability
- Smooth animations and transitions

See [THEME.md](./THEME.md) for complete theme documentation.

## Components

We use shadcn/ui for UI components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Available components:
- button, card, input, label
- dialog, dropdown-menu, toast
- form, select, checkbox
- And many more...

## API Integration

The frontend communicates with the backend API using the `api` utility in `lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// GET request
const data = await api.get('/api/blogs');

// POST request
const result = await api.post('/api/blogs', { title: 'My Blog' });

// PUT request
const updated = await api.put('/api/blogs/123', { title: 'Updated' });

// DELETE request
await api.delete('/api/blogs/123');
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Ensure accessibility (ARIA labels, keyboard navigation)

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels and roles
- High contrast ratios (WCAG AA compliant)
- Focus indicators on all interactive elements
- Semantic HTML structure

## Performance

- Code splitting with Next.js App Router
- Image optimization with next/image
- Lazy loading for below-the-fold content
- API response caching
- Optimized bundle size

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Build the application:
```bash
npm run build
```

The output will be in the `.next` directory. Follow your platform's deployment guide for Next.js applications.

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Type errors
```bash
# Regenerate types
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/docs)
