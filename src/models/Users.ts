/* eslint-disable @typescript-eslint/no-empty-interface */
import { neogma } from '../init/neogma';

import * as uuid from 'uuid';
import {
    ModelFactory,
    NeogmaInstance,
    ModelRelatedNodesI,
    QueryRunner,
    QueryBuilder,
} from 'neogma';
import { Movies, MoviesInstance, MoviesPropertiesI } from './Movies';

export type UsersPropertiesI = {
    id: string;
    name: string;
    age: number;
};

export interface UsersRelatedNodesI {
    LikesMovie: ModelRelatedNodesI<typeof Movies, MoviesInstance>;
}

export interface UserStaticsI {
    findCommonLikesMovies: (
        userName1: string,
        userName2: string,
    ) => Promise<MoviesPropertiesI[]>;
    findWithMovie: (
        userName: string,
        movieName: string,
    ) => Promise<{
        user: UsersPropertiesI;
        movie: MoviesPropertiesI;
    }>;
}

export type UsersInstance = NeogmaInstance<
    UsersPropertiesI,
    UsersRelatedNodesI
>;

export const Users = ModelFactory<
    UsersPropertiesI,
    UsersRelatedNodesI,
    UserStaticsI
>(
    {
        label: 'User',
        primaryKeyField: 'id',
        schema: {
            id: {
                type: 'string',
                minLength: 1,
                required: true,
                conform: (v) => uuid.validate(v),
            },
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

Users.findCommonLikesMovies = async (userName1, userName2) => {
    const commonMoviesBetweenJasonAndBarryResult = await new QueryBuilder()
        .match({
            related: [
                {
                    model: Users,
                    where: {
                        name: userName1,
                    },
                },
                Users.getRelationshipByAlias('LikesMovie'),
                {
                    model: Movies,
                    identifier: 'movie',
                },
                Movies.getRelationshipByAlias('LikedByUser'),
                {
                    model: Users,
                    where: {
                        name: userName2,
                    },
                },
            ],
        })
        .return('movie')
        .run(neogma.queryRunner);

    return QueryRunner.getResultProperties<MoviesPropertiesI>(
        commonMoviesBetweenJasonAndBarryResult,
        'movie',
    );
};

Users.findWithMovie = async (userName, movieName) => {
    const specificUserAndMovieResult = await new QueryBuilder()
        .match({
            model: Users,
            where: {
                name: userName,
            },
            identifier: 'user',
        })
        .match({
            model: Movies,
            where: {
                name: movieName,
            },
            identifier: 'movie',
        })
        .return(['user', 'movie'])
        .run(neogma.queryRunner);

    const user = QueryRunner.getResultProperties<UsersPropertiesI>(
        specificUserAndMovieResult,
        'user',
    )[0];
    const movie = QueryRunner.getResultProperties<MoviesPropertiesI>(
        specificUserAndMovieResult,
        'movie',
    )[0];

    return { user, movie };
};
