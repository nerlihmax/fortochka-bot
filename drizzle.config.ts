import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db.ts',
    out: './drizzle',
    driver: 'better-sqlite',
    dbCredentials: {
        url: './build/sqlite.db',
    },
} satisfies Config;
