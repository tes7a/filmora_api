import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthLocalService {
  constructor() {}

  public async validateUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    return { username, password };
  }
}
