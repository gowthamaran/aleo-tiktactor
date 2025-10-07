import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions, SessionData } from '@/lib/session';
import { z } from 'zod';

const bodySchema = z.object({ username: z.string().min(2).max(24) });

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const username = parse.data.username.toLowerCase();
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, displayName: username },
  });

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.userId = user.id;
  session.username = user.username;
  session.isAdmin = username === 'admin';
  await session.save();

  return NextResponse.json({ ok: true, user: { id: user.id, username: user.username, balance: user.balance } });
}
