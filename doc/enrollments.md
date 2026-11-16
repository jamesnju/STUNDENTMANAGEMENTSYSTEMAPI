.1 POST /admin/academic/enrollments — enroll one student
Request

http
POST /api/v1/admin/academic/enrollments
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "classId": "clc4d5e6f0005abcd5678cdef",
  "studentId": "cls5e6f7g0006abcd9012efgh",
  "term": "Term 1"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clen7g8h9i0009abcd3456mnop",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "studentId": "cls5e6f7g0006abcd9012efgh",
    "term": "Term 1",
    "enrolledAt": "2026-11-13T08:20:00.000Z",
    "isActive": true
  }
}
Response 409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "Student already enrolled in this class for this term" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Class not found" } }
5.2 POST /admin/academic/enrollments/bulk — bulk enroll students
Request

http
POST /api/v1/admin/academic/enrollments/bulk
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "classId": "clc4d5e6f0005abcd5678cdef",
  "term": "Term 1",
  "studentIds": [
    "cls5e6f7g0006abcd9012efgh",
    "cls6f7g8h0007abcd3456ijkl",
    "cls7g8h9i0008abcd6789klmn"
  ]
}
Response 201

json
{
  "success": true,
  "data": {
    "created": 2,
    "skipped": 1
  }
}
Response 400 (unknown student)

json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Unknown student IDs: clsBAD0000000000000000000"
  }
}
5.3 GET /admin/academic/enrollments — list enrollments
Request

http
GET /api/v1/admin/academic/enrollments?page=1&limit=10&classId=clc4d5e6f0005abcd5678cdef&term=Term%201&isActive=true
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clen7g8h9i0009abcd3456mnop",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "studentId": "cls5e6f7g0006abcd9012efgh",
      "term": "Term 1",
      "enrolledAt": "2026-11-13T08:20:00.000Z",
      "isActive": true,
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "student": {
        "id": "cls5e6f7g0006abcd9012efgh",
        "firstName": "John",
        "lastName": "Smith",
        "admissionNo": "S-001"
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
5.4 DELETE /admin/academic/enrollments/:id — withdraw student
Soft-deactivates (isActive: false). Student can be re-enrolled later.

Request

http
DELETE /api/v1/admin/academic/enrollments/clen7g8h9i0009abcd3456mnop
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clen7g8h9i0009abcd3456mnop", "isActive": false } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Enrollment not found" } }
