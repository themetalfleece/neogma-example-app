/* eslint-disable @typescript-eslint/no-empty-interface */
import { neogma } from '../init/neogma';

import * as uuid from 'uuid';
import {
    ModelFactory,
    ModelRelatedNodesI,
    NeogmaInstance,
    QueryBuilder,
    QueryRunner,
} from 'neogma';
import { Users, UsersInstance } from './Users';

export type MoviesPropertiesI = {
    id: string;
    name: string;
    year: number;
};

export interface MoviesRelatedNodesI {
    LikedByUser: ModelRelatedNodesI<typeof Users, UsersInstance>;
}

export interface MoviesStaticsI {
    findMostLiked: () => Promise<{
        movie: MoviesPropertiesI;
        totalLikes: number;
        averageAge: number;
    }>;
}

export type MoviesInstance = NeogmaInstance<
    MoviesPropertiesI,
    MoviesRelatedNodesI
>;

export const Movies = ModelFactory<
    MoviesPropertiesI,
    MoviesRelatedNodesI,
    MoviesStaticsI
>(
    {
        label: 'Movie',
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
            year: {
                type: 'number',
                minimum: 1900,
                required: true,
            },
        },
    },
    neogma,
);

Movies.findMostLiked = async () => {
    const mostLikedMovieResult = await new QueryBuilder()
        .match({
            related: [
                {
                    model: Users,
                    identifier: 'user',
                },
                {
                    ...Users.getRelationshipByAlias('LikesMovie'),
                    identifier: 'likesMovie',
                },
                {
                    model: Movies,
                    identifier: 'movie',
                },
            ],
        })
        .return([
            'movie',
            'count (likesMovie) as totalLikes',
            'avg(user.age) as averageAge',
        ])
        .orderBy([['totalLikes', 'DESC']])
        .run(neogma.queryRunner);

    const movie = QueryRunner.getResultProperties<MoviesPropertiesI>(
        mostLikedMovieResult,
        'movie',
    )[0];
    const totalLikes = +mostLikedMovieResult.records[0].get('totalLikes');
    const averageAge = +mostLikedMovieResult.records[0].get('averageAge');

    return {
        movie,
        totalLikes,
        averageAge,
    };
};
