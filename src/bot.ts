import { Bot } from 'grammy';

import { TELEGRAM_API_TOKEN } from './env';
import { logger } from './log';
import { TelegramUserError } from './telegram';
import { createLinkAccountCommand } from './commands';
import { createMeCommand } from './commands/me';

const bot = new Bot(TELEGRAM_API_TOKEN);

bot.command(...createLinkAccountCommand());
bot.command(...createMeCommand());

bot.catch(({ ctx, error }) => {
    if (error instanceof TelegramUserError) {
        ctx.reply(error.message);
    } else {
        logger.fatal('unknown error', error);
    }
});

bot.start().then(() => logger.info('started'));
