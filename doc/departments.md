. DEPARTMENTS (ADMIN only)
3.1 POST /admin/departments
Request

http
POST /api/v1/admin/departments
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Sciences",
  "code": "SCI"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "cld1e2f3g0001abcd7890uvwx",
    "name": "Sciences",
    "code": "SCI",
    "createdAt": "2026-11-11T08:20:00.000Z",
    "updatedAt": "2026-11-11T08:20:00.000Z"
  }
}
Response 409

json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Department code already exists" }
}
3.2 GET /admin/departments
Request

http
GET /api/v1/admin/departments?page=1&limit=10&search=sci&sortBy=name&sortDir=asc
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cld1e2f3g0001abcd7890uvwx",
      "name": "Sciences",
      "code": "SCI",
      "_count": { "teachers": 4, "students": 120 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
3.3 GET /admin/departments/:id
Request

http
GET /api/v1/admin/departments/cld1e2f3g0001abcd7890uvwx
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cld1e2f3g0001abcd7890uvwx",
    "name": "Sciences",
    "code": "SCI",
    "memberCounts": { "teacherCount": 4, "studentCount": 120, "total": 124 }
  }
}
3.4 PATCH /admin/departments/:id
Request

http
PATCH /api/v1/admin/departments/cld1e2f3g0001abcd7890uvwx
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Natural Sciences"
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "cld1e2f3g0001abcd7890uvwx",
    "name": "Natural Sciences",
    "code": "SCI"
  }
}
3.5 DELETE /admin/departments/:id
Request

http
DELETE /api/v1/admin/departments/cld1e2f3g0001abcd7890uvwx
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "cld1e2f3g0001abcd7890uvwx", "deleted": true } }
Response 409

json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete department: 4 teacher(s) and 120 student(s) still active. Archive or reassign them first."
  }
}
3.6 GET /admin/departments/:id/members
Request

http
GET /api/v1/admin/departments/cld1e2f3g0001abcd7890uvwx/members?page=1&limit=20&role=TEACHER
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "clt3c4d5e0003abcd3456qrst",
        "firstName": "Jane",
        "lastName": "Doe",
        "user": { "email": "jane.doe@school.test", "isActive": true }
      }
    ],
    "students": [],
    "teacherTotal": 1,
    "studentTotal": 0,
    "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" }
  },
  "meta": { "page": 1, "limit": 20, "totalTeachers": 1, "totalStudents": 0 }
}