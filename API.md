# API Documentation - Web App Escala

## Base URL

- **Development**: `http://localhost:1337/api`
- **Production**: Configure via `NEXT_PUBLIC_API_URL`

## Authentication

All protected endpoints require JWT authentication.

### Get JWT Token

**Endpoint**: `POST /auth/local`

**Request Body**:
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Using JWT

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Content Types

### 1. Shifts

Manage work shifts with start and end times.

#### List All Shifts

**Endpoint**: `GET /shifts`

**Query Parameters**:
- `pagination[page]` - Page number (default: 1)
- `pagination[pageSize]` - Items per page (default: 25)
- `filters[name][$contains]` - Filter by name
- `filters[active][$eq]` - Filter by active status
- `sort` - Sort field (e.g., `name:asc`)
- `populate` - Relations to populate (e.g., `schedules`)

**Example Request**:
```bash
curl http://localhost:1337/api/shifts?pagination[page]=1&pagination[pageSize]=10
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Morning Shift",
        "startTime": "08:00:00",
        "endTime": "16:00:00",
        "description": "Standard morning shift",
        "active": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "publishedAt": "2025-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Single Shift

**Endpoint**: `GET /shifts/:id`

**Example Request**:
```bash
curl http://localhost:1337/api/shifts/1
```

#### Create Shift

**Endpoint**: `POST /shifts`

**Authentication**: Required

**Request Body**:
```json
{
  "data": {
    "name": "Night Shift",
    "startTime": "20:00:00",
    "endTime": "04:00:00",
    "description": "Overnight shift",
    "active": true
  }
}
```

**Response**:
```json
{
  "data": {
    "id": 2,
    "attributes": {
      "name": "Night Shift",
      "startTime": "20:00:00",
      "endTime": "04:00:00",
      "description": "Overnight shift",
      "active": true,
      "createdAt": "2025-01-02T00:00:00.000Z",
      "updatedAt": "2025-01-02T00:00:00.000Z",
      "publishedAt": "2025-01-02T00:00:00.000Z"
    }
  }
}
```

#### Update Shift

**Endpoint**: `PUT /shifts/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "data": {
    "active": false
  }
}
```

#### Delete Shift

**Endpoint**: `DELETE /shifts/:id`

**Authentication**: Required

---

### 2. Schedules

Manage work schedules with date ranges and user assignments.

#### List All Schedules

**Endpoint**: `GET /schedules`

**Query Parameters**:
- `pagination[page]` - Page number
- `pagination[pageSize]` - Items per page
- `filters[status][$eq]` - Filter by status (draft, active, completed, cancelled)
- `filters[startDate][$gte]` - Filter by start date (greater than or equal)
- `filters[endDate][$lte]` - Filter by end date (less than or equal)
- `populate[users]` - Populate users relation
- `populate[shifts]` - Populate shifts relation

**Example Request**:
```bash
curl http://localhost:1337/api/schedules?populate[users]=*&populate[shifts]=*
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "January 2025 Schedule",
        "startDate": "2025-01-01",
        "endDate": "2025-01-31",
        "description": "Monthly schedule for January",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "publishedAt": "2025-01-01T00:00:00.000Z",
        "users": {
          "data": [...]
        },
        "shifts": {
          "data": [...]
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Single Schedule

**Endpoint**: `GET /schedules/:id`

#### Create Schedule

**Endpoint**: `POST /schedules`

**Authentication**: Required

**Request Body**:
```json
{
  "data": {
    "title": "February 2025 Schedule",
    "startDate": "2025-02-01",
    "endDate": "2025-02-28",
    "description": "Monthly schedule for February",
    "status": "draft",
    "users": [1, 2, 3],
    "shifts": [1, 2]
  }
}
```

#### Update Schedule

**Endpoint**: `PUT /schedules/:id`

**Authentication**: Required

#### Delete Schedule

**Endpoint**: `DELETE /schedules/:id`

**Authentication**: Required

---

### 3. Announcements

Manage system announcements with priorities and target audiences.

#### List All Announcements

**Endpoint**: `GET /announcements`

**Query Parameters**:
- `filters[active][$eq]` - Filter by active status
- `filters[priority][$eq]` - Filter by priority (low, medium, high, urgent)
- `filters[startDate][$lte]` - Announcements that have started
- `filters[endDate][$gte]` - Announcements that haven't ended
- `populate[author]` - Populate author relation
- `populate[targetUsers]` - Populate target users

**Example Request**:
```bash
curl http://localhost:1337/api/announcements?filters[active][$eq]=true&populate[author]=*
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "System Maintenance",
        "content": "The system will be under maintenance on...",
        "priority": "high",
        "startDate": "2025-01-15T00:00:00.000Z",
        "endDate": "2025-01-16T00:00:00.000Z",
        "active": true,
        "createdAt": "2025-01-10T00:00:00.000Z",
        "updatedAt": "2025-01-10T00:00:00.000Z",
        "publishedAt": "2025-01-10T00:00:00.000Z",
        "author": {
          "data": {...}
        },
        "targetUsers": {
          "data": [...]
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Single Announcement

**Endpoint**: `GET /announcements/:id`

#### Create Announcement

**Endpoint**: `POST /announcements`

**Authentication**: Required

**Request Body**:
```json
{
  "data": {
    "title": "Holiday Schedule",
    "content": "Please note the holiday schedule changes...",
    "priority": "medium",
    "startDate": "2025-12-20T00:00:00.000Z",
    "endDate": "2026-01-05T00:00:00.000Z",
    "active": true,
    "author": 1,
    "targetUsers": [1, 2, 3, 4, 5]
  }
}
```

#### Update Announcement

**Endpoint**: `PUT /announcements/:id`

**Authentication**: Required

#### Delete Announcement

**Endpoint**: `DELETE /announcements/:id`

**Authentication**: Required

---

### 4. Audit Logs

Track all system actions for auditing purposes.

#### List All Audit Logs

**Endpoint**: `GET /audit-logs`

**Query Parameters**:
- `filters[action][$eq]` - Filter by action (create, read, update, delete, login, logout)
- `filters[entityType][$eq]` - Filter by entity type
- `filters[user][id][$eq]` - Filter by user ID
- `filters[timestamp][$gte]` - Filter by timestamp (greater than or equal)
- `populate[user]` - Populate user relation
- `sort` - Sort field (e.g., `timestamp:desc`)

**Example Request**:
```bash
curl http://localhost:1337/api/audit-logs?sort=timestamp:desc&populate[user]=*
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "action": "create",
        "entityType": "shift",
        "entityId": "2",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "name": "Night Shift",
          "startTime": "20:00:00"
        },
        "timestamp": "2025-01-02T10:30:00.000Z",
        "createdAt": "2025-01-02T10:30:00.000Z",
        "updatedAt": "2025-01-02T10:30:00.000Z",
        "user": {
          "data": {...}
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Single Audit Log

**Endpoint**: `GET /audit-logs/:id`

#### Create Audit Log

**Endpoint**: `POST /audit-logs`

**Authentication**: Required

**Request Body**:
```json
{
  "data": {
    "action": "login",
    "entityType": "user",
    "entityId": "1",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "details": {
      "success": true
    },
    "user": 1
  }
}
```

**Note**: Audit logs typically should not be deleted. They are read-only for most users.

---

## Common Query Parameters

### Pagination

```
?pagination[page]=1&pagination[pageSize]=10
```

### Filters

**Equals**:
```
?filters[field][$eq]=value
```

**Not equals**:
```
?filters[field][$ne]=value
```

**Contains** (string):
```
?filters[field][$contains]=value
```

**Greater than / Less than**:
```
?filters[field][$gt]=value
?filters[field][$lt]=value
?filters[field][$gte]=value
?filters[field][$lte]=value
```

**In array**:
```
?filters[field][$in][0]=value1&filters[field][$in][1]=value2
```

**Between**:
```
?filters[field][$between][0]=value1&filters[field][$between][1]=value2
```

### Sorting

**Ascending**:
```
?sort=field:asc
```

**Descending**:
```
?sort=field:desc
```

**Multiple fields**:
```
?sort[0]=field1:asc&sort[1]=field2:desc
```

### Population (Relations)

**Populate all relations**:
```
?populate=*
```

**Populate specific relation**:
```
?populate[relation]=*
```

**Deep populate**:
```
?populate[relation][populate][nestedRelation]=*
```

### Fields Selection

**Select specific fields**:
```
?fields[0]=field1&fields[1]=field2
```

## Error Responses

### 400 Bad Request
```json
{
  "data": null,
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Invalid request data",
    "details": {}
  }
}
```

### 401 Unauthorized
```json
{
  "data": null,
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "Missing or invalid credentials",
    "details": {}
  }
}
```

### 403 Forbidden
```json
{
  "data": null,
  "error": {
    "status": 403,
    "name": "ForbiddenError",
    "message": "Forbidden",
    "details": {}
  }
}
```

### 404 Not Found
```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found",
    "details": {}
  }
}
```

### 500 Internal Server Error
```json
{
  "data": null,
  "error": {
    "status": 500,
    "name": "InternalServerError",
    "message": "Internal Server Error",
    "details": {}
  }
}
```

## Rate Limiting

Strapi has built-in rate limiting. Default limits:
- **Public endpoints**: 10 requests per second
- **Authenticated endpoints**: 20 requests per second

Configure in `backend/config/middlewares.ts` if needed.

## CORS

CORS is configured to allow requests from the frontend origin.

Configure in `backend/config/middlewares.ts`:
```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
  },
}
```

## Best Practices

### 1. Always Use HTTPS in Production
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL; // https://api.yourdomain.com
```

### 2. Handle Errors Gracefully
```typescript
try {
  const response = await fetch(`${API_URL}/shifts`);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
}
```

### 3. Use Pagination for Large Datasets
```javascript
const params = new URLSearchParams({
  'pagination[page]': '1',
  'pagination[pageSize]': '10',
});
```

### 4. Populate Only What You Need
```javascript
// Good
?populate[users]=*

// Avoid
?populate=* // May include unnecessary data
```

### 5. Cache Responses When Appropriate
```javascript
const response = await fetch(`${API_URL}/shifts`, {
  next: { revalidate: 3600 } // Cache for 1 hour
});
```

## SDK / Client Libraries

### JavaScript/TypeScript Example

```typescript
class EscalaAPI {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getShifts(params?: Record<string, any>) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/shifts${queryString ? `?${queryString}` : ''}`);
  }

  async createShift(data: any) {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Add more methods as needed...
}

// Usage
const api = new EscalaAPI('http://localhost:1337/api', 'your-jwt-token');
const shifts = await api.getShifts({ 'pagination[pageSize]': 10 });
```

## Additional Resources

- [Strapi REST API Documentation](https://docs.strapi.io/dev-docs/api/rest)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

For questions or issues, please refer to the [GitHub repository](https://github.com/wemersonnino/FullStack).
