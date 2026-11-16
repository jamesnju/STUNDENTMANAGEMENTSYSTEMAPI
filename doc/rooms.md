# Rooms API Documentation — Sample Requests & Responses

Base URL: `http://localhost:3000/api/v1`
Auth header on every route: `Authorization: Bearer <accessToken>`

**Permissions:** any authenticated user can read rooms; only `ADMIN` can create, update, or delete.

---

# 1. `POST /admin/rooms` — create room

**Request**
```http
POST /api/v1/admin/rooms
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Lab 1",
  "code": "L1",
  "building": "Science Block",
  "floor": 2,
  "capacity": 40,
  "description": "Chemistry lab with fume hoods"
}
```

**Body fields**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string 1–50 | yes | Must be unique |
| `code` | string 1–20 | no | Must be unique if provided |
| `capacity` | int 1–1000 | no | |
| `building` | string ≤50 | no | |
| `floor` | int -5…100 | no | |
| `description` | string ≤255 | no | |

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c0001abcd1234efgh",
    "name": "Lab 1",
    "code": "L1",
    "capacity": 40,
    "building": "Science Block",
    "floor": 2,
    "description": "Chemistry lab with fume hoods",
    "isActive": true,
    "createdAt": "2026-11-16T09:00:00.000Z",
    "updatedAt": "2026-11-16T09:00:00.000Z"
  }
}
```

**Response `201`** (minimal)
```http
POST /api/v1/admin/rooms
Content-Type: application/json

{ "name": "Hall" }
```
```json
{
  "success": true,
  "data": {
    "id": "clr2b3c4d0002abcd5678ijkl",
    "name": "Hall",
    "code": null,
    "capacity": null,
    "building": null,
    "floor": null,
    "description": null,
    "isActive": true,
    "createdAt": "2026-11-16T09:01:00.000Z",
    "updatedAt": "2026-11-16T09:01:00.000Z"
  }
}
```

**Response `409`** (duplicate name)
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Room name already exists" }
}
```

**Response `409`** (duplicate code)
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Room code already exists" }
}
```

**Response `400`** (validation)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": [],
      "fieldErrors": {
        "name": ["String must contain at least 1 character(s)"],
        "capacity": ["Number must be greater than 0"]
      }
    }
  }
}
```

**Response `403`** (non-admin)
```json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
```

---

# 2. `GET /admin/rooms` — list rooms

**Request**
```http
GET /api/v1/admin/rooms?page=1&limit=20&search=lab&building=Science%20Block&isActive=true
Authorization: Bearer <accessToken>
```

**Query params**
| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `page` | int | no | default 1 |
| `limit` | int | no | default 20 |
| `search` | string | no | Matches `name`, `code`, or `building` (case-insensitive) |
| `building` | string | no | Exact building filter |
| `isActive` | boolean or `"true"`/`"false"` | no | |

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "clr1a2b3c0001abcd1234efgh",
      "name": "Lab 1",
      "code": "L1",
      "capacity": 40,
      "building": "Science Block",
      "floor": 2,
      "description": "Chemistry lab with fume hoods",
      "isActive": true,
      "createdAt": "2026-11-16T09:00:00.000Z",
      "updatedAt": "2026-11-16T09:00:00.000Z"
    },
    {
      "id": "clr3c4d5e0003abcd9012mnop",
      "name": "Lab 2",
      "code": "L2",
      "capacity": 35,
      "building": "Science Block",
      "floor": 2,
      "description": null,
      "isActive": true,
      "createdAt": "2026-11-16T09:02:00.000Z",
      "updatedAt": "2026-11-16T09:02:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 2 }
}
```

**Response `200`** (empty)
```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

**Note:** rooms are ordered by `building` ascending, then `name` ascending, so dropdowns group naturally.

---

# 3. `GET /admin/rooms/:id` — room detail

**Request**
```http
GET /api/v1/admin/rooms/clr1a2b3c0001abcd1234efgh
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c0001abcd1234efgh",
    "name": "Lab 1",
    "code": "L1",
    "capacity": 40,
    "building": "Science Block",
    "floor": 2,
    "description": "Chemistry lab with fume hoods",
    "isActive": true,
    "createdAt": "2026-11-16T09:00:00.000Z",
    "updatedAt": "2026-11-16T09:00:00.000Z"
  }
}
```

**Response `404`**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Room not found" } }
```

---

# 4. `PATCH /admin/rooms/:id` — update room

**Request** (partial)
```http
PATCH /api/v1/admin/rooms/clr1a2b3c0001abcd1234efgh
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Chemistry Lab",
  "capacity": 45
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c0001abcd1234efgh",
    "name": "Chemistry Lab",
    "code": "L1",
    "capacity": 45,
    "building": "Science Block",
    "floor": 2,
    "description": "Chemistry lab with fume hoods",
    "isActive": true,
    "createdAt": "2026-11-16T09:00:00.000Z",
    "updatedAt": "2026-11-16T10:15:00.000Z"
  }
}
```

**Request** (clear optional fields with `null`)
```http
PATCH /api/v1/admin/rooms/clr1a2b3c0001abcd1234efgh
Content-Type: application/json

{
  "code": null,
  "description": null
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c0001abcd1234efgh",
    "name": "Chemistry Lab",
    "code": null,
    "capacity": 45,
    "building": "Science Block",
    "floor": 2,
    "description": null,
    "isActive": true,
    "updatedAt": "2026-11-16T10:20:00.000Z"
  }
}
```

**Request** (deactivate without deleting)
```http
PATCH /api/v1/admin/rooms/clr1a2b3c0001abcd1234efgh
Content-Type: application/json

{ "isActive": false }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c0001abcd1234efgh",
    "name": "Chemistry Lab",
    "isActive": false
  }
}
```

**Response `409`** (renaming to an existing name)
```json
{ "success": false, "error": { "code": "CONFLICT", "message": "Room name already exists" } }
```

**Response `400`** (empty body)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "formErrors": ["At least one field is required"],
      "fieldErrors": {}
    }
  }
}
```

**Response `404`**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Room not found" } }
```

---

# 5. `DELETE /admin/rooms/:id` — soft delete (deactivate) room

Not a hard delete — flips `isActive: false`. Historic timetable slots keep referencing the room by `id` and rendering its name.

**Request**
```http
DELETE /api/v1/admin/rooms/clr1a2b3c0001abcd1234efgh
Authorization: Bearer <adminToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": { "id": "clr1a2b3c0001abcd1234efgh", "isActive": false }
}
```

**Response `400`** (room is in use)
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot delete room: 4 timetable slot(s) reference it. Reassign them first."
  }
}
```

**Response `404`**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Room not found" } }
```

---

# 6. How the timetable consumes rooms

Once a room exists, `POST /timetable` (and `PATCH /timetable/:id`) accept `roomId`. The response from `GET /timetable` includes `roomRel`.

## 6.1 `POST /timetable` — with room

**Request**
```http
POST /api/v1/timetable
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "classId": "clc4d5e6f0005abcd5678cdef",
  "subjectId": "cls2b3c4d0002abcd5678ijkl",
  "teacherId": "clt3c4d5e0003abcd3456qrst",
  "roomId": "clr1a2b3c0001abcd1234efgh",
  "dayOfWeek": 1,
  "period": 1,
  "startTime": "08:00",
  "endTime": "08:40"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "classId": "clc4d5e6f0005abcd5678cdef",
    "subjectId": "cls2b3c4d0002abcd5678ijkl",
    "teacherId": "clt3c4d5e0003abcd3456qrst",
    "studentId": null,
    "roomId": "clr1a2b3c0001abcd1234efgh",
    "room": null,
    "dayOfWeek": 1,
    "period": 1,
    "startTime": "08:00",
    "endTime": "08:40",
    "createdAt": "2026-11-16T09:10:00.000Z",
    "updatedAt": "2026-11-16T09:10:00.000Z"
  }
}
```

**Response `404`** (bad room)
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Room not found or inactive" } }
```

**Response `409`** (room double-booked)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This room is already booked at that day and period"
  }
}
```

## 6.2 `GET /timetable` — room resolved inline

**Request**
```http
GET /api/v1/timetable?classId=clc4d5e6f0005abcd5678cdef&roomId=clr1a2b3c0001abcd1234efgh
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "clts8h9i0j0010abcd7890qrst",
      "dayOfWeek": 1,
      "period": 1,
      "startTime": "08:00",
      "endTime": "08:40",
      "class": { "id": "clc4d5e6f0005abcd5678cdef", "name": "Form 1A", "code": "F1A" },
      "subject": { "id": "cls2b3c4d0002abcd5678ijkl", "name": "Mathematics", "code": "MATH" },
      "teacher": { "id": "clt3c4d5e0003abcd3456qrst", "firstName": "Jane", "lastName": "Doe" },
      "roomRel": {
        "id": "clr1a2b3c0001abcd1234efgh",
        "name": "Chemistry Lab",
        "code": "L1",
        "building": "Science Block"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

The frontend renders `slot.roomRel?.name ?? slot.room ?? "—"`. New slots always show the current room name; legacy slots (before `roomId` existed) still render their free-text `room`.

## 6.3 `PATCH /timetable/:id` — reassign room

**Request**
```http
PATCH /api/v1/timetable/clts8h9i0j0010abcd7890qrst
Authorization: Bearer <adminToken>
Content-Type: application/json

{ "roomId": "clr3c4d5e0003abcd9012mnop" }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "roomId": "clr3c4d5e0003abcd9012mnop",
    "room": null
  }
}
```

**Request** — clear room (unassign)
```http
PATCH /api/v1/timetable/clts8h9i0j0010abcd7890qrst
Content-Type: application/json

{ "roomId": null }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "clts8h9i0j0010abcd7890qrst",
    "roomId": null
  }
}
```

---

# 7. Common error envelopes (repeat for reference)

**`401`**
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "No token provided" } }
```

**`403`**
```json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient role" } }
```

**`404`**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Room not found" } }
```

**`409`**
```json
{ "success": false, "error": { "code": "CONFLICT", "message": "Room name already exists" } }
```

**`400`**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "formErrors": [], "fieldErrors": { "…": ["…"] } }
  }
}
```

**`500`**
```json
{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Something went wrong" } }
```

---

# 8. End-to-end workflow

```bash
BASE=http://localhost:3000/api/v1
ADMIN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.local","password":"..."}' | jq -r .data.accessToken)

# 1. Create a room
ROOM=$(curl -s -X POST $BASE/admin/rooms \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"name":"Lab 1","code":"L1","building":"Science Block","capacity":40}' \
  | jq -r .data.id)
echo "Created room: $ROOM"

# 2. List rooms (dropdown feed)
curl "$BASE/admin/rooms?isActive=true&limit=100" \
  -H "Authorization: Bearer $ADMIN" | jq '.data[] | {id, name, building}'

# 3. Reference the room from a timetable slot
CLASS=clc4d5e6f0005abcd5678cdef
SUBJECT=cls2b3c4d0002abcd5678ijkl
TEACHER=clt3c4d5e0003abcd3456qrst   # Teacher.id, not User.id

curl -X POST $BASE/timetable \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d "{
    \"classId\":\"$CLASS\",
    \"subjectId\":\"$SUBJECT\",
    \"teacherId\":\"$TEACHER\",
    \"roomId\":\"$ROOM\",
    \"dayOfWeek\":1,
    \"period\":1,
    \"startTime\":\"08:00\",
    \"endTime\":\"08:40\"
  }"

# 4. Rename the room — the timetable slot now shows the new name everywhere
curl -X PATCH $BASE/admin/rooms/$ROOM \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"name":"Chemistry Lab"}'

# 5. Confirm the timetable reflects the rename (roomRel.name)
curl "$BASE/timetable?classId=$CLASS" \
  -H "Authorization: Bearer $ADMIN" | jq '.data[0].roomRel'

# 6. Try to deactivate while in use — expect 400
curl -X DELETE $BASE/admin/rooms/$ROOM -H "Authorization: Bearer $ADMIN"
```

---

# 9. Frontend wiring (already covered in `useAcademic.ts`)

```ts
import { useRooms, useCreateRoom, useDeleteRoom } from "@/hooks/useAcademic";

const { data: roomsData } = useRooms({ isActive: true, limit: 100 });
// data shape: { data: Room[], meta: { page, limit, total } }

const { mutate: createRoom } = useCreateRoom();
createRoom({ name: "Lab 1", code: "L1", building: "Science Block", capacity: 40 });

const { mutate: deleteRoom } = useDeleteRoom();
deleteRoom(roomId);
```

Dropdown:

```tsx
<select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
  <option value="">Select Room...</option>
  {roomsData?.data.map((r) => (
    <option key={r.id} value={r.id}>
      {r.name}{r.building ? ` — ${r.building}` : ""}{r.capacity ? ` (cap ${r.capacity})` : ""}
    </option>
  ))}
</select>
```

---

## Room API acceptance checklist

- [ ] `POST /admin/rooms` creates a room and rejects duplicate `name` and `code` with `409`.
- [ ] `GET /admin/rooms` filters by `search`, `building`, `isActive`, paginated with `meta`.
- [ ] `GET /admin/rooms/:id` returns 404 for unknown id.
- [ ] `PATCH /admin/rooms/:id` supports partial updates, `null` to clear optional fields, `isActive: false` to deactivate.
- [ ] `DELETE /admin/rooms/:id` soft-deletes (sets `isActive: false`) and blocks when timetable slots reference it.
- [ ] `POST /timetable` with `roomId` returns `roomRel`; double-booking the room returns `409`.
- [ ] Renaming a room updates every timetable slot referencing it (via `roomRel`).