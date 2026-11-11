2.1 POST /admin/users
Request

http
POST /api/v1/admin/users
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "email": "jane.teacher@school.test",
  "password": "Password123!",
  "role": "TEACHER"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clx2b3c4d0002abcd5678ijkl",
    "email": "jane.teacher@school.test",
    "role": "TEACHER",
    "isActive": true,
    "createdAt": "2026-11-11T08:15:32.000Z"
  }
}
Response 409

json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Email already exists" }
}
2.2 GET /admin/users
Request

http
GET /api/v1/admin/users?page=1&limit=10&search=jane&role=TEACHER&sortBy=createdAt&sortDir=desc
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx2b3c4d0002abcd5678ijkl",
      "email": "jane.teacher@school.test",
      "role": "TEACHER",
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-11-11T08:15:32.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
2.3 GET /admin/users/archived
Request

http
GET /api/v1/admin/users/archived?page=1&limit=10
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx2b3c4d0003abcd9012mnop",
      "email": "old.user@school.test",
      "role": "STUDENT",
      "isActive": false,
      "deletedAt": "2026-10-20T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
2.4 GET /admin/users/:id
Request

http
GET /api/v1/admin/users/clx2b3c4d0002abcd5678ijkl
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clx2b3c4d0002abcd5678ijkl",
    "email": "jane.teacher@school.test",
    "role": "TEACHER",
    "isActive": true,
    "teacherProfile": {
      "id": "clt3c4d5e0003abcd3456qrst",
      "firstName": "Jane",
      "lastName": "Doe",
      "employeeCode": "T-001"
    }
  }
}
Response 404

json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "User not found" }
}
2.5 PATCH /admin/users/:id
Request

http
PATCH /api/v1/admin/users/clx2b3c4d0002abcd5678ijkl
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "email": "jane.doe@school.test",
  "isActive": false
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clx2b3c4d0002abcd5678ijkl",
    "email": "jane.doe@school.test",
    "role": "TEACHER",
    "isActive": false
  }
}
2.6 DELETE /admin/users/:id (soft delete)
Request

http
DELETE /api/v1/admin/users/clx2b3c4d0002abcd5678ijkl
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clx2b3c4d0002abcd5678ijkl", "deleted": true } }
2.7 POST /admin/users/:id/restore
Request

http
POST /api/v1/admin/users/clx2b3c4d0002abcd5678ijkl/restore
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clx2b3c4d0002abcd5678ijkl", "restored": true } }
