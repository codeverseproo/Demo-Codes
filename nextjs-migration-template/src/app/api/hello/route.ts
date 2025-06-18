import { NextRequest, NextResponse } from 'next/server';

// Example API route - GET /api/hello
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';
  
  return NextResponse.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}

// Example API route - POST /api/hello
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: `Hello, ${name}! (from POST)`,
      timestamp: new Date().toISOString(),
      method: 'POST',
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}

