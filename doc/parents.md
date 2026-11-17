 GET /parents/me
Returns the authenticated parent's profile plus the list of their active children.

Role: PARENT

Request

http
GET /api/v1/parents/me
Authorization: Bearer <parentToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clp3c4d5e0003abcd1234efgh",
    "userId": "cmwcl6xjn000au30qqhucl0sl",
    "firstName": "Michael",
    "lastName": "Lee",
    "phone": "+254712345678",
    "user": { "id": "cmwcl6xjn000au30qqhucl0sl", "email": "parent.lee@example.com", "role": "PARENT", "isActive": true },
    "children": [
      {
        "id": "cls5e6f7g0006abcd9012efgh",
        "firstName": "John",
        "lastName": "Smith",
        "admissionNo": "S-001",
        "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" }
      },
      {
        "id": "cls6f7g8h0007abcd3456ijkl",
        "firstName": "Jane",
        "lastName": "Smith",
        "admissionNo": "S-002",
        "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" }
      }
    ]
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Parent profile not found" } }
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
5.2 GET /parents/me/children
Lightweight child list for a dropdown.

Request

http
GET /api/v1/parents/me/children
Authorization: Bearer <parentToken>
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
      "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" }
    },
    {
      "id": "cls6f7g8h0007abcd3456ijkl",
      "firstName": "Jane",
      "lastName": "Smith",
      "admissionNo": "S-002",
      "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" }
    }
  ]
}
Response 200 (no children)

json
{ "success": true, "data": [] }
5.3 GET /parents/me/children/:studentId/timetable
Role: PARENT — only for their own children.

Request

http
GET /api/v1/parents/me/children/cls5e6f7g0006abcd9012efgh/timetable
Authorization: Bearer <parentToken>
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
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "roomRel": { "id": "clr1a2b3c0001abcd1234efgh", "name": "Chemistry Lab", "code": "L1", "building": "Science Block" }
    }
  ]
}
Response 403 (not their child)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your child" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Parent profile not found" } }
5.4 GET /parents/me/children/:studentId/notes
Role: PARENT — only for their own children.

Request

http
GET /api/v1/parents/me/children/cls5e6f7g0006abcd9012efgh/notes?page=1&limit=10
Authorization: Bearer <parentToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cln1a2b3c0001abcd1234efgh",
      "title": "Chapter 1 — Algebra",
      "description": "Read sections 1.1–1.4 before Thursday",
      "isPublished": true,
      "publishedAt": "2026-11-17T10:05:00.000Z",
      "createdAt": "2026-11-17T10:00:00.000Z",
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "files": [
        {
          "id": "clf1a2b3c0001abcd9999zzzz",
          "url": "https://res.cloudinary.com/.../chapter1.pdf",
          "originalName": "chapter1.pdf",
          "mimeType": "application/pdf",
          "bytes": 284512
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
Response 403 (not their child)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your child" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Parent profile not found" } }
5.5 GET /parents/me/children/:studentId/assignments
Role: PARENT — only for their own children.

Request

http
GET /api/v1/parents/me/children/cls5e6f7g0006abcd9012efgh/assignments?page=1&limit=10
Authorization: Bearer <parentToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clas1b2c3d0001abcd1234abcd",
      "title": "Algebra worksheet",
      "instructions": "Complete problems 1–20. Show all working.",
      "status": "PUBLISHED",
      "dueAt": "2026-11-25T17:00:00.000Z",
      "publishedAt": "2026-11-17T11:00:00.000Z",
      "createdAt": "2026-11-17T11:00:00.000Z",
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
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
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
Response 403 (not their child)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your child" } }