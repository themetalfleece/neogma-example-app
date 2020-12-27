/* eslint-disable @typescript-eslint/no-empty-interface */
import { neogma } from '../app';

import { ModelFactory, NeogmaInstance } from 'neogma';

export type MoviesPropertiesI = {
    name: string;
    year: number;
};

export interface MoviesRelatedNodesI {}

export type MoviesInstance = NeogmaInstance<
    MoviesPropertiesI,
    MoviesRelatedNodesI
>;

export const Movies = ModelFactory<MoviesPropertiesI, MoviesRelatedNodesI>(
    {
        label: 'Movie',
        primaryKeyField: 'name',
        schema: {
            name: {
                type: 'string',
                minLength: 1,
                required: true,
            },
            year: {
                type: 'number',
                minimum: 1900,
                required: true,
            },
        },
    },
    neogma,
);
