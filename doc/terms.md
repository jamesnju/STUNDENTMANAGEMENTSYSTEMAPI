1.1 POST /admin/academic/terms — create term
Request

http
POST /api/v1/admin/academic/terms
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Term 1",
  "academicYear": "2026",
  "startsAt": "2026-01-06T00:00:00.000Z",
  "endsAt": "2026-04-03T00:00:00.000Z",
  "isActive": true
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "clt1a2b3c0001abcd1234efgh",
    "name": "Term 1",
    "academicYear": "2026",
    "startsAt": "2026-01-06T00:00:00.000Z",
    "endsAt": "2026-04-03T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2026-11-13T08:00:00.000Z",
    "updatedAt": "2026-11-13T08:00:00.000Z"
  }
}
Response 409 (duplicate)

json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Term already exists for this academic year"
  }
}
Response 400 (bad dates)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": {
        "endsAt": ["endsAt must be after startsAt"]
      }
    }
  }
}
1.2 GET /admin/academic/terms — list terms
Request

http
GET /api/v1/admin/academic/terms?page=1&limit=10&academicYear=2026&isActive=true
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clt1a2b3c0001abcd1234efgh",
      "name": "Term 1",
      "academicYear": "2026",
      "startsAt": "2026-01-06T00:00:00.000Z",
      "endsAt": "2026-04-03T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2026-11-13T08:00:00.000Z",
      "updatedAt": "2026-11-13T08:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
1.3 GET /admin/academic/terms/:id — term detail
Request

http
GET /api/v1/admin/academic/terms/clt1a2b3c0001abcd1234efgh
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clt1a2b3c0001abcd1234efgh",
    "name": "Term 1",
    "academicYear": "2026",
    "startsAt": "2026-01-06T00:00:00.000Z",
    "endsAt": "2026-04-03T00:00:00.000Z",
    "isActive": true
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Term not found" } }
1.4 PATCH /admin/academic/terms/:id — update term
Request

http
PATCH /api/v1/admin/academic/terms/clt1a2b3c0001abcd1234efgh
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Term One",
  "isActive": false
}
Response 200

json
{
  "success": true,
  "data": {
    "id": "clt1a2b3c0001abcd1234efgh",
    "name": "Term One",
    "academicYear": "2026",
    "isActive": false
  }
}
Response 409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "Term name already exists for this academic year" } }
1.5 DELETE /admin/academic/terms/:id — delete term
Request

http
DELETE /api/v1/admin/academic/terms/clt1a2b3c0001abcd1234efgh
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "clt1a2b3c0001abcd1234efgh", "deleted": true } }
Response 409 (in use)

json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete term: 5 assignment(s) and 2 assessment(s) reference it."
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Term not found" } }
    