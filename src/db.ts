import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

import { logger } from './log';

const openDb = () => {
    const dbPath = path.resolve(__dirname, './bot.db'),
        migrationsFolder = path.resolve(__dirname, '../drizzle');

    logger.debug(`opening ${dbPath}`);
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);

    logger.debug(`applying migrations from ${migrationsFolder}`);
    migrate(db, { migrationsFolder });
    logger.info('migration applied');

    return db;
};

export const db = openDb();

export const users = sqliteTable('users', {
    telegramId: integer('tg_id').primaryKey().notNull(),
    telegramDisplayName: text('tg_displayname').notNull(),
    fortniteId: text('fortnite_id').notNull(),
    fortniteNickname: text('fortnite_nickname').notNull(),
    wins: integer('wins').default(0),
    level: integer('level').default(0),
    kills: integer('kills').default(0),
    kd: real('kd').default(0),
    matches: integer('matches').default(0),
    played: integer('played').default(0),
});
