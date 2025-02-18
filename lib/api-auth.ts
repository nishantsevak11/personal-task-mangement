import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

type HandlerFunction = (
  req: NextRequest,
  user: { id: number; email: string; name: string }
) => Promise<NextResponse>;

export function withAuth(handler: HandlerFunction) {
  return async (req: NextRequest) => {
    try {
      const user = await auth(req);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      return handler(req, user);
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
