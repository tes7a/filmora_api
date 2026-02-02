export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
