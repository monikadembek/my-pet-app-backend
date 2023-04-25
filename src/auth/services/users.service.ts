import { PrismaClient, RefreshTokenStorage, User } from '@prisma/client';
import { ErrorResponse } from 'auth/models/error';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function getUsers(): Promise<User[]> {
  return await prisma.user.findMany({});
}

export async function registerUser(email: string, password: string): Promise<User> {
  return await prisma.user.create({
    data: {
      email: email,
      password: password
    }
  });
}

export async function getUser(email: string, password: string): Promise<User> {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: email
    }
  });
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    return user;
  } else {
    const error: ErrorResponse = new Error('Wrong password');
    error.statusCode = 401;
    throw error;
  }
}

export async function saveRefreshToken(token: string): Promise<RefreshTokenStorage> {
  return await prisma.refreshTokenStorage.create({
    data: {
      token: token
    }
  });
}

export async function removeRefreshToken(token: string): Promise<RefreshTokenStorage> {
  return await prisma.refreshTokenStorage.delete({
    where: {
      token: token
    }
  });
}

export async function getRefreshToken(token: string): Promise<RefreshTokenStorage> {
  return await prisma.refreshTokenStorage.findFirstOrThrow({
    where: {
      token: token
    }
  });
}
