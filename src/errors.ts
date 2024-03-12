import { TelegramUserError } from './telegram';

export const createAccessDeniedError = () =>
    new TelegramUserError('Команда доступна только администраторам');
