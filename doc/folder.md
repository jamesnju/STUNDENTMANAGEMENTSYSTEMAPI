school-management-backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── config/
│   │   ├── env.ts                  # Validated env vars (zod)
│   │   ├── database.ts             # Prisma client singleton
│   │   └── logger.ts               # Pino logger
│   │
│   ├── middlewares/
│   │   ├── authenticate.ts         # Verifies JWT, attaches req.user
│   │   ├── authorize.ts            # Role-based guard
│   │   ├── scopeDepartment.ts      # Teacher/student department scoping
│   │   ├── validate.ts             # Zod request validation
│   │   ├── errorHandler.ts         # Global error handler
│   │   └── notFound.ts
│   │
│   ├── modules/                    # Feature-based modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schema.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.schema.ts
│   │   ├── departments/
│   │   │   ├── department.controller.ts
│   │   │   ├── department.service.ts
│   │   │   ├── department.repository.ts
│   │   │   ├── department.routes.ts
│   │   │   └── department.schema.ts
│   │   ├── teachers/
│   │   ├── students/
│   │   ├── parents/
│   │   ├── classes/
│   │   ├── subjects/
│   │   ├── attendance/
│   │   ├── grades/
│   │   ├── assignments/
│   │   ├── announcements/
│   │   ├── fees/
│   │   └── settings/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── httpErrors.ts       # BadRequest, Unauthorized, etc.
│   │   ├── utils/
│   │   │   ├── password.ts         # bcrypt helpers
│   │   │   ├── jwt.ts              # sign/verify tokens
│   │   │   ├── pagination.ts
│   │   │   └── asyncHandler.ts
│   │   └── types/
│   │       ├── express.d.ts        # req.user type augmentation
│   │       └── roles.ts
│   │
│   ├── app.ts                      # Express app wiring
│   ├── server.ts                   # HTTP server bootstrap
│   └── routes.ts                   # Root router (mounts modules)
│
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md