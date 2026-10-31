7. API Documentation Addition — Teacher & Student "Me"
Append this to your API docs:

Teacher — Own Profile
GET /teachers/me — Teacher only

Response 200

json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0007abcd1234efgh",
    "userId": "clx9f3k2b0002abcd1234efgh",
    "departmentId": "clx9f3k2b0001abcd1234efgh",
    "firstName": "Jane",
    "lastName": "Doe",
    "employeeCode": "EMP001",
    "hireDate": "2024-01-15T00:00:00.000Z",
    "isActive": true,
    "deletedAt": null,
    "user": { "email": "t1@school.local", "isActive": true },
    "department": { "id": "clx9f3k2b0001abcd1234efgh", "name": "Science", "code": "SCI" }
  }
}
Errors

404 NOT_FOUND — profile missing (e.g. deleted while token still live)

Teacher — My Classes
GET /teachers/me/classes — Teacher only

Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0020abcd1234efgh",
      "name": "Form 3A",
      "code": "F3A",
      "departmentId": "clx9f3k2b0001abcd1234efgh",
      "department": { "id": "clx9f3k2b0001abcd1234efgh", "name": "Science", "code": "SCI" },
      "_count": { "enrollments": 32 }
    }
  ]
}
Empty array [] if the teacher has no classes yet.

Teacher — Students in My Department
GET /teachers/me/students — Teacher only

Query params: page, limit, search (matches first name, last name, or admission number).

Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0003abcd1234efgh",
      "firstName": "Sam",
      "lastName": "Lee",
      "admissionNo": "ADM2024001",
      "dateOfBirth": "2010-05-22T00:00:00.000Z",
      "departmentId": "clx9f3k2b0001abcd1234efgh",
      "user": { "email": "s1@school.local" },
      "enrollments": [
        { "class": { "id": "clx9f3k2b0020abcd1234efgh", "name": "Form 3A", "code": "F3A" } }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 32,
    "departmentId": "clx9f3k2b0001abcd1234efgh"
  }
}
Teacher — One Student (Department-Scoped)
GET /teachers/me/students/:studentId — Teacher only

Response 200

json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0003abcd1234efgh",
    "firstName": "Sam",
    "lastName": "Lee",
    "admissionNo": "ADM2024001",
    "dateOfBirth": "2010-05-22T00:00:00.000Z",
    "departmentId": "clx9f3k2b0001abcd1234efgh",
    "user": { "email": "s1@school.local" },
    "department": { "id": "clx9f3k2b0001abcd1234efgh", "name": "Science", "code": "SCI" },
    "enrollments": [
      { "class": { "id": "clx9f3k2b0020abcd1234efgh", "name": "Form 3A", "code": "F3A" } }
    ],
    "parent": {
      "id": "clx9f3k2b0006abcd1234efgh",
      "firstName": "Michael",
      "lastName": "Lee",
      "phone": "+254712345678"
    }
  }
}
Errors

403 FORBIDDEN — Student does not belong to your department (returned for both non-existent and cross-department requests to avoid information leakage)

Student — Own Profile
GET /students/me — Student only

Response 200

json
{
  "success": true,
  "data": {
    "id": "clx9f3k2b0003abcd1234efgh",
    "userId": "clx9f3k2b0009abcd1234efgh",
    "departmentId": "clx9f3k2b0001abcd1234efgh",
    "firstName": "Sam",
    "lastName": "Lee",
    "admissionNo": "ADM2024001",
    "dateOfBirth": "2010-05-22T00:00:00.000Z",
    "parentId": "clx9f3k2b0006abcd1234efgh",
    "isActive": true,
    "deletedAt": null,
    "user": { "email": "s1@school.local", "isActive": true },
    "department": { "id": "clx9f3k2b0001abcd1234efgh", "name": "Science", "code": "SCI" },
    "parent": {
      "id": "clx9f3k2b0006abcd1234efgh",
      "firstName": "Michael",
      "lastName": "Lee",
      "phone": "+254712345678",
      "user": { "email": "parent.lee@example.com" }
    }
  }
}
Student — My Classes
GET /students/me/classes — Student only

Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0021abcd1234efgh",
      "classId": "clx9f3k2b0020abcd1234efgh",
      "studentId": "clx9f3k2b0003abcd1234efgh",
      "enrolledAt": "2025-01-10T07:00:00.000Z",
      "class": {
        "id": "clx9f3k2b0020abcd1234efgh",
        "name": "Form 3A",
        "code": "F3A",
        "department": { "id": "clx9f3k2b0001abcd1234efgh", "name": "Science", "code": "SCI" },
        "teacher": { "id": "clx9f3k2b0007abcd1234efgh", "firstName": "Jane", "lastName": "Doe" }
      }
    }
  ]
}
Student — My Grades (placeholder)
GET /students/me/grades — Student only

Response 200

json
{ "success": true, "data": { "grades": [], "studentId": "clx9f3k2b0003abcd1234efgh" } }
Shape is final — the grades array is populated once the grades module lands.

Student — My Attendance (placeholder)
GET /students/me/attendance — Student only

Response 200

json
{ "success": true, "data": { "attendance": [], "studentId": "clx9f3k2b0003abcd1234efgh" } }
8. Design decisions worth noting
Decision	Why
/me/* routes derive department from JWT	A teacher can't request another department's data by tweaking a param — the department isn't a param
Cross-department read returns 403, not 404	Prevents existence leakage — an attacker can't enumerate student IDs across departments
Grades/attendance return empty arrays now	Frontend can wire UI today; backend fills data later with zero contract change
_count.enrollments on class	One query, no N+1 — the frontend gets class sizes for free
No scopeDepartment