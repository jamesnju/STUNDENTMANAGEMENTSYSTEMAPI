TEACHERS (TEACHER role)
5.1 GET /teachers/me
Request

http
GET /api/v1/teachers/me
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clt3c4d5e0003abcd3456qrst",
    "firstName": "Jane",
    "lastName": "Doe",
    "employeeCode": "T-001",
    "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" },
    "user": { "email": "jane.doe@school.test", "role": "TEACHER" }
  }
}
5.2 GET /teachers/me/classes
Request

http
GET /api/v1/teachers/me/classes
Authorization: Bearer <teacherToken>
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
      "_count": { "enrollments": 32 }
    }
  ]
}
5.3 GET /teachers/me/students
Request

http
GET /api/v1/teachers/me/students?page=1&limit=20&search=john
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cls5e6f7g0006abcd9012efgh",
      "firstName": "John",
      "lastName": "Smith",
      "admissionNo": "S-001",
      "class": { "name": "Form 1A" }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
5.4 GET /teachers/me/students/:studentId
Request

http
GET /api/v1/teachers/me/students/cls5e6f7g0006abcd9012efgh
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cls5e6f7g0006abcd9012efgh",
    "firstName": "John",
    "lastName": "Smith",
    "admissionNo": "S-001",
    "dateOfBirth": "2012-03-15T00:00:00.000Z",
    "parent": {
      "firstName": "Mary",
      "lastName": "Smith",
      "phone": "+254712345678",
      "user": { "email": "mary.smith@school.test" }
    },
    "department": { "name": "Sciences", "code": "SCI" }
  }
}

GET /teachers/me/timetable
Returns every timetable slot where the authenticated teacher is the assigned teacher. Ordered by dayOfWeek, then period.

Role: TEACHER

Request

http
GET /api/v1/teachers/me/timetable
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clts8h9i0j0010abcd7890qrst",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
      "teacherId": "clt3c4d5e0003abcd3456qrst",
      "studentId": null,
      "roomId": "clr1a2b3c0001abcd1234efgh",
      "room": null,
      "dayOfWeek": 1,
      "period": 1,
      "startTime": "08:00",
      "endTime": "08:40",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "roomRel": {
        "id": "clr1a2b3c0001abcd1234efgh",
        "name": "Chemistry Lab",
        "code": "L1",
        "building": "Science Block"
      }
    },
    {
      "id": "clts8h9i0j0011abcd7890rstu",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
      "teacherId": "clt3c4d5e0003abcd3456qrst",
      "studentId": null,
      "roomId": "clr1a2b3c0001abcd1234efgh",
      "room": null,
      "dayOfWeek": 1,
      "period": 2,
      "startTime": "08:40",
      "endTime": "09:20",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "roomRel": {
        "id": "clr1a2b3c0001abcd1234efgh",
        "name": "Chemistry Lab",
        "code": "L1",
        "building": "Science Block"
      }
    }
  ]
}
Response 200 (no slots yet)

json
{ "success": true, "data": [] }
Response 404 (user is not a teacher profile)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Teacher profile not found" } }
Response 403 (not logged in as TEACHER)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
POST /assignments/:id/files
Add a single file to an existing assignment without replacing other attachments. The file must have been uploaded by the same teacher (or admin). Useful for adding a rubric or supplementary material after publishing.

Role: TEACHER (own assignment) / ADMIN

Request

http
POST /api/v1/assignments/clas1b2c3d0001abcd1234abcd/files
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "fileId": "clf8b8c8d0008abcd8888yyyy"
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "title": "Algebra worksheet",
    "files": [
      {
        "id": "clf7a7b7c0007abcd7777xxxx",
        "url": "https://res.cloudinary.com/.../worksheet.pdf",
        "originalName": "worksheet.pdf",
        "mimeType": "application/pdf",
        "bytes": 51200
      },
      {
        "id": "clf8b8c8d0008abcd8888yyyy",
        "url": "https://res.cloudinary.com/.../rubric.pdf",
        "originalName": "rubric.pdf",
        "mimeType": "application/pdf",
        "bytes": 18432
      }
    ]
  }
}
Response 400 (file not owned or already attached)

json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Only 0 of 1 file(s) could be attached. Ensure each file was uploaded by you and is not already linked elsewhere."
  }
}
Response 403 (not your assignment)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 404 (assignment or file missing)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
Response 400 (validation — bad cuid)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": [], "fieldErrors": { "fileId": ["Invalid cuid"] } }
  }
}
6.2 DELETE /assignments/:id/files/:fileId
Detach a file from an assignment. The File row is not deleted — just unlinked (so the teacher can re-attach it elsewhere or it gets picked up by the future cleanupOrphanedFiles job).

Role: TEACHER (own assignment) / ADMIN

Request

http
DELETE /api/v1/assignments/clas1b2c3d0001abcd1234abcd/files/clf8b8c8d0008abcd8888yyyy
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "title": "Algebra worksheet",
    "files": [
      {
        "id": "clf7a7b7c0007abcd7777xxxx",
        "url": "https://res.cloudinary.com/.../worksheet.pdf",
        "originalName": "worksheet.pdf",
        "mimeType": "application/pdf",
        "bytes": 51200
      }
    ]
  }
}
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
Note: deleting a fileId that was never attached is a no-op — the endpoint returns the assignment in its current state. Idempotent.
