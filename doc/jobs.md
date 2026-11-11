JOBS (ADMIN only)
7.1 GET /admin/jobs
Request

http
GET /api/v1/admin/jobs
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    "sendPendingNotifications",
    "sendAssessmentReminders",
    "markOverdueAssignments",
    "generateDailyDigest",
    "cleanupExpiredRefreshTokens"
  ]
}
7.2 GET /admin/jobs/history
Request

http
GET /api/v1/admin/jobs/history?page=1&limit=10
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clj7g8h9i0008abcd7890klmn",
      "jobName": "sendPendingNotifications",
      "triggeredBy": "clx1a2b3c0001abcd1234efgh",
      "status": "SUCCESS",
      "durationMs": 1245,
      "input": { "limit": 50 },
      "result": { "ok": true, "summary": { "emailsSent": 12, "inAppSent": 12, "failed": 0 } },
      "createdAt": "2026-11-11T09:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
7.3 POST /admin/jobs/sendPendingNotifications/run
Request

http
POST /api/v1/admin/jobs/sendPendingNotifications/run
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "limit": 50,
  "recipientLimit": 200
}
Response 200

json
{
  "success": true,
  "data": {
    "jobName": "sendPendingNotifications",
    "durationMs": 1183,
    "triggeredBy": "clx1a2b3c0001abcd1234efgh",
    "result": {
      "ok": true,
      "summary": {
        "notificationsScanned": 3,
        "notificationsCompleted": 3,
        "emailsSent": 8,
        "inAppSent": 8,
        "failed": 0,
        "skippedInactive": 0
      }
    }
  }
}
7.4 POST /admin/jobs/sendAssessmentReminders/run
Request

http
POST /api/v1/admin/jobs/sendAssessmentReminders/run
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "windowHours": 12
}
Response 200

json
{
  "success": true,
  "data": {
    "jobName": "sendAssessmentReminders",
    "durationMs": 342,
    "triggeredBy": "clx1a2b3c0001abcd1234efgh",
    "result": {
      "ok": true,
      "summary": {
        "windowHours": 12,
        "assessmentsScanned": 2,
        "remindersCreated": 2,
        "skippedAlreadySent": 0,
        "skippedNoRecipients": 0,
        "failed": 0
      }
    }
  }
}
7.5 POST /admin/jobs/markOverdueAssignments/run
Request

http
POST /api/v1/admin/jobs/markOverdueAssignments/run
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "limit": 1000
}
Response 200

json
{
  "success": true,
  "data": {
    "jobName": "markOverdueAssignments",
    "durationMs": 120,
    "triggeredBy": "clx1a2b3c0001abcd1234efgh",
    "result": {
      "ok": true,
      "summary": {
        "asOf": "2026-11-11T09:05:00.000Z",
        "candidatesFound": 5,
        "closed": 5,
        "stillPublished": 14,
        "limitHit": false
      }
    }
  }
}
7.6 POST /admin/jobs/generateDailyDigest/run
Request

http
POST /api/v1/admin/jobs/generateDailyDigest/run
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "forDate": "2026-11-11T00:00:00.000Z"
}
Response 200

json
{
  "success": true,
  "data": {
    "jobName": "generateDailyDigest",
    "durationMs": 2870,
    "triggeredBy": "clx1a2b3c0001abcd1234efgh",
    "result": {
      "ok": true,
      "summary": {
        "forDate": "2026-11-11",
        "teachersScanned": 8,
        "teacherDigests": 6,
        "parentsScanned": 120,
        "parentDigests": 47,
        "skipped": 75,
        "failed": 0
      }
    }
  }
}
7.7 POST /admin/jobs/cleanupExpiredRefreshTokens/run
Request

http
POST /api/v1/admin/jobs/cleanupExpiredRefreshTokens/run
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "revokedRetentionDays": 7,
  "maxDeletes": 5000
}
Response 200

json
{
  "success": true,
  "data": {
    "jobName": "cleanupExpiredRefreshTokens",
    "durationMs": 230,
    "triggeredBy": "clx1a2b3c0001abcd1234efgh",
    "result": {
      "ok": true,
      "summary": {
        "expiredCandidates": 32,
        "revokedCandidates": 118,
        "totalCandidates": 150,
        "deletedExpired": 32,
        "deletedRevoked": 118,
        "deletedTotal": 150,
        "cappedAt": null
      }
    }
  }
}
8. Generic error responses (any route)
400 validation

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "code": ["Code must be uppercase letters, digits, _ or -"] }
    }
  }
}
401 unauthenticated

json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Token revoked" } }
403 wrong role

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
404 resource not found

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Department not found" } }
409 conflict

json
{ "success": false, "error": { "code": "CONFLICT", "message": "Department name already exists" } }
500 unhandled

json
{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Something went wrong" } }
