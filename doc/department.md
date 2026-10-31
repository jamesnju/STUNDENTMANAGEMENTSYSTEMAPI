9. API Documentation Addition — Departments
Append this to your API docs:

List Departments
GET /admin/departments — Admin only

Query params: page, limit, search, sortBy (name | code | createdAt, default createdAt), sortDir (asc | desc, default desc).

Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0001abcd1234efgh",
      "name": "Science",
      "code": "SCI",
      "createdAt": "2025-01-10T07:00:00.000Z",
      "updatedAt": "2025-01-10T07:00:00.000Z",
      "_count": {
        "teachers": 4,
        "students": 87
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3 }
}
Create Department
POST /admin/departments — Admin only

Request

json
{ "name": "Mathematics", "code": "MATH" }
Response 201

json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0002abcd1234efgh",
    "name": "Mathematics",
    "code": "MATH",
    "createdAt": "2025-01-16T10:00:00.000Z",
    "updatedAt": "2025-01-16T10:00:00.000Z"
  }
}
Errors

409 CONFLICT — Department name already exists / Department code already exists

400 VALIDATION_ERROR — code must match ^[A-Z0-9_-]+$

Get Department
GET /admin/departments/:id — Admin only

Response 200

json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0001abcd1234efgh",
    "name": "Science",
    "code": "SCI",
    "createdAt": "2025-01-10T07:00:00.000Z",
    "updatedAt": "2025-01-10T07:00:00.000Z",
    "memberCounts": {
      "teacherCount": 4,
      "studentCount": 87,
      "total": 91
    }
  }
}
Errors

404 NOT_FOUND

Update Department
PATCH /admin/departments/:id — Admin only

Request (at least one field)

json
{ "name": "Mathematics & Statistics" }
Response 200 — full department object (same shape as Create).

Errors

404 NOT_FOUND

409 CONFLICT — name/code already in use

Delete Department
DELETE /admin/departments/:id — Admin only

Response 200

json
{
  "success": true,
  "data": { "id": "clx9f3k2b0002abcd1234efgh", "deleted": true }
}
Errors

404 NOT_FOUND

409 CONFLICT — active members exist, e.g. Cannot delete department: 4 teacher(s) and 87 student(s) still active. Archive or reassign them first.

400 BAD_REQUEST — department referenced only by archived profiles (historical data must be preserved)

List Department Members
GET /admin/departments/:id/members — Admin only

Query params: page, limit, role (TEACHER | STUDENT, optional — omit for both).

Response 200

json
{
  "success": true,
  "data": {
    "department": {
      "id": "clx9f3k2b0001abcd1234efgh",
      "name": "Science",
      "code": "SCI"
    },
    "teachers": [
      {
        "id": "clx9f3k2b0007abcd1234efgh",
        "firstName": "Jane",
        "lastName": "Doe",
        "employeeCode": "EMP001",
        "user": { "email": "jane.doe@school.local", "isActive": true }
      }
    ],
    "students": [],
    "teacherTotal": 1,
    "studentTotal": 0
  },
  "meta": { "page": 1, "limit": 20, "totalTeachers": 1, "totalStudents": 0 }
}