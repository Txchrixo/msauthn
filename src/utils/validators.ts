import * as yup from 'yup';

export const loginSchema = yup
  .object()
  .shape({
    email: yup.string().email('Invalid email format').nullable(),
    phoneNumber: yup
      .string()
      .matches(/^\+?\d{10,15}$/, 'Invalid phone number format')
      .nullable(),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  })
  .test('email', 'Either email or phone number must be given', (value) => {
    return !!(value?.email || value?.phoneNumber);
  });

export const registerSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup
    .string()
    .matches(/^\+\d{1,3}\d{4,14}$/, 'Invalid phone number format')
    .required('Phone number is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
});

export const requestPasswordResetSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  redirectUrl: yup.string().url('Invalid redirect URL').required('Redirect URL is required'),
});

export const changePasswordSchema = yup.object().shape({
  userId: yup.string().required('User ID is required'),
  oldPassword: yup.string().min(8, 'Old password must be at least 8 characters').required('Old password is required'),
  newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
  repeatNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please repeat the new password'),
});

export const setNewPasswordSchema = yup.object().shape({
  resetToken: yup.string().required('Reset token is required'),
  newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
  repeatNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please repeat the new password'),
});

export const tokenSchema = yup.object().shape({
  token: yup.string().required('token is required'),
});
