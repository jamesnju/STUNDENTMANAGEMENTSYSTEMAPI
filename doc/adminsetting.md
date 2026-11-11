SETTINGS (ADMIN only)
4.1 POST /admin/settings
Request

http
POST /api/v1/admin/settings
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "param": "grading.pass_mark",
  "description": "Minimum pass mark",
  "valInt": 50
}
Response 201

json
{
  "success": true,
  "data": {
    "id": "cls4d5e6f0004abcd1234yzab",
    "param": "grading.pass_mark",
    "valInt": 50,
    "valString": null,
    "valBool": null,
    "valJson": null,
    "description": "Minimum pass mark"
  }
}
Response 400

json
{
  "success": false,
  "error": { "code": "BAD_REQUEST", "message": "Exactly one of valString, valInt, valBool, valJson must be provided" }
}
4.2 GET /admin/settings
Request

http
GET /api/v1/admin/settings?page=1&limit=10&search=grading
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    { "id": "cls4d5e6f0004abcd1234yzab", "param": "grading.pass_mark", "valInt": 50 }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
4.3 GET /admin/settings/:param
Request

http
GET /api/v1/admin/settings/grading.pass_mark
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cls4d5e6f0004abcd1234yzab",
    "param": "grading.pass_mark",
    "valInt": 50,
    "description": "Minimum pass mark"
  }
}
4.4 PATCH /admin/settings/:param
Request

http
PATCH /api/v1/admin/settings/grading.pass_mark
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "valInt": 45
}
Response 200

json
{
  "success": true,
  "data": {
    "param": "grading.pass_mark",
    "valInt": 45,
    "valString": null,
    "valBool": null,
    "valJson": null
  }
}
4.5 DELETE /admin/settings/:param
Request

http
DELETE /api/v1/admin/settings/grading.pass_mark
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "param": "grading.pass_mark", "deleted": true } }