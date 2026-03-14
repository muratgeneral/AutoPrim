import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'monthly-settings.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const settings = JSON.parse(fileContents);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading settings file:", error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json();
    
    if (!Array.isArray(newSettings)) {
      return NextResponse.json({ error: 'Invalid settings format. Expected an array.' }, { status: 400 });
    }

    await fs.writeFile(dataFilePath, JSON.stringify(newSettings, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error("Error writing settings file:", error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
