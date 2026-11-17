1 POST /assignments — create assignment (TEACHER / ADMIN)
Request

http
POST /api/v1/assignments
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "title": "Algebra worksheet",
  "instructions": "Complete problems 1–20. Show all working.",
  "classId": "clc4d5e6f0005abcd5678cdef",
  "subjectId": "cls2b3c4d0002abcd5678ijkl",
  "termId": "clt1a2b3c0001abcd1234efgh",
  "dueAt": "2026-11-25T17:00:00.000Z",
  "fileIds": ["clf7a7b7c0007abcd7777xxxx"],
  "isPublished": true
}
Body

Field	Type	Required	Notes
title	string 2–200	yes	
instructions	string ≤10k	no	
classId	cuid	yes	
subjectId	cuid	yes	
termId	cuid	yes	
dueAt	datetime	no	Must be in the future if isPublished
fileIds	cuid[] ≤20	no	Attachments (rubric, worksheet, etc.)
isPublished	boolean	no	Default false → DRAFT
Response 201

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "title": "Algebra worksheet",
    "instructions": "Complete problems 1–20. Show all working.",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "termId": "clt1a2b3c0001abcd1234efgh",
    "status": "PUBLISHED",
    "dueAt": "2026-11-25T17:00:00.000Z",
    "publishedAt": "2026-11-17T11:00:00.000Z",
    "deletedAt": null,
    "createdAt": "2026-11-17T11:00:00.000Z",
    "updatedAt": "2026-11-17T11:00:00.000Z",
    "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
    "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
    "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
    "term": { "id": "clt1a2b3c0001abcd1234efgh", "name": "Term 1", "academicYear": "2026" },
    "files": [
      { "id": "clf7a7b7c0007abcd7777xxxx", "url": "https://.../worksheet.pdf", "originalName": "worksheet.pdf", "mimeType": "application/pdf", "bytes": 51200 }
    ]
  }
}
Response 403 (teacher not assigned)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "You do not teach this class+subject" } }
Response 400 (dueAt in the past when publishing)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "dueAt must be in the future when publishing" } }
Response 404 (bad term/class/subject)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Term not found" } }
2.2 GET /assignments — list assignments
Request — STUDENT (enrolled classes, non-drafts only)

http
GET /api/v1/assignments?page=1&limit=10&status=PUBLISHED
Authorization: Bearer <studentToken>
Request — TEACHER (own)

http
GET /api/v1/assignments?classId=clc4d5e6f0005abcd5678cdef&termId=clt1a2b3c0001abcd1234efgh
Authorization: Bearer <teacherToken>
Request — ADMIN (all)

http
GET /api/v1/assignments?subjectId=cls2b3c4d0002abcd5678ijkl&search=algebra
Authorization: Bearer <adminToken>
Query params

Name	Type	Notes
page, limit	int	
classId, subjectId, termId	cuid	filters
status	DRAFT / PUBLISHED / CLOSED	Students never see DRAFT regardless of filter
search	string	matches title / instructions
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
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "teacher": { "firstName": "Jane", "lastName": "Doe" },
      "term": { "id": "clt1a2b3c0001abcd1234efgh", "name": "Term 1", "academicYear": "2026" },
      "files": [
        { "id": "clf7a7b7c0007abcd7777xxxx", "url": "https://.../worksheet.pdf", "originalName": "worksheet.pdf", "mimeType": "application/pdf", "bytes": 51200 }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
Response 200 (student, nothing assigned yet)

json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0 } }
2.3 GET /assignments/:id — assignment detail
Request

http
GET /api/v1/assignments/clas1b2c3d0001abcd1234abcd
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "title": "Algebra worksheet",
    "instructions": "Complete problems 1–20. Show all working.",
    "status": "PUBLISHED",
    "dueAt": "2026-11-25T17:00:00.000Z",
    "publishedAt": "2026-11-17T11:00:00.000Z",
    "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
    "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
    "teacher": { "firstName": "Jane", "lastName": "Doe" },
    "term": { "id": "clt1a2b3c0001abcd1234efgh", "name": "Term 1", "academicYear": "2026" },
    "files": [
      { "id": "clf7a7b7c0007abcd7777xxxx", "url": "https://.../worksheet.pdf", "originalName": "worksheet.pdf", "mimeType": "application/pdf", "bytes": 51200 }
    ]
  }
}
Response 403 (student viewing a draft)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Assignment not published" } }
Response 403 (student not enrolled)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not enrolled in this class" } }
Response 403 (teacher viewing another's assignment)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
2.4 PATCH /assignments/:id — update assignment (owner teacher / ADMIN)
Request

http
PATCH /api/v1/assignments/clas1b2c3d0001abcd1234abcd
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "title": "Algebra worksheet (extended)",
  "dueAt": "2026-11-27T17:00:00.000Z",
  "fileIds": ["clf7a7b7c0007abcd7777xxxx", "clf8b8c8d0008abcd8888yyyy"]
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "title": "Algebra worksheet (extended)",
    "dueAt": "2026-11-27T17:00:00.000Z",
    "status": "PUBLISHED",
    "files": [
      { "id": "clf7a7b7c0007abcd7777xxxx", "originalName": "worksheet.pdf", "url": "https://..." },
      { "id": "clf8b8c8d0008abcd8888yyyy", "originalName": "hints.pdf", "url": "https://..." }
    ]
  }
}
Response 400 (edit a closed assignment)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Cannot edit a closed assignment" } }
Response 400 (past dueAt on published)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "dueAt must be in the future" } }
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
2.5 POST /assignments/:id/publish — publish (DRAFT → PUBLISHED)
Request

http
POST /api/v1/assignments/clas1b2c3d0001abcd1234abcd/publish
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clas1b2c3d0001abcd1234abcd",
    "status": "PUBLISHED",
    "publishedAt": "2026-11-17T11:00:00.000Z"
  }
}
Response 400 (past dueAt)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Cannot publish an assignment whose dueAt is in the past" } }
Note: calling publish on a non-DRAFT is a no-op (returns the current assignment) — idempotent.

2.6 POST /assignments/:id/close — close (PUBLISHED → CLOSED)
Request

http
POST /api/v1/assignments/clas1b2c3d0001abcd1234abcd/close
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": { "id": "clas1b2c3d0001abcd1234abcd", "status": "CLOSED" }
}
Note: also idempotent. After this, students cannot submit (see 3.1 → 400). The markOverdueAssignments job closes assignments automatically when dueAt passes.

2.7 DELETE /assignments/:id — soft delete
Request

http
DELETE /api/v1/assignments/clas1b2c3d0001abcd1234abcd
Authorization: Bearer <teacherToken>
Response 200

json
{ "success": true, "data": { "id": "clas1b2c3d0001abcd1234abcd", "deleted": true } }
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
