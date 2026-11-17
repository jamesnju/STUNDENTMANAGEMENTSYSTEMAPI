import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { submissionController } from './submission.controller';
import {
  submitAssignmentSchema,
  gradeSubmissionSchema,
  listSubmissionsSchema,
  idParamSchema,
  assignmentIdParamSchema,
} from './submission.schema';

const router = Router();
router.use(authenticate);

// Student routes
router.post(
  '/assignments/:assignmentId/submit',
  authorize('STUDENT'),
  validate({ params: assignmentIdParamSchema, body: submitAssignmentSchema }),
  asyncHandler(submissionController.submit),
);
router.get(
  '/assignments/:assignmentId/submissions/me',
  authorize('STUDENT'),
  validate({ params: assignmentIdParamSchema }),
  asyncHandler(submissionController.getMine),
);

// Teacher / admin routes
router.get(
  '/assignments/:assignmentId/submissions',
  authorize('ADMIN', 'TEACHER'),
  validate({ params: assignmentIdParamSchema, query: listSubmissionsSchema }),
  asyncHandler(submissionController.listForAssignment),
);
router.patch(
  '/submissions/:id/grade',
  authorize('ADMIN', 'TEACHER'),
  validate({ params: idParamSchema, body: gradeSubmissionSchema }),
  asyncHandler(submissionController.grade),
);

// Shared — teacher sees their students', student sees own
router.get(
  '/submissions/:id',
  validate({ params: idParamSchema }),
  asyncHandler(submissionController.getOne),
);

export default router;