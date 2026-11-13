1. FILES
All file routes require authentication (any role). Admin can manage any file; others can only delete their own.

1.1 GET /files/sign — signed direct-upload params
Use this when the file is large (Vercel free tier limit is 4.5 MB). The browser POSTs bytes directly to Cloudinary using these params, then you send the returned public_id/url to whichever feature needs the file.

Request

http
GET /api/v1/files/sign?category=NOTE
Authorization: Bearer <accessToken>
Query params

Name	Type	Required	Notes
category	enum	no	NOTE, ASSIGNMENT_ATTACHMENT, SUBMISSION_ATTACHMENT, EXAM_PAPER, PROFILE_IMAGE, OTHER. Default OTHER.
Response 200

json
{
  "success": true,
  "data": {
    "cloudName": "my-school-cloud",
    "apiKey": "123456789012345",
    "timestamp": 1731404732,
    "folder": "school/notes/clx1a2b3c0001abcd1234efgh",
    "signature": "a1b2c3d4e5f6...",
    "uploadUrl": "https://api.cloudinary.com/v1_1/my-school-cloud/auto/upload"
  }
}
Client usage (browser)

js
const signed = await fetch('/api/v1/files/sign?category=NOTE', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(r => r.data);

const form = new FormData();
form.append('file', fileInput.files[0]);
form.append('api_key', signed.apiKey);
form.append('timestamp', signed.timestamp);
form.append('folder', signed.folder);
form.append('signature', signed.signature);

const cloudRes = await fetch(signed.uploadUrl, { method: 'POST', body: form });
const { public_id, secure_url, resource_type, bytes, format } = await cloudRes.json();
// POST these to a feature endpoint (e.g. /notes) to create the File row
Response 401

json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "No token provided" } }
Response 400 (bad category)

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": [], "fieldErrors": { "category": ["Invalid enum value"] } }
  }
}
1.2 POST /files/upload — server-mediated upload
Use for small files (< 15 MB) when you don't want to handle Cloudinary directly from the browser.

Request

http
POST /api/v1/files/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data; boundary=----X

------X
Content-Disposition: form-data; name="category"

NOTE
------X
Content-Disposition: form-data; name="file"; filename="chapter1.pdf"
Content-Type: application/pdf

<binary>
------X--
Form fields

Field	Type	Required	Notes
file	file	yes	Must be one of allowed MIME types (pdf/doc/docx/xls/xlsx/ppt/pptx/txt/png/jpg/webp/gif). Max 15 MB.
category	enum	no	Defaults to OTHER.
Response 201

json
{
  "success": true,
  "data": {
    "id": "clf1a2b3c0001abcd9999zzzz",
    "publicId": "school/notes/clx1a2b3c0001abcd1234efgh/chapter1_abc123",
    "url": "https://res.cloudinary.com/my-school-cloud/raw/upload/v1731404732/school/notes/.../chapter1_abc123.pdf",
    "resourceType": "raw",
    "format": "pdf",
    "bytes": 284512,
    "originalName": "chapter1.pdf",
    "mimeType": "application/pdf",
    "category": "NOTE",
    "uploadedById": "clx1a2b3c0001abcd1234efgh",
    "noteId": null,
    "assignmentId": null,
    "submissionId": null,
    "assessmentId": null,
    "createdAt": "2026-11-12T09:15:00.000Z"
  }
}
Response 400 (no file)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "No file uploaded (field name: \"file\")" } }
Response 400 (unsupported type)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Unsupported file type: video/mp4" } }
Response 400 (too large — multer)

json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "File too large" } }
1.3 GET /files — list files (paginated)
Request

http
GET /api/v1/files?page=1&limit=10&category=NOTE&uploadedById=clx1a2b3c0001abcd1234efgh&sortDir=desc
Authorization: Bearer <accessToken>
Query params

Name	Type	Required
page, limit	int	no
category	enum	no
uploadedById	cuid	no
Response 200

json
{
  "success": true,
  "data": [
    {
      "id": "clf1a2b3c0001abcd9999zzzz",
      "publicId": "school/notes/clx1a2b3c0001abcd1234efgh/chapter1_abc123",
      "url": "https://res.cloudinary.com/.../chapter1_abc123.pdf",
      "resourceType": "raw",
      "format": "pdf",
      "bytes": 284512,
      "originalName": "chapter1.pdf",
      "mimeType": "application/pdf",
      "category": "NOTE",
      "uploadedById": "clx1a2b3c0001abcd1234efgh",
      "noteId": null,
      "assignmentId": null,
      "submissionId": null,
      "assessmentId": null,
      "createdAt": "2026-11-12T09:15:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
1.4 GET /files/:id — file metadata
Request

http
GET /api/v1/files/clf1a2b3c0001abcd9999zzzz
Authorization: Bearer <accessToken>
Response 200

json
{
  "success": true,
  "data": {
    "id": "clf1a2b3c0001abcd9999zzzz",
    "publicId": "school/notes/clx1a2b3c0001abcd1234efgh/chapter1_abc123",
    "url": "https://res.cloudinary.com/.../chapter1_abc123.pdf",
    "resourceType": "raw",
    "format": "pdf",
    "bytes": 284512,
    "originalName": "chapter1.pdf",
    "mimeType": "application/pdf",
    "category": "NOTE",
    "uploadedById": "clx1a2b3c0001abcd1234efgh",
    "createdAt": "2026-11-12T09:15:00.000Z"
  }
}
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "File not found" } }
1.5 DELETE /files/:id — delete file (owner or ADMIN)
Destroys the Cloudinary asset and the DB row.

Request

http
DELETE /api/v1/files/clf1a2b3c0001abcd9999zzzz
Authorization: Bearer <accessToken>
Response 200

json
{ "success": true, "data": { "id": "clf1a2b3c0001abcd9999zzzz", "deleted": true } }
Response 403 (not owner)

json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "You can only delete your own files" } }
Response 404

json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "File not found" } }
