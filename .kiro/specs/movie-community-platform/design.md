# Design Document

## Overview

The movie community platform is a full-stack web application built with a modern tech stack: Next.js 14 (App Router) for the frontend, Node.js with Express for the backend API, PostgreSQL for the database, and a Python-based ML service for recommendations. The architecture follows a clean separation of concerns with RESTful APIs connecting the layers.

### Technology Stack

- **Frontend**: Next.js 14 (React 18), TypeScript, Tailwind CSS with shadcn/ui components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **ML Service**: Python with Flask, scikit-learn for collaborative filtering
- **Authentication**: JWT tokens with httpOnly cookies
- **Deployment**: Vercel (frontend), Railway/Render (backend), separate ML service
- **UI Theme**: Dark mode with Netflix-inspired design (dark backgrounds, high contrast text, cinematic feel)

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│                  (Next.js 14 App)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Gateway Layer                       │
│              (Next.js API Routes +                       │
│               Express Backend)                           │
└─────┬──────────────────────────────────────────┬────────┘
      │                                           │
      │                                           │
┌─────▼──────────────────┐           ┌───────────▼────────┐
│   PostgreSQL Database  │           │   ML Service       │
│   (Prisma ORM)         │           │   (Flask + ML)     │
└────────────────────────┘           └────────────────────┘
```


### Layer Responsibilities

**Frontend Layer (Next.js)**
- Server-side rendering for SEO and performance
- Client-side interactivity and state management
- Form validation and user input handling
- Responsive UI with Tailwind CSS and shadcn/ui
- API calls to backend services

**Backend API Layer (Express)**
- RESTful API endpoints
- Business logic and data validation
- Authentication and authorization
- Database operations via Prisma
- Integration with ML service

**Data Layer (PostgreSQL)**
- Persistent storage for all application data
- Relational data modeling
- Transaction management
- Query optimization

**ML Service Layer (Python/Flask)**
- Recommendation algorithm implementation
- User behavior analysis
- Collaborative filtering
- Independent scaling and deployment

## Components and Interfaces

### Frontend Components

#### Authentication Components
- `LoginForm`: Email/password login with validation
- `SignupForm`: Account creation with password strength indicator
- `PasswordResetForm`: Password recovery flow
- `AuthProvider`: Context for authentication state management

#### User Profile Components
- `ProfilePage`: Main profile view with tabs for blogs and playlists
- `ProfileHeader`: User info, follower counts, follow/unfollow button
- `FollowButton`: Toggle follow state with optimistic updates
- `ProfileEditForm`: Edit user information

#### Blog Components
- `BlogEditor`: Rich-text editor using Tiptap or similar
- `BlogCard`: Preview card for blog listings
- `BlogDetail`: Full blog view with save functionality
- `BlogList`: Paginated list of blogs
- `SaveButton`: Bookmark toggle with visual feedback
- `DraftsList`: User's unpublished drafts

#### Playlist Components
- `PlaylistCard`: Preview card showing playlist info
- `PlaylistDetail`: Full playlist view with movie list
- `PlaylistEditor`: Create/edit playlist with movie search
- `MovieSearchModal`: Search and add movies to playlist
- `MovieCard`: Individual movie display in playlist
- `PlaylistDeleteButton`: Confirmation dialog for deletion

#### Homepage Components
- `HomePage`: Main landing page layout
- `TopBlogsSection`: Carousel or grid of popular blogs
- `QuickReadsSection`: Feed of shorter blog posts
- `FeaturedPlaylistsSection`: Rotating playlist showcase
- `HeroSection`: Welcome banner with call-to-action

#### Recommendation Components
- `RecommendationsPage`: Dedicated recommendations view
- `MovieRecommendations`: Grid of suggested movies
- `BlogRecommendations`: List of suggested blogs
- `RecommendationCard`: Individual recommendation display


### Backend API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/signup          - Create new user account
POST   /api/auth/login           - Authenticate user
POST   /api/auth/logout          - End user session
POST   /api/auth/reset-password  - Request password reset
POST   /api/auth/verify-reset    - Verify reset token and update password
GET    /api/auth/me              - Get current user info
```

#### User Endpoints
```
GET    /api/users/:id            - Get user profile
PUT    /api/users/:id            - Update user profile
GET    /api/users/:id/blogs      - Get user's blogs
GET    /api/users/:id/playlists  - Get user's playlists
GET    /api/users/:id/followers  - Get user's followers
GET    /api/users/:id/following  - Get users being followed
POST   /api/users/:id/follow     - Follow a user
DELETE /api/users/:id/follow     - Unfollow a user
```

#### Blog Endpoints
```
GET    /api/blogs                - List all published blogs (paginated)
GET    /api/blogs/:id            - Get single blog
POST   /api/blogs                - Create new blog (draft or published)
PUT    /api/blogs/:id            - Update blog
DELETE /api/blogs/:id            - Delete blog
POST   /api/blogs/:id/save       - Save/bookmark blog
DELETE /api/blogs/:id/save       - Remove blog from saved
GET    /api/blogs/saved          - Get current user's saved blogs
GET    /api/blogs/drafts         - Get current user's drafts
POST   /api/blogs/:id/view       - Increment view count
```

#### Playlist Endpoints
```
GET    /api/playlists            - List all public playlists
GET    /api/playlists/:id        - Get single playlist
POST   /api/playlists            - Create new playlist
PUT    /api/playlists/:id        - Update playlist
DELETE /api/playlists/:id        - Delete playlist
POST   /api/playlists/:id/movies - Add movie to playlist
DELETE /api/playlists/:id/movies/:movieId - Remove movie from playlist
PUT    /api/playlists/:id/reorder - Reorder movies in playlist
```

#### Homepage Endpoints
```
GET    /api/homepage/top-blogs      - Get top blogs by views
GET    /api/homepage/quick-reads    - Get shorter blogs
GET    /api/homepage/featured-playlists - Get featured playlists
```

#### Recommendation Endpoints
```
GET    /api/recommendations/movies  - Get personalized movie recommendations
GET    /api/recommendations/blogs   - Get personalized blog recommendations
POST   /api/recommendations/track   - Track user interaction for ML
```

#### ML Service Endpoints (Internal)
```
POST   /ml/recommend/movies         - Get movie recommendations for user
POST   /ml/recommend/blogs          - Get blog recommendations for user
POST   /ml/train                    - Trigger model retraining
POST   /ml/track-interaction        - Log user interaction
```


## Data Models

### User Model
```typescript
{
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  username: string (unique)
  displayName: string
  bio: string (optional)
  avatarUrl: string (optional)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  blogs: Blog[]
  playlists: Playlist[]
  savedBlogs: SavedBlog[]
  followers: Follow[] (as followee)
  following: Follow[] (as follower)
}
```

### Blog Model
```typescript
{
  id: string (UUID)
  title: string
  content: string (rich text JSON)
  excerpt: string
  coverImageUrl: string (optional)
  status: enum ('draft', 'published')
  viewCount: number (default: 0)
  publishedAt: DateTime (nullable)
  createdAt: DateTime
  updatedAt: DateTime
  authorId: string (FK to User)
  
  // Relations
  author: User
  savedBy: SavedBlog[]
}
```

### Playlist Model
```typescript
{
  id: string (UUID)
  name: string
  description: string (optional)
  isPublic: boolean (default: true)
  createdAt: DateTime
  updatedAt: DateTime
  userId: string (FK to User)
  
  // Relations
  user: User
  movies: PlaylistMovie[]
}
```

### PlaylistMovie Model (Join Table)
```typescript
{
  id: string (UUID)
  playlistId: string (FK to Playlist)
  movieId: string
  movieTitle: string
  moviePosterUrl: string (optional)
  movieYear: number (optional)
  position: number
  addedAt: DateTime
  
  // Relations
  playlist: Playlist
}
```

### Follow Model (Join Table)
```typescript
{
  id: string (UUID)
  followerId: string (FK to User)
  followeeId: string (FK to User)
  createdAt: DateTime
  
  // Relations
  follower: User
  followee: User
  
  // Unique constraint on (followerId, followeeId)
}
```

### SavedBlog Model (Join Table)
```typescript
{
  id: string (UUID)
  userId: string (FK to User)
  blogId: string (FK to Blog)
  savedAt: DateTime
  
  // Relations
  user: User
  blog: Blog
  
  // Unique constraint on (userId, blogId)
}
```

### UserInteraction Model (For ML)
```typescript
{
  id: string (UUID)
  userId: string (FK to User)
  interactionType: enum ('blog_view', 'blog_save', 'playlist_view', 'movie_add', 'follow')
  targetId: string
  targetType: enum ('blog', 'playlist', 'user', 'movie')
  createdAt: DateTime
}
```


## Error Handling

### Frontend Error Handling
- Display user-friendly error messages using toast notifications
- Implement error boundaries for React component errors
- Show loading states during async operations
- Provide fallback UI for failed data fetches
- Validate forms before submission with clear error messages

### Backend Error Handling
- Use consistent error response format:
```typescript
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

### Error Logging
- Log all server errors with stack traces
- Track error rates and patterns
- Use structured logging for easier debugging
- Implement request ID tracking across services

### ML Service Error Handling
- Return fallback recommendations on ML service failure
- Implement circuit breaker pattern for ML service calls
- Cache recent recommendations as backup
- Log ML service errors separately for monitoring


## Testing Strategy

### Frontend Testing
- **Unit Tests**: Test utility functions and hooks with Jest
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test user flows with Playwright or Cypress
- **Visual Regression**: Optional snapshot testing for UI consistency

### Backend Testing
- **Unit Tests**: Test business logic and utilities with Jest
- **Integration Tests**: Test API endpoints with supertest
- **Database Tests**: Test Prisma queries with test database
- **Authentication Tests**: Verify JWT token handling and security

### ML Service Testing
- **Unit Tests**: Test recommendation algorithms with pytest
- **Integration Tests**: Test API endpoints with Flask test client
- **Model Tests**: Validate recommendation quality metrics
- **Performance Tests**: Ensure response times meet requirements

### End-to-End Testing
- Test critical user journeys:
  - User signup and login
  - Blog creation and publishing
  - Playlist creation and movie management
  - Following users and viewing profiles
  - Saving blogs and viewing recommendations

### Test Data
- Use factories or fixtures for consistent test data
- Seed test database with realistic data
- Mock external services (ML service in backend tests)
- Clean up test data after each test run


## Security Considerations

### Authentication & Authorization
- Store passwords using bcrypt with salt rounds >= 10
- Use JWT tokens with short expiration (15 minutes for access, 7 days for refresh)
- Store tokens in httpOnly cookies to prevent XSS attacks
- Implement CSRF protection for state-changing operations
- Validate user ownership before allowing updates/deletes

### Data Validation
- Validate all user input on both frontend and backend
- Sanitize rich-text content to prevent XSS
- Use Prisma's parameterized queries to prevent SQL injection
- Implement rate limiting on API endpoints
- Validate file uploads (size, type) if implementing image uploads

### API Security
- Use HTTPS in production
- Implement CORS with specific allowed origins
- Add request size limits to prevent DoS
- Use helmet.js for security headers
- Implement API rate limiting per user/IP

### Data Privacy
- Don't expose sensitive user data in API responses
- Hash passwords before storing
- Implement proper session management
- Allow users to delete their accounts and data
- Follow GDPR principles for data handling

## UI/UX Design Specifications

### Dark Theme Design (Netflix-Inspired)

**Color Palette**
- Primary Background: `#141414` (near black)
- Secondary Background: `#1a1a1a` (slightly lighter)
- Card Background: `#2a2a2a` (elevated surfaces)
- Primary Text: `#ffffff` (white)
- Secondary Text: `#b3b3b3` (muted gray)
- Accent Color: `#e50914` (Netflix red for CTAs and highlights)
- Hover States: `#333333` (subtle elevation)
- Border Color: `#404040` (subtle dividers)

**Typography**
- Font Family: Inter or similar modern sans-serif
- Headings: Bold, high contrast white
- Body Text: Regular weight, slightly muted white
- Font Sizes: Responsive scale (mobile-first)

**Component Styling**
- Cards: Dark background with subtle border, hover effect with slight elevation
- Buttons: Primary (red accent), Secondary (white outline), Ghost (transparent)
- Forms: Dark inputs with white text, red focus rings
- Navigation: Fixed dark header with transparency on scroll
- Modals: Dark overlay with centered content card

**Login/Signup Pages**
- Full-screen dark background with gradient or subtle pattern
- Centered authentication form with elevated card design
- Large, cinematic hero image or video background (optional)
- Minimal distractions, focus on the form
- Clear call-to-action buttons in accent color

**Accessibility in Dark Mode**
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Use white text on dark backgrounds for readability
- Provide focus indicators for keyboard navigation
- Ensure interactive elements have sufficient contrast

## Performance Optimization

### Frontend Performance
- Implement code splitting for faster initial load
- Use Next.js Image component for optimized images
- Implement infinite scroll or pagination for lists
- Cache API responses with SWR or React Query
- Lazy load components below the fold

### Backend Performance
- Add database indexes on frequently queried fields:
  - User: email, username
  - Blog: authorId, status, publishedAt
  - Playlist: userId
  - Follow: followerId, followeeId
- Implement query result caching with Redis (optional for MVP)
- Use database connection pooling
- Optimize N+1 queries with Prisma includes
- Implement pagination for list endpoints

### Database Optimization
- Create composite indexes for common query patterns
- Use database-level constraints for data integrity
- Implement soft deletes if needed for audit trails
- Regular database maintenance and query analysis

### ML Service Performance
- Cache recommendation results for short periods (5-10 minutes)
- Implement async processing for model training
- Use batch processing for user interaction tracking
- Consider pre-computing recommendations for active users

## Deployment Architecture

### Frontend Deployment (Vercel)
- Automatic deployments from main branch
- Preview deployments for pull requests
- Environment variables for API URLs
- CDN for static assets

### Backend Deployment (Railway/Render)
- Container-based deployment
- Auto-scaling based on load
- Environment variables for secrets
- Database connection via connection string

### Database Hosting
- Managed PostgreSQL (Railway, Supabase, or Neon)
- Automated backups
- Connection pooling enabled
- SSL connections required

### ML Service Deployment
- Separate container deployment
- Independent scaling from main backend
- Health check endpoints
- Fallback handling in main backend

## Development Workflow

### Project Structure
```
movie-community-platform/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API clients
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── services/       # External service integrations
│   │   └── utils/          # Helper functions
│   └── prisma/             # Database schema and migrations
└── ml-service/             # Python ML service
    ├── app/                # Flask application
    ├── models/             # ML models
    └── utils/              # Helper functions
```

### Environment Variables
**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (.env)**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ML_SERVICE_URL=http://localhost:5000
PORT=3001
```

**ML Service (.env)**
```
DATABASE_URL=postgresql://...
FLASK_ENV=development
PORT=5000
```

### Development Commands
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint

# Backend
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run migrate      # Run database migrations

# ML Service
python app.py        # Start Flask server
pytest               # Run tests
```
