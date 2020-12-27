/* eslint-disable @typescript-eslint/no-empty-interface */
import { neogma } from '../app';

import { ModelFactory, NeogmaInstance, ModelRelatedNodesI } from 'neogma';
import { Movies, MoviesInstance } from './Movies';

export type UsersPropertiesI = {
    name: string;
    age: number;
};

export interface UsersRelatedNodesI {
    LikesMovie: ModelRelatedNodesI<typeof Movies, MoviesInstance>;
}

export type UsersInstance = NeogmaInstance<
    UsersPropertiesI,
    UsersRelatedNodesI
>;

export const Users = ModelFactory<UsersPropertiesI, UsersRelatedNodesI>(
    {
        label: 'User',
        primaryKeyField: 'name',
        schema: {
            name: {
                type: 'string',
                minLength: 1,
                required: true,
            },
            age: {
                type: 'number',
                minimum: 1,
                required: true,
            },
        },
        relationships: {
            LikesMovie: {
                model: Movies,
                direction: 'out',
                name: 'LIKES',
            },
        },
    },
    neogma,
);
