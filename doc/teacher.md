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
