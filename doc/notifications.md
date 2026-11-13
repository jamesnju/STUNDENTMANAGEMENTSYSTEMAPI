2. NOTIFICATIONS
2.1 POST /notifications — create (ADMIN, or TEACHER for their own class)
Creates a Notification + one NotificationRecipient per (user, channel) pair. Delivery happens asynchronously via POST /admin/jobs/sendPendingNotifications/run, unless you call it from the same request.

Request (ADMIN → all teachers, immediate)

http
POST /api/v1/notifications
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "title": "Staff meeting",
  "body": "10am in the main hall. Attendance required.",
  "audience": "TEACHERS",
  "channels": ["EMAIL", "IN_APP"]
}
Request (TEACHER → their class, scheduled)

http
POST /api/v1/notifications
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "title": "Chemistry revision session",
  "body": "Tomorrow 4pm in Lab 2. Bring your notes.",
  "audience": "CLASS",
  "classId": "clc4d5e6f0005abcd5678cdef",
  "channels": ["EMAIL", "IN_APP"],
  "scheduledFor": "2026-11-12T15:00:00.000Z"
}
Body fields

Field	Type	Required	Notes
title	string 2–200	yes	
body	string 1–10k	yes	
audience	enum	yes	STUDENTS, PARENTS, TEACHERS, STAFF, CLASS
classId	cuid	only when audience = CLASS	
channels	enum[]	yes	Subset of ["EMAIL","IN_APP"]
scheduledFor	ISO datetime	no	null/omitted = send on next job run
Response 201

json
{
  "success": true,
  "data": {
    "id": "cln4d5e6f0004abcd5678ghij",
    "title": "Staff meeting",
    "status": "PENDING",
    "recipientCount": 20,
    "scheduledFor": null
  }
}
Response 201 (scheduled)

json
{
  "success": true,
  "data": {
    "id": "cln4d5e6f0005abcd9999ijkl",
    "title": "Chemistry revision session",
    "status": "PENDING",
    "recipientCount": 64,
    "scheduledFor": "2026-11-12T15:00:00.000Z"
  }
}
Response 400 (missing classId)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "classId required for CLASS audience" } }
Response 400 (no recipients)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "No recipients matched audience" } }
Response 403 (TEACHER trying to broadcast)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Only ADMIN can broadcast beyond a single class" } }
Response 403 (TEACHER not assigned to the class)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "You do not teach this class" } }
Response 400 (validation)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": {
        "title": ["String must contain at least 2 character(s)"],
        "channels": ["Array must contain at least 1 element(s)"]
      }
    }
  }
}
2.2 GET /notifications — list all notifications (ADMIN)
Request

http
GET /api/v1/notifications?page=1&limit=10&status=PENDING&sortDir=desc
Authorization: Bearer <adminToken>
Query params

Name	Type	Required
page, limit	int	no
status	enum PENDING/SENT/FAILED	no
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "cln4d5e6f0004abcd5678ghij",
      "title": "Staff meeting",
      "audience": "TEACHERS",
      "status": "SENT",
      "scheduledFor": null,
      "sentAt": "2026-11-12T09:20:03.000Z",
      "createdAt": "2026-11-12T09:19:58.000Z",
      "createdById": "clx1a2b3c0001abcd1234efgh",
      "_count": { "recipients": 20 }
    },
    {
      "id": "cln4d5e6f0005abcd9999ijkl",
      "title": "Chemistry revision session",
      "audience": "CLASS",
      "status": "PENDING",
      "scheduledFor": "2026-11-12T15:00:00.000Z",
      "sentAt": null,
      "createdAt": "2026-11-12T09:21:10.000Z",
      "createdById": "clt3c4d5e0003abcd3456qrst",
      "_count": { "recipients": 64 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 2 }
}
Response 403 (non-admin)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
2.3 GET /notifications/:id — notification detail + per-recipient status (ADMIN)
Request

http
GET /api/v1/notifications/cln4d5e6f0004abcd5678ghij
Authorization: Bearer <adminToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "cln4d5e6f0004abcd5678ghij",
    "title": "Staff meeting",
    "body": "10am in the main hall. Attendance required.",
    "audience": "TEACHERS",
    "classId": null,
    "scheduledFor": null,
    "status": "SENT",
    "createdById": "clx1a2b3c0001abcd1234efgh",
    "sentAt": "2026-11-12T09:20:03.000Z",
    "createdAt": "2026-11-12T09:19:58.000Z",
    "recipients": [
      {
        "id": "clr6f7g8h0006abcd1111mnop",
        "userId": "clt3c4d5e0003abcd3456qrst",
        "channel": "EMAIL",
        "status": "SENT",
        "sentAt": "2026-11-12T09:20:01.000Z",
        "readAt": null,
        "error": null,
        "user": { "email": "jane.doe@school.test", "role": "TEACHER" }
      },
      {
        "id": "clr6f7g8h0007abcd2222qrst",
        "userId": "clt3c4d5e0003abcd3456qrst",
        "channel": "IN_APP",
        "status": "SENT",
        "sentAt": "2026-11-12T09:20:01.000Z",
        "readAt": "2026-11-12T09:35:12.000Z",
        "error": null,
        "user": { "email": "jane.doe@school.test", "role": "TEACHER" }
      }
    ]
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Notification not found" } }
2.4 POST /notifications/:id/cancel — cancel a pending notification (ADMIN)
Only PENDING notifications can be cancelled. Marks every still-PENDING recipient as FAILED with error: "Cancelled by admin", and sets the parent to FAILED.

Request

http
POST /api/v1/notifications/cln4d5e6f0005abcd9999ijkl/cancel
Authorization: Bearer <adminToken>
Response 200

json
{ "success": true, "data": { "id": "cln4d5e6f0005abcd9999ijkl", "status": "FAILED" } }
Response 400 (already sent)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Only PENDING notifications can be cancelled" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Notification not found" } }
2.5 GET /notifications/inbox — current user's in-app inbox
Returns only IN_APP channel recipients for the caller. unread counts recipient rows where readAt = null.

Request

http
GET /api/v1/notifications/inbox?page=1&limit=10
Authorization: Bearer <teacherToken>
Response 200

json
{
  "success": true,
  "data": [
    {
      "recipientId": "clr6f7g8h0007abcd2222qrst",
      "readAt": "2026-11-12T09:35:12.000Z",
      "sentAt": "2026-11-12T09:20:01.000Z",
      "notification": {
        "id": "cln4d5e6f0004abcd5678ghij",
        "title": "Staff meeting",
        "body": "10am in the main hall. Attendance required.",
        "audience": "TEACHERS",
        "createdAt": "2026-11-12T09:19:58.000Z"
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "unread": 0 }
}
Response 200 (empty inbox)

json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "unread": 0 }
}
2.6 POST /notifications/inbox/read — mark read
Two modes: mark all unread as read, or mark specific recipient rows.

Request — mark all

http
POST /api/v1/notifications/inbox/read
Authorization: Bearer <teacherToken>
Content-Type: application/json

{}
Request — mark specific rows

http
POST /api/v1/notifications/inbox/read
Authorization: Bearer <teacherToken>
Content-Type: application/json

{
  "recipientIds": ["clr6f7g8h0007abcd2222qrst", "clr6f7g8h0008abcd3333zzzz"]
}
Response 200

json
{ "success": true, "data": { "marked": 2 } }
Response 200 (nothing unread)

json
{ "success": true, "data": { "marked": 0 } }
Response 400 (bad ids)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": { "recipientIds": ["Invalid cuid"] }
    }
  }
}
Security: recipientIds are filtered by userId: currentUser server-side, so a user cannot mark another user's rows.

3. End-to-end workflow examples
3.1 Teacher attaches a note to a class (files + future notes)
bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@school.test","password":"Password123!"}' | jq -r .data.accessToken)

# 1. Upload the file
FILE=$(curl -s -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "category=NOTE" \
  -F "file=@./chapter1.pdf")
FILE_ID=$(echo $FILE | jq -r .data.id)
echo "Uploaded file: $FILE_ID"

# 2. (Future) Attach to a Note: POST /notes with { ..., fileIds: [FILE_ID] }
#    For now the file row exists and can be referenced.
3.2 Admin sends a school-wide announcement and delivers immediately
bash
ADMIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.test","password":"Password123!"}' | jq -r .data.accessToken)

# 1. Create
NID=$(curl -s -X POST http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"title":"Sports day Friday","body":"All students report to the field at 8am.","audience":"STUDENTS","channels":["EMAIL","IN_APP"]}' \
  | jq -r .data.id)

# 2. Deliver
curl -X POST http://localhost:3000/api/v1/admin/jobs/sendPendingNotifications/run \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"limit":100}'

# 3. Inspect
curl "http://localhost:3000/api/v1/notifications/$NID" \
  -H "Authorization: Bearer $ADMIN"
3.3 Teacher broadcasts to their class, then a student reads inbox
bash
TEACHER=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@school.test","password":"Password123!"}' | jq -r .data.accessToken)

curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer $TEACHER" -H "Content-Type: application/json" \
  -d '{
    "title":"Chemistry revision",
    "body":"Tomorrow 4pm in Lab 2.",
    "audience":"CLASS",
    "classId":"clc4d5e6f0005abcd5678cdef",
    "channels":["EMAIL","IN_APP"]
  }'

# deliver
curl -X POST http://localhost:3000/api/v1/admin/jobs/sendPendingNotifications/run \
  -H "Authorization: Bearer $TEACHER" -H "Content-Type: application/json" -d '{}'

# student reads
STUDENT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@school.test","password":"Password123!"}' | jq -r .data.accessToken)

curl "http://localhost:3000/api/v1/notifications/inbox?page=1&limit=10" \
  -H "Authorization: Bearer $STUDENT"

# mark read
curl -X POST http://localhost:3000/api/v1/notifications/inbox/read \
  -H "Authorization: Bearer $STUDENT" -H "Content-Type: application/json" -d '{}'
4. Common error envelopes (repeat for reference)
401

json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "No token provided" } }
403

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Resource not found" } }
409

json
{ "success": false, "error": { "code": "CONFLICT", "message": "Already exists" } }
500

json
{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Something went wrong" } }
