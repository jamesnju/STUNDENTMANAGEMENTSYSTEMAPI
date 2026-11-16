.1 POST /admin/academic/subjects — create subject
Request

http
POST /api/v1/admin/academic/subjects
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Mathematics",
  "code": "MATH",
  "departmentId": "cld1e2f3g0001abcd7890uvwx"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "cls2b3c4d0002abcd5678ijkl",
    "name": "Mathematics",
    "code": "MATH",
    "departmentId": "cld1e2f3g0001abcd7890uvwx",
    "isActive": true,
    "deletedAt": null,
    "createdAt": "2026-11-13T08:05:00.000Z",
    "updatedAt": "2026-11-13T08:05:00.000Z"
  }
}
Response 409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "Subject code already exists" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Department not found" } }
Response 400

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "code": ["Code must be uppercase letters, digits, _ or -"] }
    }
  }
}
2.2 GET /admin/academic/subjects — list subjects
Request

http
GET /api/v1/admin/academic/subjects?page=1&limit=10&search=math&departmentId=cld1e2f3g0001abcd7890uvwx&isActive=true
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cls2b3c4d0002abcd5678ijkl",
      "name": "Mathematics",
      "code": "MATH",
      "departmentId": "cld1e2f3g0001abcd7890uvwx",
      "isActive": true,
      "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" },
      "_count": { "classes": 3 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
2.3 GET /admin/academic/subjects/:id — subject detail
Request

http
GET /api/v1/admin/academic/subjects/cls2b3c4d0002abcd5678ijkl
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cls2b3c4d0002abcd5678ijkl",
    "name": "Mathematics",
    "code": "MATH",
    "departmentId": "cld1e2f3g0001abcd7890uvwx",
    "isActive": true,
    "deletedAt": null
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Subject not found" } }
2.4 PATCH /admin/academic/subjects/:id — update subject
Request

http
PATCH /api/v1/admin/academic/subjects/cls2b3c4d0002abcd5678ijkl
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Mathematics & Statistics",
  "isActive": false
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "cls2b3c4d0002abcd5678ijkl",
    "name": "Mathematics & Statistics",
    "code": "MATH",
    "isActive": false
  }
}
2.5 DELETE /admin/academic/subjects/:id — soft delete subject
Request

http
DELETE /api/v1/admin/academic/subjects/cls2b3c4d0002abcd5678ijkl
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "cls2b3c4d0002abcd5678ijkl", "deleted": true } }
Response 409 (in use)

json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete subject: referenced by 3 class(es). Archive them first."
  }
}
