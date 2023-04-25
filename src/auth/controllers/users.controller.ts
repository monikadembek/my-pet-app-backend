import { Router } from 'express';
import { registerSchema } from '../dto-schema/register-dto.schema.js';
import { loginSchema } from '../dto-schema/login-dto.schema.js';
import { validatorMiddleware } from '../middlewares/validation.middleware.js';
import * as UsersService from '../services/users.service.js';
import bcrypt from 'bcrypt';
import { Prisma, RefreshTokenStorage, Role, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { List, ValidateFunction } from 'express-json-validator-middleware';

export const usersController = Router();

const TOKEN_EXPIRATION_TIME = '1h'; // '15m';

export interface UserData {
  id: string;
  email: string;
  role?: Role;
}

usersController.get('', async (req, res) => {
  let users: User[] = [];
  try {
    users = await UsersService.getUsers();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Couldn't retrieve data from database" });
  }
  return res.status(200).json({ users });
});

usersController.post('/register', validatorMiddleware({ body: registerSchema } as List<ValidateFunction>), async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let user: User;

  try {
    user = await UsersService.registerUser(email, hashedPassword);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Couldn't save user in database" });
  }
  return res.status(201).json({ user });
});

usersController.post('/login', validatorMiddleware({ body: loginSchema } as List<ValidateFunction>), async (req, res) => {
  const { email, password } = req.body;
  let user: User;

  try {
    user = await UsersService.getUser(email, password);
  } catch (error: any | unknown) {
    console.error('Error (users controller): ', error);
    if (error instanceof Prisma.NotFoundError) {
      return res.status(404).json({ error: 'No user found' });
    }
    if (error.message === 'Wrong password') {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Couldn't retrieve data from database" });
  }

  const userData: UserData = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: TOKEN_EXPIRATION_TIME });
  const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET as string);

  // TODO: save refresh token to redis in future
  try {
    await UsersService.saveRefreshToken(refreshToken);
  } catch (error) {
    console.log(error);
  }

  return res.status(200).json({ accessToken, refreshToken });
});

// remove refresh token to revoke access to protected routes
// logout - remove refresh token from list of valid refresh tokens
// so we no longer can generate access token with that refresh token
usersController.delete('/logout', async (req, res) => {
  const { token } = req.body;
  try {
    await UsersService.removeRefreshToken(token);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Removing token failed' });
  }

  return res.status(200).json({ message: 'Token removed' });
});

// get new access token by providing valid refresh token
usersController.post('/token', async (req, res) => {
  const refreshToken: string = req.body.token;
  if (!refreshToken) {
    return res.status(201).json({ message: 'No refresh token provided' });
  }

  // check if this refresh token exists in db, if the token is still valid
  let tokenExists: RefreshTokenStorage;
  try {
    tokenExists = await UsersService.getRefreshToken(refreshToken);
  } catch (error) {
    return res.status(500).json({ message: 'Error while retrivieng token' });
  }

  if (!tokenExists) {
    return res.status(403).json({ message: "Refresh token doesn't exist" });
  }

  // verify provided refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'invalid refresh token' });
    }
    // generate new access token
    const userData: UserData = {
      id: user?.id,
      email: user?.email,
      role: user?.role
    };
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: TOKEN_EXPIRATION_TIME });
    return res.status(200).json({ accessToken });
  });

  return;
});
