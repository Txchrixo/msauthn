export type User = {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string;
  picture?: string;
  emailVerified?: boolean;
};
