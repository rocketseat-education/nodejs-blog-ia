const databaseUrl = new URL(process.env.DATABASE_URL)

module.exports = {
  migrationPattern: 'src/database/migrations/*',
  driver: 'pg',
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port) || 5432,
  database: databaseUrl.pathname.slice(1),
  username: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  schemaTable: 'schema_migrations',
}
