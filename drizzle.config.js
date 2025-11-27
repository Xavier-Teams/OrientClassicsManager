const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:01092016@localhost:5432/translation_db";

module.exports = {
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
};
