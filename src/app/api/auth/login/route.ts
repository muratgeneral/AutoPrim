import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const fileContents = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(fileContents);

    const user = users.find((u: any) => u.username === username && u.password === password);

    if (user) {
      // Don't send password back to client
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ success: false, error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
