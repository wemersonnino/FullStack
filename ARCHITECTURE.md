# Architecture Documentation - Web App Escala

## Overview

Web App Escala is a full-stack application built with modern technologies, following best practices for scalability, maintainability, and security.

## Technology Stack

### Frontend Layer
```
┌─────────────────────────────────────────────────┐
│             Next.js 15 Application              │
├─────────────────────────────────────────────────┤
│  • App Router (React Server Components)         │
│  • TypeScript for type safety                   │
│  • Tailwind CSS 4 for styling                   │
│  • next-intl for i18n (PT/EN)                   │
│  • NextAuth.js for authentication               │
│  • next-themes for theme management             │
│  • Zustand for client state                     │
│  • Zod for schema validation                    │
│  • Radix UI for accessible components           │
└─────────────────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────────────────┐
│         Strapi v5 Headless CMS                  │
├─────────────────────────────────────────────────┤
│  • REST API                                     │
│  • Content Type Builder                         │
│  • Users & Permissions Plugin                   │
│  • TypeScript support                           │
│  • Customizable Controllers/Services            │
└─────────────────────────────────────────────────┘
```

### Database Layer
```
┌─────────────────────────────────────────────────┐
│          PostgreSQL 16                          │
├─────────────────────────────────────────────────┤
│  • Relational data storage                      │
│  • ACID compliance                              │
│  • Complex queries support                      │
│  • Full-text search capabilities                │
└─────────────────────────────────────────────────┘
```

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        User Browser                         │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼───────────────────────────────────┐
│                   Frontend (Next.js 15)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI Components (React)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │         State Management (Zustand)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │       Authentication (NextAuth.js)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │      Internationalization (next-intl)                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │          Theme Management (next-themes)               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ REST API (HTTP/JSON)
                         │
┌────────────────────────▼───────────────────────────────────┐
│                  Backend (Strapi v5)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST API Layer                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │         Controllers & Routes                          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │            Business Logic (Services)                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │        Authentication & Authorization                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              Content Types                            │  │
│  │  • Shifts      • Schedules                           │  │
│  │  • Announcements  • Audit Logs                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ PostgreSQL Protocol
                         │
┌────────────────────────▼───────────────────────────────────┐
│                 Database (PostgreSQL 16)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Data Tables                             │  │
│  │  • users              • shifts                        │  │
│  │  • schedules          • announcements                 │  │
│  │  • audit_logs         • relations                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│     User        │
│ (Strapi Plugin) │
├─────────────────┤
│ • id            │
│ • username      │
│ • email         │
│ • password      │
└────────┬────────┘
         │
         │ Many-to-Many
         │
┌────────▼────────┐         ┌──────────────┐
│   Schedule      │────────▶│    Shift     │
├─────────────────┤         ├──────────────┤
│ • id            │         │ • id         │
│ • title         │ M:M     │ • name       │
│ • startDate     │◀────────│ • startTime  │
│ • endDate       │         │ • endTime    │
│ • description   │         │ • description│
│ • status        │         │ • active     │
└─────────────────┘         └──────────────┘
         │
         │
         ▼
┌─────────────────┐         ┌──────────────┐
│  Announcement   │         │  Audit Log   │
├─────────────────┤         ├──────────────┤
│ • id            │         │ • id         │
│ • title         │         │ • action     │
│ • content       │         │ • entityType │
│ • priority      │         │ • entityId   │
│ • startDate     │         │ • user       │
│ • endDate       │         │ • ipAddress  │
│ • active        │         │ • userAgent  │
│ • author ───────┼─────────│ • details    │
│ • targetUsers   │         │ • timestamp  │
└─────────────────┘         └──────────────┘
```

## Authentication Flow

```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Strapi  │
└────┬─────┘                              └────┬─────┘
     │                                          │
     │  1. Login Request (email/password)      │
     ├─────────────────────────────────────────▶
     │                                          │
     │         2. Validate Credentials          │
     │                                          │
     │  3. Return JWT + User Data              │
     ◀─────────────────────────────────────────┤
     │                                          │
     │  4. Store JWT in Session                │
     │     (NextAuth.js)                        │
     │                                          │
     │  5. Subsequent Requests                 │
     │     (Authorization: Bearer JWT)          │
     ├─────────────────────────────────────────▶
     │                                          │
     │  6. Verify JWT                          │
     │                                          │
     │  7. Return Protected Resource           │
     ◀─────────────────────────────────────────┤
     │                                          │
```

## Request Flow

### 1. User Interaction
```
User → Next.js Page → React Component → API Call
```

### 2. API Request
```
Frontend → Next.js API Route / Direct Fetch → Strapi REST API
```

### 3. Data Processing
```
Strapi Controller → Service Layer → Database Query → Response
```

### 4. Response
```
Database → Strapi → Frontend → React Update → UI Render
```

## Internationalization (i18n) Architecture

```
┌────────────────────────────────────────┐
│          User Preference               │
│        (Browser/Cookie/URL)            │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│        next-intl Middleware            │
│     (Locale Detection & Routing)       │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│       Load Messages File               │
│     (messages/pt.json or en.json)      │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│      Render Page with Locale           │
│    (useTranslations hook in RSC)       │
└────────────────────────────────────────┘
```

## State Management Architecture

### Client State (Zustand)
```typescript
┌─────────────────────────────────────┐
│        Zustand Store                │
├─────────────────────────────────────┤
│  • user: User | null                │
│  • theme: 'light' | 'dark' | ...    │
│  • locale: 'en' | 'pt'              │
│  • setUser()                        │
│  • setTheme()                       │
│  • setLocale()                      │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      LocalStorage Persistence       │
│         (zustand/middleware)        │
└─────────────────────────────────────┘
```

### Server State (React Server Components)
- Data fetched at server side
- No client-side state management needed for static data
- Automatic revalidation with Next.js

## Security Architecture

### Frontend Security
- **CSRF Protection**: NextAuth.js built-in protection
- **XSS Prevention**: React's automatic escaping
- **Secure Cookies**: httpOnly, secure, sameSite
- **Environment Variables**: Client-side variables prefixed with NEXT_PUBLIC_

### Backend Security
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Password Hashing**: bcrypt
- **Rate Limiting**: Built-in Strapi middleware
- **CORS**: Configurable per environment
- **SQL Injection**: ORM protection (Knex.js)

### Database Security
- **Encrypted Connections**: SSL/TLS support
- **Least Privilege**: Separate user accounts
- **Backup Strategy**: Regular automated backups
- **Audit Logging**: All operations logged

## Deployment Architecture

### Development
```
Docker Compose
├── PostgreSQL Container (port 5432)
├── Strapi Container (port 1337)
│   └── Hot Reload Enabled
└── Next.js Container (port 3000)
    └── Turbopack Dev Server
```

### Production
```
Docker Compose / Kubernetes
├── PostgreSQL Container
│   └── Persistent Volume
├── Strapi Container (Replicas: 2+)
│   └── Production Build
└── Next.js Container (Replicas: 2+)
    └── Standalone Build
```

### Recommended Production Setup
```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN              │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         ▼           ▼
┌────────────┐ ┌────────────┐
│  Frontend  │ │  Frontend  │
│  (Next.js) │ │  (Next.js) │
└──────┬─────┘ └──────┬─────┘
       │              │
       └──────┬───────┘
              │
         ┌────▼─────┐
         │  Backend │
         │ (Strapi) │
         └────┬─────┘
              │
         ┌────▼─────┐
         │   DB     │
         │(PostgreSQL)
         └──────────┘
```

## Performance Optimization

### Frontend
- **Static Generation**: Pre-render pages at build time
- **Server Components**: Reduce client-side JavaScript
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: next/image component
- **Font Optimization**: next/font (disabled in current setup)

### Backend
- **Caching**: Redis (can be added)
- **Database Indexing**: Optimized queries
- **Connection Pooling**: PostgreSQL connection pool
- **Lazy Loading**: Relations loaded on demand

### Database
- **Indexes**: Primary and foreign keys
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Max 10 connections
- **Read Replicas**: Can be added for scaling

## Monitoring & Logging

### Frontend
- **Console Logs**: Development only
- **Error Tracking**: Can integrate Sentry
- **Analytics**: Can integrate Google Analytics

### Backend
- **Strapi Logs**: Built-in logging
- **Audit Logs**: Custom audit log content type
- **Performance Monitoring**: Can add APM tools

### Database
- **Query Logs**: PostgreSQL logging
- **Slow Query Log**: Identify bottlenecks
- **Connection Monitoring**: Track active connections

## Scalability Considerations

### Horizontal Scaling
- Frontend and Backend can be replicated
- Load balancer distributes traffic
- Stateless architecture (JWT)

### Vertical Scaling
- Increase container resources
- Optimize database performance
- Add caching layers

### Database Scaling
- Read replicas for read-heavy workloads
- Partitioning for large tables
- Regular maintenance and vacuuming

## Future Enhancements

### Planned Features
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced search and filtering
- [ ] Data export functionality (CSV, PDF)
- [ ] Email notifications
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenancy support

### Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment
- [ ] Redis caching layer
- [ ] Elasticsearch for search
- [ ] Prometheus + Grafana monitoring
- [ ] Automated backups
- [ ] Blue-green deployment

## Conclusion

The Web App Escala architecture is designed to be:
- **Scalable**: Horizontal and vertical scaling options
- **Maintainable**: Clear separation of concerns
- **Secure**: Multiple layers of security
- **Modern**: Latest technologies and best practices
- **Flexible**: Easy to extend and customize

For more information, see:
- [Setup Guide](./SETUP.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [README](./README.md)
