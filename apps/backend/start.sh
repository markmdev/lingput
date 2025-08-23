#!/bin/sh
echo 'Waiting for DB to be ready...' &&
npx prisma migrate deploy &&
echo 'Migration complete, seeding data...' &&
node ./prisma/seed-word-ranking.js
exec npm run start