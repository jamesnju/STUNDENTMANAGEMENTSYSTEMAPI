Base URL: http://localhost:3000/api/v1

Auth header for all protected routes: Authorization: Bearer <accessToken>

1. AUTH
1.1 POST /auth/login
Request

http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@school.test",
  "password": "Password123!"
}
Response 200

json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNs...",
    "user": {
      "id": "clx1a2b3c0001abcd1234efgh",
      "email": "admin@school.test",
      "role": "ADMIN",
      "departmentId": null
    }
  }
}
Response 401

json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Invalid credentials" }
}
Response 400 (validation)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "email": ["Invalid email"] }
    }
  }
}
1.2 POST /auth/refresh
Request (cookie refreshToken set by login; or body fallback)

http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNs..."
}
Response 200

json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNs..."
  }
}
Response 401

json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Refresh token invalid" }
}
1.3 POST /auth/logout
Request

http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNs..."
}
Response 200

json
{ "success": true, "data": null }
1.4 GET /auth/me
Request

http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c0001abcd1234efgh",
    "role": "ADMIN",
    "departmentId": null,
    "tokenVersion": 0
  }
}
Response 401

json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "No token provided" }
}