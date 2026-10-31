# School Management System — API Documentation

**Base URL:** `http://localhost:4000/api/v1`
**Content-Type:** `application/json`
**Auth:** JWT stored in httpOnly cookies (`accessToken`, `refreshToken`) **or** `Authorization: Bearer <accessToken>` header.

---

## Standard Response Envelope

Every response follows one of these two shapes.

**Success**
```json
{
  "success": true,
  "data": <object | array | null>,
  "meta": { "page": 1, "limit": 20, "total": 143 }
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

### Error Codes

| HTTP | `code` | Meaning |
|------|--------|---------|
| 400 | `BAD_REQUEST` | Malformed input / missing required field |
| 400 | `VALIDATION_ERROR` | Zod schema failure (includes `details`) |
| 401 | `UNAUTHORIZED` | Missing/expired token, or account inactive |
| 403 | `FORBIDDEN` | Role not allowed, or cross-department access |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate (email, employeeCode, admissionNo) |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## Authentication

### Login

`POST /auth/login` — **Public**

**Request**
```json
{
  "email": "admin@school.local",
  "password": "Admin@12345"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx9f3k2b0000abcd1234efgh",
      "email": "admin@school.local",
      "role": "ADMIN",
      "departmentId": null
    }
  }
}
```

Cookies `accessToken` and `refreshToken` are also set on the response.

**Errors**
- `401 UNAUTHORIZED` — invalid credentials
- `401 UNAUTHORIZED` — account inactive or soft-deleted

**cURL**
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.local","password":"Admin@12345"}'
```

---

### Refresh Access Token

`POST /auth/refresh` — **Public (requires refresh token cookie or body)**

**Request** (if not sending cookie)
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**
- `401 UNAUTHORIZED` — refresh token revoked, expired, or invalid
- `401 UNAUTHORIZED` — user inactive/deleted since token was issued

---

### Logout

`POST /auth/logout` — **Authenticated**

**Request:** none (reads cookie or `{ "refreshToken": "..." }`)

**Response `200`**
```json
{ "success": true, "data": null }
```

Clears both cookies and revokes the refresh token in the database.

---

### Current User

`GET /auth/me` — **Authenticated**

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0000abcd1234efgh",
    "role": "TEACHER",
    "departmentId": "clx9f3k2b0001abcd1234efgh",
    "tokenVersion": 0
  }
}
```

**Errors**
- `401 UNAUTHORIZED` — missing/expired token, or `tokenVersion` mismatch (user was soft-deleted)

---

## Admin — Users

All routes below require `Authorization: Bearer <token>` **or** a valid `accessToken` cookie **and** `role: "ADMIN"`.

### List Users

`GET /admin/users` — **Admin only**

**Query parameters**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | int | 1 | |
| `limit` | int | 20 | max 100 |
| `role` | `ADMIN` \| `TEACHER` \| `STUDENT` \| `PARENT` | — | filter |
| `departmentId` | cuid | — | filters users whose teacher/student profile is in this dept |
| `isActive` | `true` \| `false` | — | filters inactive users |
| `search` | string | — | substring match on email |
| `sortBy` | string | `createdAt` | |
| `sortDir` | `asc` \| `desc` | `desc` | |

Excludes soft-deleted users.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0002abcd1234efgh",
      "email": "jane.doe@school.local",
      "role": "TEACHER",
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2025-01-15T09:12:00.000Z",
      "updatedAt": "2025-01-15T09:12:00.000Z",
      "teacherProfile": {
        "firstName": "Jane",
        "lastName": "Doe",
        "departmentId": "clx9f3k2b0001abcd1234efgh"
      },
      "studentProfile": null,
      "parentProfile": null
    },
    {
      "id": "clx9f3k2b0003abcd1234efgh",
      "email": "sam.lee@school.local",
      "role": "STUDENT",
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2025-01-14T11:00:00.000Z",
      "updatedAt": "2025-01-14T11:00:00.000Z",
      "teacherProfile": null,
      "studentProfile": {
        "firstName": "Sam",
        "lastName": "Lee",
        "departmentId": "clx9f3k2b0001abcd1234efgh"
      },
      "parentProfile": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 2 }
}
```

**cURL**
```bash
curl -b cookies.txt "http://localhost:4000/api/v1/admin/users?role=TEACHER&page=1&limit=20"
```

---

### List Archived (Departed) Users

`GET /admin/users/archived` — **Admin only**

**Query parameters**

| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 20 |
| `role` | enum | — |

Returns users with `deletedAt != null` (teachers/students/parents who have left).

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0004abcd1234efgh",
      "email": "old.teacher@school.local",
      "role": "TEACHER",
      "isActive": false,
      "deletedAt": "2025-03-01T08:00:00.000Z",
      "teacherProfile": {
        "id": "clx9f3k2b0005abcd1234efgh",
        "firstName": "Mark",
        "lastName": "Stone",
        "employeeCode": "EMP019",
        "departmentId": "clx9f3k2b0001abcd1234efgh",
        "deletedAt": "2025-03-01T08:00:00.000Z",
        "isActive": false
      },
      "studentProfile": null,
      "parentProfile": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

**cURL**
```bash
curl -b cookies.txt "http://localhost:4000/api/v1/admin/users/archived?page=1&limit=10"
```

---

### Create User

`POST /admin/users` — **Admin only**

Creates a `User` + the matching profile (`Teacher` / `Student` / `Parent`) in a single transaction. `ADMIN` has no profile table.

**Request — Teacher**
```json
{
  "email": "jane.doe@school.local",
  "password": "Teacher@123",
  "role": "TEACHER",
  "firstName": "Jane",
  "lastName": "Doe",
  "employeeCode": "EMP001",
  "hireDate": "2024-01-15",
  "departmentId": "clx9f3k2b0001abcd1234efgh"
}
```

**Request — Student**
```json
{
  "email": "sam.lee@school.local",
  "password": "Student@123",
  "role": "STUDENT",
  "firstName": "Sam",
  "lastName": "Lee",
  "admissionNo": "ADM2024001",
  "dateOfBirth": "2010-05-22",
  "departmentId": "clx9f3k2b0001abcd1234efgh",
  "parentId": "clx9f3k2b0006abcd1234efgh"
}
```
> `parentId` optional — link a parent at creation, or update later via `PATCH`.

**Request — Parent**
```json
{
  "email": "parent.lee@example.com",
  "password": "Parent@123",
  "role": "PARENT",
  "firstName": "Michael",
  "lastName": "Lee",
  "phone": "+254712345678"
}
```

**Request — Admin**
```json
{
  "email": "admin2@school.local",
  "password": "Admin@12345",
  "role": "ADMIN"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0002abcd1234efgh",
    "email": "jane.doe@school.local",
    "passwordHash": "$2a$12$...",
    "role": "TEACHER",
    "isActive": true,
    "tokenVersion": 0,
    "deletedAt": null,
    "createdAt": "2025-01-15T09:12:00.000Z",
    "updatedAt": "2025-01-15T09:12:00.000Z",
    "teacherProfile": {
      "id": "clx9f3k2b0007abcd1234efgh",
      "userId": "clx9f3k2b0002abcd1234efgh",
      "departmentId": "clx9f3k2b0001abcd1234efgh",
      "firstName": "Jane",
      "lastName": "Doe",
      "employeeCode": "EMP001",
      "hireDate": "2024-01-15T00:00:00.000Z",
      "isActive": true,
      "deletedAt": null
    },
    "studentProfile": null,
    "parentProfile": null
  }
}
```

> **Note:** `passwordHash` is returned by the current implementation. Consider stripping it in the response in a later hardening pass — see the note in the users service.

**Errors**
- `409 CONFLICT` — email already in use
- `400 BAD_REQUEST` — missing required field for the chosen role (`departmentId`, `employeeCode`, `admissionNo`, etc.)
- `400 BAD_REQUEST` — invalid `departmentId` / `parentId`
- `400 VALIDATION_ERROR` — Zod discriminated union failure

**cURL**
```bash
curl -b cookies.txt -X POST http://localhost:4000/api/v1/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email":"jane.doe@school.local",
    "password":"Teacher@123",
    "role":"TEACHER",
    "firstName":"Jane",
    "lastName":"Doe",
    "employeeCode":"EMP001",
    "hireDate":"2024-01-15",
    "departmentId":"clx9f3k2b0001abcd1234efgh"
  }'
```

---

### Get User

`GET /admin/users/:id` — **Admin only**

**Path:** `id` = cuid

**Response `200`** — same shape as the `Create User` response above.

**Errors**
- `404 NOT_FOUND` — user does not exist

**cURL**
```bash
curl -b cookies.txt http://localhost:4000/api/v1/admin/users/clx9f3k2b0002abcd1234efgh
```

---

### Update User

`PATCH /admin/users/:id` — **Admin only**

Any field is optional. Profile fields are nested under `profile`.

**Request**
```json
{
  "email": "jane.doe2@school.local",
  "isActive": true,
  "profile": {
    "firstName": "Janet",
    "lastName": "Doe-Smith",
    "departmentId": "clx9f3k2b0008abcd1234efgh",
    "parentId": null
  }
}
```

**Response `200`** — full user object (same shape as Create).

**Errors**
- `404 NOT_FOUND`
- `409 CONFLICT` — new email already used by another user

**cURL**
```bash
curl -b cookies.txt -X PATCH http://localhost:4000/api/v1/admin/users/clx9f3k2b0002abcd1234efgh \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'
```

---

### Soft-Delete (Archive) User

`DELETE /admin/users/:id` — **Admin only**

Archives a departed teacher/student/parent. **No data is deleted.** Sets `deletedAt`, `isActive: false` on `User` and on the matching profile, and increments `tokenVersion` so any live JWT is invalidated immediately.

**Response `200`**
```json
{
  "success": true,
  "data": { "id": "clx9f3k2b0002abcd1234efgh", "restored": false }
}
```

**Errors**
- `404 NOT_FOUND`
- `409 CONFLICT` — user already archived

**cURL**
```bash
curl -b cookies.txt -X DELETE http://localhost:4000/api/v1/admin/users/clx9f3k2b0002abcd1234efgh
```

---

### Restore Archived User

`POST /admin/users/:id/restore` — **Admin only**

Clears `deletedAt` and sets `isActive: true` on both `User` and the matching profile. Historical references remain intact.

**Response `200`**
```json
{
  "success": true,
  "data": { "id": "clx9f3k2b0002abcd1234efgh", "restored": true }
}
```

**Errors**
- `404 NOT_FOUND`
- `409 CONFLICT` — user is not archived

**cURL**
```bash
curl -b cookies.txt -X POST http://localhost:4000/api/v1/admin/users/clx9f3k2b0002abcd1234efgh/restore
```

---

## Health Check

`GET /health` — **Public**

**Response `200`**
```json
{ "success": true, "data": "ok" }
```

---

## Common Auth Failure Examples

**Missing token** (any authenticated route)
```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "No token provided" }
}
```

**Insufficient role** (e.g., teacher calling admin route)
```json
{
  "success": false,
  "error": { "code": "FORBIDDEN", "message": "Insufficient role" }
}
```

**Cross-department access** (once `scopeDepartment` is applied)
```json
{
  "success": false,
  "error": { "code": "FORBIDDEN", "message": "Cross-department access denied" }
}
```

**Validation failure**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "fieldErrors": {
        "email": ["Invalid email"],
        "password": ["Password must be at least 8 chars"]
      },
      "formErrors": []
    }
  }
}
```

---

## Postman / `.http` Quick Collection

Save as `api.http` and run with the REST Client extension, or import to Postman:

```http
### Health
GET http://localhost:4000/api/v1/health

### Login (saves cookies)
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@school.local",
  "password": "Admin@12345"
}

### Me
GET http://localhost:4000/api/v1/auth/me

### List users
GET http://localhost:4000/api/v1/admin/users?page=1&limit=20

### List archived
GET http://localhost:4000/api/v1/admin/users/archived

### Create teacher
POST http://localhost:4000/api/v1/admin/users
Content-Type: application/json

{
  "email": "t1@school.local",
  "password": "Teacher@123",
  "role": "TEACHER",
  "firstName": "Jane",
  "lastName": "Doe",
  "employeeCode": "EMP001",
  "hireDate": "2024-01-15",
  "departmentId": "REPLACE_WITH_DEPT_CUID"
}

### Archive
DELETE http://localhost:4000/api/v1/admin/users/REPLACE_WITH_USER_CUID

### Restore
POST http://localhost:4000/api/v1/admin/users/REPLACE_WITH_USER_CUID/restore

### Logout
POST http://localhost:4000/api/v1/auth/logout
```

---

## Notes on the current state

- **Password hash exposure:** the `Create / Get / Update` user responses currently include `passwordHash` from the Prisma include. Before shipping, add a `select` in `userRepository.findById` and in the create/update return values that omits `passwordHash`, or a small `sanitizeUser()` helper applied in the controller.
- **Departments don't have endpoints yet** — you must create the first department via `pnpm db:studio` (Prisma Studio) until the departments module lands. That's the next thing to build.
- **`departmentId` in the token** — teachers and students carry it, so `scopeDepartment` can enforce isolation without extra DB lookups. Admins and parents have `null`.

When you're ready, reply **"continue with departments"** and I'll deliver the module (routes, schema, service, repository, controller) plus the seed addition that creates `Science`, `Arts`, and `Administration` departments so teacher/student creation works without Prisma Studio.