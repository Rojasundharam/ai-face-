import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserModel } from '@/lib/db/queries.js';
import { validate, schemas } from '@/lib/utils/validation.js';
import logger from '@/lib/utils/logger.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = validate(schemas.register, body);

    // Check if user exists
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = UserModel.create(username, email, passwordHash);

    logger.info('User registered', { userId: result.lastInsertRowid, email });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: result.lastInsertRowid,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
