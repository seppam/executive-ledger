/**
 * lib/prisma.js — Prisma 7 singleton client (Node 20 / ESM compatible)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export default prisma;
