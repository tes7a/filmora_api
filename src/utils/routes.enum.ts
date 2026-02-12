export enum ROUTES {
  AUTH = 'auth',
  AUTH_LOGIN = 'login',
  AUTH_REGISTER = 'register',
  AUTH_CONFIRM_EMAIL = 'confirm-email',
  AUTH_REFRESH = 'refresh',
  AUTH_LOGOUT = 'logout',
  AUTH_ME = 'me',

  ADMIN = 'admin',
  ADMIN_USERS = 'users',
  ADMIN_USER_STATUS = 'users/:userId/status',
  ADMIN_USER_ROLE = 'users/:userId/roles',
}
