import * as dotenv from 'dotenv';
import { Neogma } from 'neogma';

dotenv.config();

export const neogma = new Neogma(
    {
        url: process.env.NEO4J_URL || '',
        username: process.env.NEO4J_USERNAME || '',
        password: process.env.NEO4J_PASSWORD || '',
    },
    {
        encrypted: false,
    },
);
