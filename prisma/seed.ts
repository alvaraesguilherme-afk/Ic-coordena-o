import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const name = process.env.SEED_LIDER_NAME ?? "Admin";
  const email = process.env.SEED_LIDER_EMAIL ?? "admin@ic-coordenacao.local";
  const password = process.env.SEED_LIDER_PASSWORD ?? "troque-esta-senha";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Líder já existe: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "LIDER" },
  });

  console.log(`Líder criado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
