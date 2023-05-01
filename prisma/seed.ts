import { PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const generatePassword = (password: string) => bcrypt.hash(password, 10);

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});

  const user: User = await prisma.user.create({
    data: {
      email: 'mina@gmail.com',
      password: await generatePassword('zaq1@WSX'),
      pets: {
        create: [
          {
            name: 'Rysia',
            birthdate: null,
            gender: 'samica',
            species: 'kot',
            breed: 'europejski krótkowłosy',
            colour: 'szylkretka',
            hairType: 'krótkie',
            distinguishingMarks: 'maska na twarzy, biała szyja, biały brzuch',
            chipNumber: '',
            description: '',
            photoUrl: '',
            ownerAddress: {
              create: [
                {
                  address: 'Lenartowicza 22/4',
                  city: 'Bydgoszcz',
                  zipCode: '85-133',
                  country: 'Polska'
                }
              ]
            }
          }
        ]
      }
    }
  });

  const user2: User = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: await generatePassword('zaq1@WSX'),
      role: Role.ADMIN
    }
  });

  console.log('users table: ', user, user2);
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
