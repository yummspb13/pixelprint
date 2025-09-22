#!/bin/bash
# Setup environment variables for Vercel build

export DATABASE_URL="postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
export NEXTAUTH_URL="https://pixelprint.vercel.app"
export NEXTAUTH_SECRET="YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg="
export NODE_ENV="production"

echo "Environment variables set:"
echo "DATABASE_URL: $DATABASE_URL"
echo "DIRECT_URL: $DIRECT_URL"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "NODE_ENV: $NODE_ENV"

# Run the build command
pnpm run vercel-build
