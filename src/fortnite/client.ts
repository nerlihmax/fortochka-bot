import { FortniteAPI } from './FortniteAPI';
import { FORTNITE_API_TOKEN } from '../env';

export const fortnite = new FortniteAPI({
    HEADERS: {
        Authorization: FORTNITE_API_TOKEN,
    },
});
