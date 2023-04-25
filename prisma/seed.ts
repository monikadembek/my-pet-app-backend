import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const generatePassword = (password: string) => bcrypt.hash(password, 10);

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});

  const users = await prisma.user.createMany({
    data: [
      {
        email: 'mina@gmail.com',
        password: await generatePassword('zaq1@WSX')
      },
      {
        email: 'admin@gmail.com',
        password: await generatePassword('zaq1@WSX'),
        role: Role.ADMIN
      }
    ]
  });
  console.log('users table: ', users);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: any) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
