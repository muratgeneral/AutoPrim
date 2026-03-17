import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const { username, currentPassword, newPassword } = await request.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, mevcut şifre ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    // Read existing users
    const fileData = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(fileData);

    // Find user
    const userIndex = users.findIndex((u: any) => u.username === username);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Verify current password
    if (users[userIndex].password !== currentPassword) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 401 });
    }

    // Update password
    users[userIndex].password = newPassword;

    // Write back to file
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
