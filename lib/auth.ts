import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, JWT_SECRET, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function login(email: string, password: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    // Create a JWT token
    const token = await encrypt({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Failed to login');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return null;
    }

    const { value } = token;
    const verified = await jwtVerify(value, JWT_SECRET);
    const user = verified.payload as unknown as User;
    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function auth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');

    if (!token) {
      return null;
    }

    const { value } = token;
    const verified = await jwtVerify(value, JWT_SECRET);
    const user = verified.payload as unknown as User;
    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}
