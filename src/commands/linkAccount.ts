import { Context } from 'grammy';
import { eq } from 'drizzle-orm';
import { Duration } from 'luxon';

import { TelegramUserError, TelegramMessage } from '../telegram';
import { db, users } from '../db';
import { ApiError, PlayerGlobalStats } from '../fortnite';
import { fortnite } from '../fortnite/client';

export const LINK_ACCOUNT_CMD = 'fortlinkacc';

export function createLinkAccountCommand() {
    type Arguments = {
        username: string;
    };

    function parseArguments(match: Context['match']): Arguments | undefined {
        if (typeof match !== 'string') {
            return;
        }

        const username = match.trim().split(' ').at(0);

        if (!username) {
            return;
        }

        return { username };
    }

    async function handle(ctx: Context) {
        const msg = new TelegramMessage(ctx);
        if (!msg.sender) {
            return;
        }

        const args = parseArguments(ctx.match);
        if (!args) {
            throw new TelegramUserError(
                [
                    'Укажите игровой никнейм!',
                    `Синтаксис: /${LINK_ACCOUNT_CMD} nickname .`,
                ].join('\n'),
            );
        }

        await ctx.react('👀');

        const [user] = await db
            .selectDistinct()
            .from(users)
            .orderBy(eq(users.telegramId, msg.sender.getId()));

        if (user) {
            await ctx.reply(`Аккаунт ${user.fortniteNickname} уже привязан!`);
            return;
        }

        let accountId: string;
        try {
            accountId = (await fortnite.free.basicLookup(args.username))
                .account_id;
        } catch (error) {
            if (error instanceof ApiError && error.status == 404) {
                await ctx.reply(
                    `Аккаунт с никнеймом ${args.username} не найден.`,
                );
                return;
            }

            throw error;
        }

        await db
            .insert(users)
            .values({
                telegramId: msg.sender.getId(),
                telegramDisplayName: msg.sender.getDisplayName(),
                fortniteId: accountId,
                fortniteNickname: args.username,
            })
            .onConflictDoNothing();

        let playerStats: PlayerGlobalStats;
        try {
            playerStats = await fortnite.free.getGlobalPlayerStats(accountId);
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

        await db.update(users).set({
            level,
            wins,
            played,
            matches,
            kills,
            kd,
        });

        await ctx.reply(
            [
                'Аккаунт успешно привязан!',
                '',
                `Статистика игрока ${args.username} aka ${msg.sender.getDisplayName()}`,
                `Уровень: ${level}`,
                `Сыграно матчей: ${matches}`,
                `Проведено в игре: ${Duration.fromObject({ minutes: played }).toFormat('h:mm')}`,
                `Побед (топ-1): ${wins}`,
                `Убийств: ${kills}`,
                `K/D (лучшее из режимов): ${kd}`,
            ].join('\n'),
        );
    }

    return [LINK_ACCOUNT_CMD, handle] as const;
}
