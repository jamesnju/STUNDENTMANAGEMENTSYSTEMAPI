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
