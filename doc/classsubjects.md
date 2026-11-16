.1 POST /admin/academic/class-subjects — assign teacher to class+subject
Request

http
POST /api/v1/admin/academic/class-subjects
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "classId": "clc4d5e6f0005abcd5678cdef",
  "subjectId": "cls2b3c4d0002abcd5678ijkl",
  "teacherId": "clt3c4d5e0003abcd3456qrst"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clcs5e6f7g0006abcd9012efgh",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "createdAt": "2026-11-13T08:15:00.000Z"
  }
}
Response 409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "This class+subject+teacher assignment already exists" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Teacher not found" } }
4.2 GET /admin/academic/class-subjects — list assignments
Request

http
GET /api/v1/admin/academic/class-subjects?page=1&limit=10&classId=clc4d5e6f0005abcd5678cdef
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clcs5e6f7g0006abcd9012efgh",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
      "teacherId": "clt3c4d5e0003abcd3456qrst",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
4.3 DELETE /admin/academic/class-subjects/:id — remove assignment
Request

http
DELETE /api/v1/admin/academic/class-subjects/clcs5e6f7g0006abcd9012efgh
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clcs5e6f7g0006abcd9012efgh", "deleted": true } }
Response 409 (used in timetable)

json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot remove: 4 timetable slot(s) reference this class+subject+teacher."
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
