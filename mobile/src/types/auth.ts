export type User = {
  id: number;
  um_id: number;
  email: string;
  user_fullname: string;
  role: string;
  status: string;
};

export type LoginResponse = {
  user: User;
  token: string;
  redirect?: string;
  otp_required?: boolean;
  otp_verified?: boolean;
  email?: string;
  message?: string;
};

export type VerifyOtpResponse = {
  message: string;
  redirect?: string;
};
