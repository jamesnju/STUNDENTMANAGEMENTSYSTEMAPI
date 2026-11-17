NOTES
1.1 POST /notes — create note (TEACHER / ADMIN)
Request

http
POST /api/v1/notes
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "title": "Chapter 1 — Algebra",
  "description": "Read sections 1.1–1.4 before Thursday",
  "classId": "clc4d5e6f0005abcd5678cdef",
  "subjectId": "cls2b3c4d0002abcd5678ijkl",
  "fileIds": ["clf1a2b3c0001abcd9999zzzz"],
  "isPublished": false
}
Body

Field	Type	Required	Notes
title	string 2–200	yes	
description	string ≤5000	no	
classId	cuid	no	Required if isPublished
subjectId	cuid	no	Required if isPublished
fileIds	cuid[] ≤20	no	Must have been uploaded by the same teacher
isPublished	boolean	no	Default false
Response 201

json
{
  "success": true,
  "data": {
    "id": "cln1a2b3c0001abcd1234efgh",
    "title": "Chapter 1 — Algebra",
    "description": "Read sections 1.1–1.4 before Thursday",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "isPublished": false,
    "publishedAt": null,
    "deletedAt": null,
    "createdAt": "2026-11-17T10:00:00.000Z",
    "updatedAt": "2026-11-17T10:00:00.000Z",
    "files": [
      {
        "id": "clf1a2b3c0001abcd9999zzzz",
        "url": "https://res.cloudinary.com/.../chapter1.pdf",
        "publicId": "school/notes/clx1a2b3c0001abcd1234efgh/chapter1_abc123",
        "originalName": "chapter1.pdf",
        "mimeType": "application/pdf",
        "bytes": 284512,
        "format": "pdf"
      }
    ],
    "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
    "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
    "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" }
  }
}
Response 403 (teacher doesn't teach that class+subject)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "You do not teach this class+subject" } }
Response 400 (files not owned or already attached)

json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Only 1 of 2 file(s) could be attached. Ensure each file was uploaded by you and is not already linked elsewhere."
  }
}
Response 400 (publishing without class/subject)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "classId and subjectId must be provided together to publish" } }
Response 400 (validation)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "title": ["String must contain at least 2 character(s)"] }
    }
  }
}
1.2 GET /notes — list notes
Request — STUDENT

http
GET /api/v1/notes?classId=clc4d5e6f0005abcd5678cdef&subjectId=cls2b3c4d0002abcd5678ijkl&page=1&limit=10
Authorization: Bearer <studentToken>
Request — TEACHER (only own)

http
GET /api/v1/notes?page=1&limit=20&published=false
Authorization: Bearer <teacherToken>
Request — ADMIN (all, any filter)

http
GET /api/v1/notes?teacherId=clt3c4d5e0003abcd3456qrst&search=algebra
Authorization: Bearer <adminToken>
Query params

Name	Type	Notes
page, limit	int	pagination
classId, subjectId, teacherId	cuid	filters
published	boolean	true/false
search	string	matches title / description
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cln1a2b3c0001abcd1234efgh",
      "title": "Chapter 1 — Algebra",
      "description": "Read sections 1.1–1.4 before Thursday",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
      "isPublished": true,
      "publishedAt": "2026-11-17T10:05:00.000Z",
      "createdAt": "2026-11-17T10:00:00.000Z",
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "files": [
        { "id": "clf1a2b3c0001abcd9999zzzz", "url": "https://res.cloudinary.com/.../chapter1.pdf", "originalName": "chapter1.pdf", "mimeType": "application/pdf", "bytes": 284512, "format": "pdf" }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
Notes on visibility

STUDENT: only isPublished = true notes where the student is actively enrolled in classId. Any classId/teacherId filter passed is ignored.

TEACHER: only notes where teacherId = <self>.

ADMIN: everything.

Response 200 (empty for student — no notes yet in their class)

json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0 } }
1.3 GET /notes/:id — note detail
Request

http
GET /api/v1/notes/cln1a2b3c0001abcd1234efgh
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cln1a2b3c0001abcd1234efgh",
    "title": "Chapter 1 — Algebra",
    "description": "Read sections 1.1–1.4 before Thursday",
    "isPublished": true,
    "publishedAt": "2026-11-17T10:05:00.000Z",
    "teacher": { "firstName": "Jane", "lastName": "Doe" },
    "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
    "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
    "files": [
      { "id": "clf1a2b3c0001abcd9999zzzz", "url": "https://res.cloudinary.com/.../chapter1.pdf", "originalName": "chapter1.pdf", "mimeType": "application/pdf", "bytes": 284512 }
    ]
  }
}
Response 403 (student trying to view a draft)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Note not published" } }
Response 403 (student not enrolled in that class)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not enrolled in this class" } }
Response 403 (teacher viewing another teacher's note)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your note" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Note not found" } }
1.4 PATCH /notes/:id — update note (owner teacher / ADMIN)
Partial update. fileIds replaces the attachment set — files not in the new list get detached; files in the list get attached.

Request

http
PATCH /api/v1/notes/cln1a2b3c0001abcd1234efgh
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "title": "Chapter 1 — Algebra (revised)",
  "description": null,
  "fileIds": ["clf1a2b3c0001abcd9999zzzz", "clf9b9c9d0009abcd9999yyyy"]
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "cln1a2b3c0001abcd1234efgh",
    "title": "Chapter 1 — Algebra (revised)",
    "description": null,
    "files": [
      { "id": "clf1a2b3c0001abcd9999zzzz", "originalName": "chapter1.pdf", "url": "https://..." },
      { "id": "clf9b9c9d0009abcd9999yyyy", "originalName": "practice-set.pdf", "url": "https://..." }
    ]
  }
}
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your note" } }
Response 400 (empty body)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": ["At least one field is required"], "fieldErrors": {} }
  }
}
1.5 POST /notes/:id/publish — publish note (idempotent)
Request

http
POST /api/v1/notes/cln1a2b3c0001abcd1234efgh/publish
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cln1a2b3c0001abcd1234efgh",
    "isPublished": true,
    "publishedAt": "2026-11-17T10:05:00.000Z"
  }
}
Response 400 (note has no class/subject)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Note must have classId and subjectId before publishing" } }
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your note" } }
1.6 DELETE /notes/:id — soft delete (owner teacher / ADMIN)
Request

http
DELETE /api/v1/notes/cln1a2b3c0001abcd1234efgh
Authorization: Bearer <teacherToken>
Response 200

json
{ "success": true, "data": { "id": "cln1a2b3c0001abcd1234efgh", "deleted": true } }
Response 403 / 404

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your note" } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Note not found" } }
