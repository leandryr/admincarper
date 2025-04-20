import { NextResponse } from 'next/server';

export async function GET(req) {
  const cookie = req.cookies.get('admin');

  if (!cookie) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const user = JSON.parse(cookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 400 });
  }
}
