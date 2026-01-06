export const AUTH = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
}

export const KYC = {
    SUBMIT: '/kyc',
}
export const COINS = {
    COINLIST: '/market/coins',
    ASSETS: '/market/assets',
    CREATE: '/market/wallet',
    DEPOSIT: '/market/deposit',
    WITHDRAW: '/market/withdraw',
    BANK_WITHDRAW: '/market/withdraw/bank',
}

export const MARKET_PAIR = {
    LIST: '/market/pairs',
    GET_PAIR: (id: string) => `/market/pairs/${id}`,
}