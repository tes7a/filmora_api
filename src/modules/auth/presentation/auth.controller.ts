import { Controller, Post } from '@nestjs/common';

import { ROUTES } from '@/utils';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor() {}

  @Post(ROUTES.AUTH_LOGIN)
  login() {
    // Login logic here
    return { message: 'Login successful' };
  }

  @Post(ROUTES.AUTH_REGISTER)
  register() {
    // Registration logic here
    return { message: 'Registration successful' };
  }
}
