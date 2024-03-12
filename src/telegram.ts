import { Context } from 'grammy';
import { User } from 'grammy/types';

import { ADMINS } from './env';

export class TelegramUserError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, TelegramUserError.prototype);
    }
}

export class TelegramMessage {
    sender?: TelegramMessageUser;

    public constructor(private readonly ctx: Context) {
        if (this.ctx.from) {
            this.sender = new TelegramMessageUser(this.ctx.from);
        }
    }
}

class TelegramMessageUser {
    public constructor(private readonly user: User) {}

    public getDisplayName(): string {
        return this.user.last_name
            ? `${this.user.first_name} ${this.user.last_name}`
            : this.user.first_name;
    }

    public getPingName(): string {
        return this.user.username ?? this.getDisplayName();
    }

    public getId(): number {
        return this.user.id;
    }

    public isAdmin(): boolean {
        return Boolean(
            this.user.username &&
                ADMINS.split(',').includes(this.user.username),
        );
    }
}
