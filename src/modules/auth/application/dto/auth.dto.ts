export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  displayName: string;
}
