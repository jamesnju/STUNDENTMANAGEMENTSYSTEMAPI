src/
├── app.ts                          # express app wiring
├── server.ts                       # entrypoint
├── routes.ts                       # root router (mounts /api/v1/<module>)
│
├── config/
│   ├── database.ts                 # prisma client
│   ├── env.ts                      # zod-validated env
│   ├── logger.ts
│   ├── cloudinary.ts               # NEW: cloudinary SDK instance
│   ├── mailer.ts                   # NEW: nodemailer/Resend transport
│   └── constants.ts                # NEW: enums, magic strings, queues names
│
├── middlewares/
│   ├── authenticate.ts
│   ├── authorize.ts                # role gate
│   ├── validate.ts
│   ├── scopeDepartment.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts              # NEW
│   ├── upload.ts                   # NEW: multer memory storage -> cloudinary
│   └── requestId.ts                # NEW: correlation id (useful on Vercel logs)
│
├── shared/
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── httpErrors.ts           # Unauthorized, Forbidden, NotFound, Conflict, BadRequest, UnprocessableEntity
│   ├── utils/
│   │   ├── asyncHandler.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── pagination.ts
│   │   ├── requireUser.ts
│   │   ├── slug.ts                 # NEW
│   │   ├── crypto.ts               # NEW (hash, random tokens)
│   │   └── dateRange.ts            # NEW (term/semester helpers)
│   ├── types/
│   │   ├── express.d.ts            # req.user augmentation
│   │   └── common.ts
│   └── validators/
│       └── common.schema.ts        # cuidParam, paginationSchema re-export
│
├── modules/
│   │
│   ├── auth/                       # existing
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.repository.ts      # NEW: extract prisma calls
│   │
│   ├── users/                      # existing
│   ├── departments/                # existing
│   ├── settings/                   # existing
│   ├── teachers/                   # existing
│   ├── students/                   # existing
│   │
│   ├── parents/                    # NEW (mirror of student module)
│   │   ├── parent.controller.ts
│   │   ├── parent.service.ts
│   │   ├── parent.repository.ts
│   │   ├── parent.routes.ts
│   │   └── parent.schema.ts
│   │
│   ├── academic/                   # NEW: classes, subjects, terms, enrollment
│   │   ├── classes/
│   │   │   ├── class.controller.ts
│   │   │   ├── class.service.ts
│   │   │   ├── class.repository.ts
│   │   │   ├── class.routes.ts
│   │   │   └── class.schema.ts
│   │   ├── subjects/
│   │   ├── enrollments/
│   │   └── terms/                  # NEW model: academic terms/semesters
│   │
│   ├── timetable/                  # NEW: CRUD slots + conflict detection
│   │   ├── timetable.controller.ts
│   │   ├── timetable.service.ts
│   │   ├── timetable.repository.ts
│   │   ├── timetable.routes.ts
│   │   └── timetable.schema.ts
│   │
│   ├── files/                      # NEW: generic uploads (documents, images)
│   │   ├── file.controller.ts      # upload, list, get, delete, presign
│   │   ├── file.service.ts
│   │   ├── file.repository.ts
│   │   ├── file.routes.ts
│   │   ├── file.schema.ts
│   │   └── file.constants.ts       # allowed mime, size limits, folders
│   │
│   ├── notes/                      # NEW: lesson notes uploaded by teachers
│   │   ├── note.controller.ts
│   │   ├── note.service.ts
│   │   ├── note.repository.ts
│   │   ├── note.routes.ts
│   │   └── note.schema.ts
│   │
│   ├── assignments/                # NEW
│   │   ├── assignment.controller.ts
│   │   ├── assignment.service.ts
│   │   ├── assignment.repository.ts
│   │   ├── assignment.routes.ts
│   │   ├── assignment.schema.ts
│   │   └── submissions/            # NEW: sub-module
│   │       ├── submission.controller.ts
│   │       ├── submission.service.ts
│   │       ├── submission.repository.ts
│   │       └── submission.schema.ts
│   │
│   ├── assessments/                # NEW: quizzes / tests / exams (scheduled or not)
│   │   ├── assessment.controller.ts
│   │   ├── assessment.service.ts
│   │   ├── assessment.repository.ts
│   │   ├── assessment.routes.ts
│   │   ├── assessment.schema.ts
│   │   └── attempts/               # NEW: student attempts + grading
│   │       ├── attempt.controller.ts
│   │       ├── attempt.service.ts
│   │       ├── attempt.repository.ts
│   │       └── attempt.schema.ts
│   │
│   ├── online-classes/             # NEW
│   │   ├── onlineClass.controller.ts
│   │   ├── onlineClass.service.ts  # generate meeting URL (Zoom/Meet/Jitsi)
│   │   ├── onlineClass.repository.ts
│   │   ├── onlineClass.routes.ts
│   │   └── onlineClass.schema.ts
│   │
│   ├── notifications/              # NEW: in-app + email
│   │   ├── notification.controller.ts
│   │   ├── notification.service.ts
│   │   ├── notification.repository.ts
│   │   ├── notification.routes.ts
│   │   ├── notification.schema.ts
│   │   └── channels/
│   │       ├── email.channel.ts    # wraps config/mailer
│   │       └── inapp.channel.ts
│   │
│   └── jobs/                       # NEW: manual-trigger admin endpoints
│       ├── jobs.routes.ts          # POST /admin/jobs/:jobName/run
│       ├── jobs.controller.ts
│       ├── jobs.schema.ts
│       └── runners/
│           ├── index.ts            # registry: name -> runner
│           ├── sendPendingNotifications.runner.ts
│           ├── sendAssessmentReminders.runner.ts
│           ├── dispatchDueNotifications.runner.ts
│           ├── markOverdueAssignments.runner.ts
│           ├── generateDailyDigest.runner.ts
│           └── cleanupExpiredRefreshTokens.runner.ts
│
└── types/                          # global TS types

prisma/
├── schema.prisma                   # split into multiple files w/ prismaSchemaFolder preview if desired
└── seed.ts