import jwt from 'jsonwebtoken';

const isHostedEnvironment =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT);

const authCookieOptions = {
  httpOnly: true,
  secure: isHostedEnvironment,
  sameSite: isHostedEnvironment ? 'none' : 'lax',
  path: '/',
};

export function signTokenAndSetCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  res.cookie('token', token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function clearAuthCookie(res) {
  res.cookie('token', '', {
    ...authCookieOptions,
    expires: new Date(0),
  });
}
