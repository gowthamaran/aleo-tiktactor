import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUserFromRequest(req: NextRequest) {
  const headerUsername = req.headers.get("x-username");
  const cookieUsername = req.cookies.get("predictify_username")?.value;
  const usernameRaw = headerUsername?.trim() || cookieUsername?.trim() || "player1";

  const username = usernameRaw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);
  if (!username) {
    throw new Error("Missing username. Provide 'x-username' header or set cookie.");
  }

  let user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    user = await prisma.user.create({ data: { username } });
  }
  return user;
}
