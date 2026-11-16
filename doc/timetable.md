TIMETABLE
6.1 POST /timetable — create slot
Request

http
POST /api/v1/timetable
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "classId": "clc4d5e6f0005abcd5678cdef",
  "subjectId": "cls2b3c4d0002abcd5678ijkl",
  "teacherId": "clt3c4d5e0003abcd3456qrst",
  "dayOfWeek": 1,
  "period": 1,
  "startTime": "08:00",
  "endTime": "08:40",
  "room": "R12"
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "studentId": null,
    "dayOfWeek": 1,
    "period": 1,
    "startTime": "08:00",
    "endTime": "08:40",
    "room": "R12",
    "createdAt": "2026-11-13T08:25:00.000Z",
    "updatedAt": "2026-11-13T08:25:00.000Z"
  }
}
Response 409 (class already booked)

json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "This class already has a slot at that day and period" }
}
Response 409 (teacher already booked)

json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "This teacher already has a slot at that day and period" }
}
Response 400 (no class-subject assignment)

json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "This teacher is not assigned to this class+subject. Create the ClassSubject first."
  }
}
Response 400 (bad times)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "endTime": ["endTime must be after startTime"] }
    }
  }
}
6.2 GET /timetable — list slots
Request

http
GET /api/v1/timetable?page=1&limit=20&classId=clc4d5e6f0005abcd5678cdef&dayOfWeek=1
Authorization: Bearer <accessToken>
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
      "dayOfWeek": 1,
      "period": 1,
      "startTime": "08:00",
      "endTime": "08:40",
      "room": "R12",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
Query params

Name	Type	Notes
page, limit	int	pagination
classId	cuid	filter by class
teacherId	cuid	filter by teacher
subjectId	cuid	filter by subject
studentId	cuid	filter by student elective
dayOfWeek	1–5	1=Mon … 5=Fri
6.3 GET /timetable/:id — slot detail
Request

http
GET /api/v1/timetable/clts8h9i0j0010abcd7890qrst
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "studentId": null,
    "dayOfWeek": 1,
    "period": 1,
    "startTime": "08:00",
    "endTime": "08:40",
    "room": "R12"
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Slot not found" } }
6.4 PATCH /timetable/:id — update slot
Request

http
PATCH /api/v1/timetable/clts8h9i0j0010abcd7890qrst
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "dayOfWeek": 2,
  "period": 3,
  "startTime": "10:00",
  "endTime": "10:40",
  "room": "R14"
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "dayOfWeek": 2,
    "period": 3,
    "startTime": "10:00",
    "endTime": "10:40",
    "room": "R14"
  }
}
Response 409 (conflict after change)

json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "This teacher already has a slot at that day and period" }
}
6.5 DELETE /timetable/:id — delete slot
Request

http
DELETE /api/v1/timetable/clts8h9i0j0010abcd7890qrst
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clts8h9i0j0010abcd7890qrst", "deleted": true } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Slot not found" } }
