.1 POST /assignments/:assignmentId/submit — student submits work (STUDENT only)
Request

http
POST /api/v1/assignments/clas1b2c3d0001abcd1234abcd/submit
Authorization: Bearer <studentToken>
Content-Type: application/json

{
  "content": "Completed all 20 problems. Attached scan of work.",
  "fileIds": ["clf9c9d9e0009abcd9999zzzz"]
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clsub1c2d3e0001abcd1234efgh",
    "assignmentId": "clas1b2c3d0001abcd1234abcd",
    "studentId": "cls5e6f7g0006abcd9012efgh",
    "content": "Completed all 20 problems. Attached scan of work.",
    "submittedAt": "2026-11-18T09:00:00.000Z",
    "grade": null,
    "feedback": null,
    "gradedAt": null,
    "gradedById": null,
    "files": [
      { "id": "clf9c9d9e0009abcd9999zzzz", "url": "https://.../answers.pdf", "originalName": "answers.pdf", "mimeType": "application/pdf", "bytes": 204800 }
    ],
    "student": { "id": "cls5e6f7g0006abcd9012efgh", "firstName": "John", "lastName": "Smith", "admissionNo": "S-001" },
    "gradedBy": null
  }
}
Response 400 (assignment not published)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Assignment not published" } }
Response 400 (assignment closed)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Assignment is closed" } }
Response 400 (past due)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Assignment is past due" } }
Response 400 (already submitted)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "You have already submitted this assignment" } }
Response 403 (not enrolled)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not enrolled in this class" } }
Response 403 (not a student — e.g. teacher trying)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
Response 404 (bad assignment id)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
3.2 GET /assignments/:assignmentId/submissions — teacher lists submissions (TEACHER / ADMIN)
Request

http
GET /api/v1/assignments/clas1b2c3d0001abcd1234abcd/submissions?page=1&limit=20&status=ungraded
Authorization: Bearer <teacherToken>
Query params

Name	Type	Notes
page, limit	int	
status	ungraded / graded	Filter by gradedAt IS NULL / IS NOT NULL
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clsub1c2d3e0001abcd1234efgh",
      "assignmentId": "clas1b2c3d0001abcd1234abcd",
      "studentId": "cls5e6f7g0006abcd9012efgh",
      "content": "Completed all 20 problems.",
      "submittedAt": "2026-11-18T09:00:00.000Z",
      "grade": null,
      "feedback": null,
      "gradedAt": null,
      "student": { "id": "cls5e6f7g0006abcd9012efgh", "firstName": "John", "lastName": "Smith", "admissionNo": "S-001" },
      "files": [
        { "id": "clf9c9d9e0009abcd9999zzzz", "url": "https://.../answers.pdf", "originalName": "answers.pdf", "mimeType": "application/pdf", "bytes": 204800 }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
Response 403 (teacher trying to list another teacher's assignment)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 403 (student trying)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Assignment not found" } }
3.3 GET /submissions/:id — one submission (teacher own / student own / admin all)
Request

http
GET /api/v1/submissions/clsub1c2d3e0001abcd1234efgh
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clsub1c2d3e0001abcd1234efgh",
    "assignmentId": "clas1b2c3d0001abcd1234abcd",
    "studentId": "cls5e6f7g0006abcd9012efgh",
    "content": "Completed all 20 problems.",
    "submittedAt": "2026-11-18T09:00:00.000Z",
    "grade": 85,
    "feedback": "Good work, review Q14",
    "gradedAt": "2026-11-18T15:00:00.000Z",
    "gradedById": "clt3c4d5e0003abcd3456qrst",
    "student": { "firstName": "John", "lastName": "Smith", "admissionNo": "S-001" },
    "gradedBy": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
    "files": [
      { "id": "clf9c9d9e0009abcd9999zzzz", "url": "https://.../answers.pdf", "originalName": "answers.pdf", "mimeType": "application/pdf", "bytes": 204800 }
    ]
  }
}
Response 403 (student trying to view someone else's submission)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your submission" } }
Response 403 (teacher viewing a submission on another teacher's assignment)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Submission not found" } }
3.4 GET /assignments/:assignmentId/submissions/me — student's own submission (STUDENT only)
Request

http
GET /api/v1/assignments/clas1b2c3d0001abcd1234abcd/submissions/me
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clsub1c2d3e0001abcd1234efgh",
    "assignmentId": "clas1b2c3d0001abcd1234abcd",
    "content": "Completed all 20 problems.",
    "submittedAt": "2026-11-18T09:00:00.000Z",
    "grade": 85,
    "feedback": "Good work, review Q14",
    "gradedAt": "2026-11-18T15:00:00.000Z",
    "gradedBy": { "firstName": "Jane", "lastName": "Doe" },
    "files": [
      { "id": "clf9c9d9e0009abcd9999zzzz", "url": "https://.../answers.pdf", "originalName": "answers.pdf", "mimeType": "application/pdf", "bytes": 204800 }
    ]
  }
}
Response 404 (not submitted yet)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "You have not submitted this assignment" } }
3.5 PATCH /submissions/:id/grade — grade a submission (TEACHER / ADMIN)
Request

http
PATCH /api/v1/submissions/clsub1c2d3e0001abcd1234efgh/grade
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Good work, review Q14"
}
Body

Field	Type	Required	Notes
grade	number ≥0	yes	
feedback	string ≤5000	no	
Response 200

json
{
  "success": true,
  "data": {
    "id": "clsub1c2d3e0001abcd1234efgh",
    "assignmentId": "clas1b2c3d0001abcd1234abcd",
    "studentId": "cls5e6f7g0006abcd9012efgh",
    "grade": 85,
    "feedback": "Good work, review Q14",
    "gradedAt": "2026-11-18T15:00:00.000Z",
    "gradedById": "clt3c4d5e0003abcd3456qrst",
    "gradedBy": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" }
  }
}
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Not your assignment" } }
Response 400 (validation)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": [], "fieldErrors": { "grade": ["Number must be greater than or equal to 0"] } }
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Submission not found" } }
4. End-to-end workflow
Full lifecycle from upload to grade.

bash
BASE=http://localhost:3000/api/v1

TEACHER=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@school.local","password":"..."}' | jq -r .data.accessToken)

STUDENT=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@school.local","password":"..."}' | jq -r .data.accessToken)

CLASS=clc4d5e6f0005abcd5678cdef
SUBJECT=cls2b3c4d0002abcd5678ijkl
TERM=clt1a2b3c0001abcd1234efgh

# ─── 1. Teacher uploads note PDF and creates a Note ─────────
FILE_ID=$(curl -s -X POST $BASE/files/upload \
  -H "Authorization: Bearer $TEACHER" \
  -F "category=NOTE" -F "file=@./chapter1.pdf" | jq -r .data.id)

NOTE_ID=$(curl -s -X POST $BASE/notes \
  -H "Authorization: Bearer $TEACHER" -H "Content-Type: application/json" \
  -d "{
    \"title\":\"Chapter 1 — Algebra\",
    \"description\":\"Read sections 1.1–1.4\",
    \"classId\":\"$CLASS\",
    \"subjectId\":\"$SUBJECT\",
    \"fileIds\":[\"$FILE_ID\"],
    \"isPublished\":true
  }" | jq -r .data.id)

# ─── 2. Student sees the note ───────────────────────────────
curl "$BASE/notes?classId=$CLASS" -H "Authorization: Bearer $STUDENT" | jq '.data[0] | {title, files: (.files|length)}'

# ─── 3. Teacher creates + publishes an Assignment ───────────
ASSIGNMENT_ID=$(curl -s -X POST $BASE/assignments \
  -H "Authorization: Bearer $TEACHER" -H "Content-Type: application/json" \
  -d "{
    \"title\":\"Algebra worksheet\",
    \"instructions\":\"Complete 1–20\",
    \"classId\":\"$CLASS\",
    \"subjectId\":\"$SUBJECT\",
    \"termId\":\"$TERM\",
    \"dueAt\":\"2026-11-25T17:00:00.000Z\",
    \"isPublished\":true
  }" | jq -r .data.id)

# ─── 4. Student submits ─────────────────────────────────────
SUB_FILE_ID=$(curl -s -X POST $BASE/files/upload \
  -H "Authorization: Bearer $STUDENT" \
  -F "category=SUBMISSION_ATTACHMENT" -F "file=@./answers.pdf" | jq -r .data.id)

SUBMISSION_ID=$(curl -s -X POST $BASE/assignments/$ASSIGNMENT_ID/submit \
  -H "Authorization: Bearer $STUDENT" -H "Content-Type: application/json" \
  -d "{\"content\":\"Answers attached\",\"fileIds\":[\"$SUB_FILE_ID\"]}" \
  | jq -r .data.id)

# ─── 5. Teacher lists and grades ────────────────────────────
curl "$BASE/assignments/$ASSIGNMENT_ID/submissions?status=ungraded" \
  -H "Authorization: Bearer $TEACHER" | jq '.data[] | {id, student: .student.firstName}'

curl -X PATCH $BASE/submissions/$SUBMISSION_ID/grade \
  -H "Authorization: Bearer $TEACHER" -H "Content-Type: application/json" \
  -d '{"grade":85,"feedback":"Good work, review Q14"}'

# ─── 6. Student sees the grade ──────────────────────────────
curl "$BASE/assignments/$ASSIGNMENT_ID/submissions/me" \
  -H "Authorization: Bearer $STUDENT" | jq '{grade, feedback, gradedAt}'

# ─── 7. Close (or let markOverdueAssignments run) ───────────
curl -X POST $BASE/assignments/$ASSIGNMENT_ID/close \
  -H "Authorization: Bearer $TEACHER"
5. Common error envelopes
401

json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "No token provided" } }
403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Resource not found" } }
409 — not used in Phase 3 (lifecycle conflicts are 400).

400

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": [], "fieldErrors": { "field": ["reason"] } }
  }
}
500

json
{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Something went wrong" } }
