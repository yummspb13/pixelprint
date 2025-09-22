// Vercel environment variables fallback
// This file provides fallback environment variables for Vercel deployment

export const VERCEL_ENV = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  DIRECT_URL: process.env.DIRECT_URL || 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://pixelprint.vercel.app',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg=',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

// Set environment variables if they don't exist
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = VERCEL_ENV.DATABASE_URL;
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = VERCEL_ENV.DIRECT_URL;
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = VERCEL_ENV.NEXTAUTH_URL;
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = VERCEL_ENV.NEXTAUTH_SECRET;
}

if (!process.env.NODE_ENV) {
  // NODE_ENV is read-only, so we can't assign it directly
  // It should be set by the runtime environment
}
