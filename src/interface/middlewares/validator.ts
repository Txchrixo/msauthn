import * as yup from 'yup';
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  changePasswordSchema,
  setNewPasswordSchema,
  tokenSchema,
} from '@/utils/validators';
import { Request, Response, NextFunction } from 'express';

const validateRequest = (schema: yup.ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const formattedErrors = err.inner.map((issue) => ({
        field: issue.path || issue.type,
        error: issue.message,
      }));

      return res.status(422).json({
        errorCode: 'ERR_VALIDATION_ERROR',
        messages: formattedErrors,
      });
    }
    next(err);
  }
};

export const loginValidator = validateRequest(loginSchema);
export const registerValidator = validateRequest(registerSchema);
export const requestPasswordResetValidator = validateRequest(requestPasswordResetSchema);
export const changePasswordValidator = validateRequest(changePasswordSchema);
export const setNewPasswordValidator = validateRequest(setNewPasswordSchema);
export const tokenValidator = validateRequest(tokenSchema);
