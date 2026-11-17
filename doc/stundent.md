STUDENTS (STUDENT role)
6.1 GET /students/me
Request

http
GET /api/v1/students/me
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cls5e6f7g0006abcd9012efgh",
    "firstName": "John",
    "lastName": "Smith",
    "admissionNo": "S-001",
    "department": { "id": "cld1e2f3g0001abcd7890uvwx", "name": "Sciences", "code": "SCI" },
    "parent": {
      "firstName": "Mary", "lastName": "Smith", "phone": "+254712345678",
      "user": { "email": "mary.smith@school.test" }
    }
  }
}
6.2 GET /students/me/classes
Request

http
GET /api/v1/students/me/classes
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "class": {
        "id": "clc4d5e6f0005abcd5678cdef",
        "name": "Form 1A",
        "code": "F1A",
        "classTeacher": { "firstName": "Jane", "lastName": "Doe" },
        "subjects": [
          { "subject": { "name": "Mathematics", "code": "MATH" },
            "teacher": { "firstName": "Jane", "lastName": "Doe" } }
        ]
      }
    }
  ]
}
6.3 GET /students/me/timetable
Request

http
GET /api/v1/students/me/timetable
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "dayOfWeek": 1, "period": 1,
      "startTime": "08:00", "endTime": "08:40", "room": "R12",
      "class": { "name": "Form 1A", "code": "F1A" },
      "subject": { "name": "Mathematics", "code": "MATH" },
      "teacher": { "firstName": "Jane", "lastName": "Doe" }
    }
  ]
}
6.4 GET /students/me/classmates
Request

http
GET /api/v1/students/me/classmates?page=1&limit=20
Authorization: Bearer <studentToken>
Response 200

json
{
  "success": true,
  "data": [
    { "id": "cls6f7g8h0007abcd3456ijkl", "firstName": "Alice", "lastName": "Wanjiku", "admissionNo": "S-002" }
  ],
  "meta": { "page": 1, "limit": 20 }
}
GET /students/me/timetable
Same as before, but now includes roomRel and roomId. Returns slots for all active classes the student is enrolled in plus any student-specific elective slots (studentId set directly on the slot).

Role: STUDENT

Request

http
GET /api/v1/students/me/timetable
Authorization: Bearer <studentToken>
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
      "roomRel": {
        "id": "clr1a2b3c0001abcd1234efgh",
        "name": "Chemistry Lab",
        "code": "L1",
        "building": "Science Block"
      }
    },
    {
      "id": "clts9i0j1k0012abcd1234vwxy",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls9z9y9x0009abcd1234abcd",
      "teacherId": "clt4d5e6f0004abcd4567rstu",
      "studentId": "cls5e6f7g0006abcd9012efgh",
      "roomId": "clr2b3c4d0002abcd5678ijkl",
      "room": null,
      "dayOfWeek": 3,
      "period": 6,
      "startTime": "13:00",
      "endTime": "13:40",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls9z9y9x0009abcd1234abcd", "name": "Music", "code": "MUS" },
      "teacher": { "id": "clt4d5e6f0004abcd4567rstu", "firstName": "Sam", "lastName": "Otieno" },
      "roomRel": {
        "id": "clr2b3c4d0002abcd5678ijkl",
        "name": "Music Room",
        "code": "MR",
        "building": "Arts Block"
      }
    }
  ]
}
Response 200 (no enrollments yet)

json
{ "success": true, "data": [] }
3. STUDENTS — notes shortcut
3.1 GET /students/me/notes
Convenience alias for GET /notes as a student. Returns published notes for classes the student is actively enrolled in, with files and author metadata.

Role: STUDENT

Request

http
GET /api/v1/students/me/notes?page=1&limit=10
Authorization: Bearer <studentToken>
Query params

Name	Type	Required
page	int	no
limit	int	no
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cln1a2b3c0001abcd1234efgh",
      "title": "Chapter 1 — Algebra",
      "description": "Read sections 1.1–1.4 before Thursday",
      "teacherId": "clt3c4d5e0003abcd3456qrst",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
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
Response 200 (empty — no notes published for their classes)

json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0 } }
Response 404 (student profile missing)

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Student profile not found" } }
Response 403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
4. STUDENTS — assignments shortcut
4.1 GET /students/me/assignments
Convenience alias for GET /assignments as a student. Returns PUBLISHED and CLOSED assignments for the student's enrolled classes, with files, teacher metadata, and — most importantly — an embedded submissions array filtered to the current student.

The submissions array is empty if the student has not submitted; otherwise it contains their grade, feedback, and timestamps. The UI can compute "Not submitted / Submitted / Graded" without an extra request per row.

Role: STUDENT

Request

http
GET /api/v1/students/me/assignments?page=1&limit=10&status=PUBLISHED
Authorization: Bearer <studentToken>
Query params

Name	Type	Required	Notes
page	int	no	
limit	int	no	
status	PUBLISHED / CLOSED	no	If omitted, both are returned. DRAFT is never returned to students.
Response 200

json
{
  "success": true,
  "data": [
    {
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
        },
        {
          "id": "clf8b8c8d0008abcd8888yyyy",
          "url": "https://res.cloudinary.com/.../rubric.pdf",
          "originalName": "rubric.pdf",
          "mimeType": "application/pdf",
          "bytes": 18432
        }
      ],
      "submissions": [
        {
          "id": "clsub1c2d3e0001abcd1234efgh",
          "submittedAt": "2026-11-18T09:00:00.000Z",
          "grade": 85,
          "feedback": "Good work, review Q14",
          "gradedAt": "2026-11-18T15:00:00.000Z"
        }
      ]
    },
    {
      "id": "clas2c3d4e0002abcd5678efgh",
      "title": "Geometry practice",
      "instructions": "Complete the attached exercises.",
      "classId": "clc4d5e6f0005abcd5678cdef",
      "subjectId": "cls2b3c4d0002abcd5678ijkl",
      "teacherId": "clt3c4d5e0003abcd3456qrst",
      "termId": "clt1a2b3c0001abcd1234efgh",
      "status": "PUBLISHED",
      "dueAt": "2026-11-28T17:00:00.000Z",
      "publishedAt": "2026-11-17T12:00:00.000Z",
      "createdAt": "2026-11-17T12:00:00.000Z",
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "files": [
        {
          "id": "clf3c3d3e0003abcd3333zzzz",
          "url": "https://res.cloudinary.com/.../geometry.pdf",
          "originalName": "geometry.pdf",
          "mimeType": "application/pdf",
          "bytes": 92000
        }
      ],
      "submissions": []
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 2 }
}
Frontend logic for status pill

ts
function statusOf(a: AssignmentWithSubmissions) {
  const sub = a.submissions[0];
  if (!sub) return { label: "Not submitted", variant: "warning" };
  if (sub.gradedAt) return { label: `Graded: ${sub.grade}`, variant: "success" };
  return { label: "Submitted", variant: "info" };
}
Response 200 (empty)

json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0 } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Student profile not found" } }
Response 400 (invalid status)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "status": ["Invalid enum value. Expected 'PUBLISHED' | 'CLOSED'"] }
    }
  }
}

