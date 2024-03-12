import { Context } from 'grammy';
import { eq } from 'drizzle-orm';
import { Duration } from 'luxon';

import { TelegramMessage } from '../telegram';
import { db, users } from '../db';
import { LINK_ACCOUNT_CMD } from './linkAccount';
import { ApiError, PlayerGlobalStats } from '../fortnite';
import { fortnite } from '../fortnite/client';

export const ME_CMD = 'fortme';

export function createMeCommand() {
    async function handle(ctx: Context) {
        const msg = new TelegramMessage(ctx);
        if (!msg.sender) {
            return;
        }

        await ctx.react('👀');

        const [user] = await db
            .selectDistinct()
            .from(users)
            .orderBy(eq(users.telegramId, msg.sender.getId()));

        if (!user) {
            await ctx.reply(
                [
                    'Аккаунт не привязан!',
                    `Используй команду /${LINK_ACCOUNT_CMD} nickname .`,
                ].join('\n'),
            );
            return;
        }

        let playerStats: PlayerGlobalStats;
        try {
            playerStats = await fortnite.free.getGlobalPlayerStats(
                user.fortniteId,
            );
        } catch (error) {
            if (error instanceof ApiError) {
                await ctx.reply(
                    `Не получилось запросить статистику по аккаунту`,
                );
                return;
            }

            throw error;
        }

        const acc = { wins: 0, kd: 0, matches: 0, kills: 0, played: 0 };
        for (const mode of Object.values(playerStats.global_stats)) {
            acc.wins += mode.placetop1;
            acc.kd = Math.max(acc.kd, mode.kd);
            acc.matches += mode.matchesplayed;
            acc.kills += mode.kills;
            acc.played += mode.minutesplayed;
        }

        const { level } = playerStats.account;
        const { wins, played, matches, kills, kd } = acc;

        await ctx.reply(
            [
                `Статистика игрока ${user.fortniteNickname} aka ${msg.sender.getDisplayName()}`,
                `Уровень: ${level}`,
                `Сыграно матчей: ${matches}`,
                `Проведено в игре: ${Duration.fromObject({ minutes: played }).toFormat('h:mm')}`,
                `Побед (топ-1): ${wins}`,
                `Убийств: ${kills}`,
                `K/D (лучшее из режимов): ${kd}`,
            ].join('\n'),
        );
    }

    return [ME_CMD, handle] as const;
}
