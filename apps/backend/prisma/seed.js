const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function rawSql() {
  const rawSqlContent = fs.readFileSync(
    path.join(__dirname, "vocabulary_rows.sql"),
    "utf8"
  );
  const result = await prisma.$executeRawUnsafe(rawSqlContent);
  console.log({ result });
}

rawSql();
