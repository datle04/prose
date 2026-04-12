import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Tạo tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'nestjs' }, update: {}, create: { name: 'NestJS', slug: 'nestjs' } }),
    prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.upsert({ where: { slug: 'prisma' }, update: {}, create: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript' } }),
  ]);

  // Tạo users
  const hashed = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', password: hashed, name: 'Alice', username: 'alice', role: 'AUTHOR' },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', password: hashed, name: 'Bob', username: 'bob', role: 'AUTHOR' },
  });

  // Tạo posts
  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Getting Started with NestJS', slug: 'getting-started-nestjs', content: 'NestJS is a progressive Node.js framework...', authorId: alice.id, published: true },
      { title: 'Prisma ORM Deep Dive', slug: 'prisma-orm-deep-dive', content: 'Prisma makes database access easy...', authorId: alice.id, published: true },
      { title: 'Next.js 14 App Router', slug: 'nextjs-14-app-router', content: 'The new App Router in Next.js 14...', authorId: bob.id, published: true },
      { title: 'TypeScript Best Practices', slug: 'typescript-best-practices', content: 'TypeScript helps you write better code...', authorId: bob.id, published: true },
      { title: 'Draft Post', slug: 'draft-post', content: 'This is a draft...', authorId: alice.id, published: false },
    ],
  });

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
