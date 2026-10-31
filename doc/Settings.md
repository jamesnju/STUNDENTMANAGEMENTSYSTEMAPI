10. API Documentation Addition — Settings
Append this to your API docs:

List Settings
GET /admin/settings — Admin only

Query params: page, limit, search (matches param or description), sortBy (param | updatedAt, default param), sortDir.

Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clx9f3k2b0010abcd1234efgh",
      "param": "academic.current_term",
      "valString": "2026-Term1",
      "valInt": null,
      "valBool": null,
      "valJson": null,
      "description": "Active academic term",
      "updatedAt": "2025-01-10T07:00:00.000Z"
    },
    {
      "id": "clx9f3k2b0011abcd1234efgh",
      "param": "grading.pass_mark",
      "valString": null,
      "valInt": 55,
      "valBool": null,
      "valJson": null,
      "description": "Minimum passing grade",
      "updatedAt": "2025-01-16T11:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 9 }
}
Get Setting
GET /admin/settings/:param — Admin only

Path: param = dot-namespaced key, e.g. grading.pass_mark

Response 200 — single setting object (same shape as above).

Errors

404 NOT_FOUND — Setting not found

400 VALIDATION_ERROR — invalid param format (must match ^[a-z0-9_.]+$)

Create Setting
POST /admin/settings — Admin only

Request (exactly one value column)

json
{
  "param": "fee.currency",
  "valString": "KES",
  "description": "Fee currency"
}
Request — int

json
{ "param": "fee.late_fee_percent", "valInt": 5, "description": "Late fee percentage" }
Request — bool

json
{ "param": "feature.sms_enabled", "valBool": false, "description": "SMS notifications" }
Request — json

json
{
  "param": "grading.scale",
  "valJson": { "A": 80, "B": 70, "C": 60, "D": 50 },
  "description": "Grade boundaries"
}
Response 201 — created setting object.

Errors

409 CONFLICT — Setting param already exists

400 VALIDATION_ERROR — zero or multiple value fields provided

Update Setting
PATCH /admin/settings/:param — Admin only

Request (any subset; setting exactly one value column clears the others)

json
{ "valInt": 60 }
Response 200 — updated setting object.

Errors

404 NOT_FOUND

400 BAD_REQUEST — more than one value type set

400 VALIDATION_ERROR — empty body

Delete Setting
DELETE /admin/settings/:param — Admin only

Response 200

json
{ "success": true, "data": { "param": "fee.currency", "deleted": true } }
Errors

404 NOT_FOUND

11. What's next
Everything is now in place for the teacher and student read endpoints:

Departments exist and can be listed

Users can be assigned to departments on creation

Settings can be read via getSetting* helpers

scopeDepartment has real data to enforce against

Recommended next: teachers/me + teachers/me/students + students/me — these prove the department scoping works end to end (a teacher can only see students in their own department, a student can only see their own data) before we add write-heavy modules like attendance and grades.