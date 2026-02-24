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
  ADMIN_REVIEW_HIDE = 'reviews/:id/hide',
  ADMIN_REVIEW_UNHIDE = 'reviews/:id/unhide',
  ADMIN_REVIEW_DELETE = 'reviews/:id/delete',
  ADMIN_COMMENT_HIDE = 'comments/:id/hide',
  ADMIN_COMMENT_UNHIDE = 'comments/:id/unhide',
  ADMIN_COMMENT_DELETE = 'comments/:id/delete',
  ADMIN_USER_BLOCK = 'users/:id/block',

  FILMS = 'films',
  FILM_GET_MY_RATING = ':id/rating/me',
  FILM_UPDATE_RATING = ':id/rating',

  REVIEWS = 'reviews',
  REVIEW_COMMENTS = ':id/comments',

  COMMENTS = 'comments',
  COMMENT_BY_ID = ':id',

  COMPLAINTS = 'complaints',

  ME_LISTS = 'me/lists',
  LISTS = 'lists',
  LIST_BY_ID = 'lists/:id',
  LIST_ITEMS = 'lists/:id/items',
  LIST_ITEM_BY_FILM = 'lists/:id/items/:filmId',
}
