export const AUTH = {
  LOGIN: "/auth/login",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  SIGNUP: "/auth/signup",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  RESEND_OTP: "/auth/resend-otp",
};

export const KYC = {
  SUBMIT: "/kyc",
  ME: "/kyc/me",
};
export const COINS = {
  COINLIST: "/market/coins",
  ASSETS: "/market/assets",
  CREATE: "/market/wallet",
  DEPOSIT: "/market/deposit",
  WITHDRAW: "/market/withdraw",
  BANK_WITHDRAW: "/market/withdraw/bank",
  CONVERSIONS: "/market/conversion",
};

export const MARKET_PAIR = {
  LIST: "/market/pairs",
  GET_PAIR: (id: string) => `/market/pairs/${id}`,
};

export const SUPPORT = {
  TICKETS: "/support",
  ALL_TICKETS: "/support/all",
  REPLY: (id: string) => `/support/${id}/reply`,
};
