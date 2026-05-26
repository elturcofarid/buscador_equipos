const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@buscador-futbol.local";
  const password = process.env.ADMIN_PASSWORD || "Admin12345!";
  const fullName = process.env.ADMIN_NAME || "Admin Plataforma";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      primaryRole: UserRole.ADMIN
    },
    create: {
      email,
      fullName,
      dateOfBirth: new Date("1990-01-01"),
      passwordHash,
      primaryRole: UserRole.ADMIN
    }
  });

  console.log(`Admin seed listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
