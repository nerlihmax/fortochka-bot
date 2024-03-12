if (typeof process.env.TELEGRAM_API_TOKEN !== 'string') {
    console.error('please, provide TELEGRAM_API_TOKEN');
    process.exit(1);
}

if (typeof process.env.FORTNITE_API_TOKEN !== 'string') {
    console.error('plase, provide FORTNITE_API_TOKEN');
    process.exit(1);
}

if (typeof process.env.ADMINS !== 'string') {
    console.error('please, provide ADMINS usernames splitted by ","');
    process.exit(1);
}

export const { TELEGRAM_API_TOKEN, FORTNITE_API_TOKEN, ADMINS } = process.env;
