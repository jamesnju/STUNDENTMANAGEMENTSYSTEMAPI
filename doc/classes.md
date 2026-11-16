CLASSES
3.1 POST /admin/academic/classes — create class
Request

http
POST /api/v1/admin/academic/classes
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Form 1A",
  "code": "F1A",
  "academicYear": "2026",
  "departmentId": "cld1e2f3g0001abcd7890uvwx",
  "classTeacherId": "clt3c4d5e0003abcd3456qrst"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clc4d5e6f0005abcd5678cdef",
    "name": "Form 1A",
    "code": "F1A",
    "academicYear": "2026",
    "departmentId": "cld1e2f3g0001abcd7890uvwx",
    "classTeacherId": "clt3c4d5e0003abcd3456qrst",
    "isActive": true,
    "deletedAt": null,
    "createdAt": "2026-11-13T08:10:00.000Z",
    "updatedAt": "2026-11-13T08:10:00.000Z"
  }
}
Response 409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "A class with this code already exists for this academic year" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Department not found" } }
3.2 GET /admin/academic/classes — list classes
Request

http
GET /api/v1/admin/academic/classes?page=1&limit=10&search=form&academicYear=2026&departmentId=cld1e2f3g0001abcd7890uvwx&isActive=true
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clc4d5e6f0005abcd5678cdef",
      "name": "Form 1A",
      "code": "F1A",
      "academicYear": "2026",
      "isActive": true,
      "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" },
      "classTeacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "_count": { "enrollments": 32, "subjects": 5 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
3.3 GET /admin/academic/classes/:id — class detail
Request

http
GET /api/v1/admin/academic/classes/clc4d5e6f0005abcd5678cdef
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clc4d5e6f0005abcd5678cdef",
    "name": "Form 1A",
    "code": "F1A",
    "academicYear": "2026",
    "isActive": true,
    "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" },
    "classTeacher": {
      "id": "clt3c4d5e0003abcd3456qrst",
      "firstName": "Jane",
      "lastName": "Doe",
      "userId": "clx2b3c4d0002abcd5678ijkl"
    },
    "_count": { "enrollments": 32 }
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Class not found" } }
3.4 PATCH /admin/academic/classes/:id — update class
Request

http
PATCH /api/v1/admin/academic/classes/clc4d5e6f0005abcd5678cdef
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Form 1 Alpha",
  "classTeacherId": null
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clc4d5e6f0005abcd5678cdef",
    "name": "Form 1 Alpha",
    "code": "F1A",
    "classTeacherId": null
  }
}
Passing classTeacherId: null unassigns the class teacher.

3.5 DELETE /admin/academic/classes/:id — soft delete class
Request

http
DELETE /api/v1/admin/academic/classes/clc4d5e6f0005abcd5678cdef
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clc4d5e6f0005abcd5678cdef", "deleted": true } }
Response 400 (in use)

json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot delete class: 32 active enrollment(s), 5 subject assignment(s), 8 timetable slot(s) still reference it."
  }
}
