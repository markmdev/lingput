#!/bin/sh
echo 'Running npx prisma generate...' &&
npx prisma generate
echo 'Prisma generate completed. Starting worker...' &&
exec npm run worker:dev