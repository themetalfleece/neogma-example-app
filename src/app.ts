import { Neogma, QueryBuilder, QueryRunner } from 'neogma';
export const neogma = new Neogma(
    {
        url: 'bolt://localhost:7687',
        username: 'neo4j',
        password: 'neo4j',
    },
    {
        logger: console.log,
        encrypted: false,
    },
);

import { Users, UsersPropertiesI } from './models/Users';
import { Movies, MoviesPropertiesI } from './models/Movies';

const populateData = async (): Promise<void> => {
    // remove all existing nodes and relationships in the database
    await neogma.queryRunner.run('match (n) detach delete n');

    // create a single node
    await Users.createOne({
        name: 'Barry',
        age: 36,
    });

    // create nodes in bulk
    await Movies.createMany([
        {
            name: 'The Dark Knight',
            year: 2008,
        },
        {
            name: 'Inception',
            year: 2010,
        },
    ]);

    // build an instance
    const cynthia = Users.build({
        name: 'Cynthia',
        age: 21,
    });
    // save it to the database
    await cynthia.save();
    // relate this instance to a movie
    await cynthia.relateTo({
        // the alias to use for the relationship information
        alias: 'LikesMovie',
        where: {
            // the name of the movie
            name: 'Inception',
        },
    });

    /**
     * the following performs the following:
     * 1) Create a User node
     * 2) Relates that node to an existing movie (The Dark Knight), via a where parameter
     * 3) Creates a new movie (Interstellar) with the given properties, and relates the User with it
     * All these happen in a single operation
     */
    await Users.createOne({
        name: 'Jason',
        age: 26,
        // the alias to use for the relationship information
        LikesMovie: {
            // where parameters for relating it with an existing mode
            where: {
                params: {
                    name: 'The Dark Knight',
                },
            },
            // properties for creating the new node
            properties: [
                {
                    name: 'Interstellar',
                    year: 2014,
                },
            ],
        },
    });

    // find a user. This is also an instance like the ones above
    const barry = await Users.findOne({
        where: {
            name: 'Barry',
        },
    });

    // if we don't perform this check, TypeScript will throw an error, since findOne can return null if the node is not found
    if (barry) {
        // we have access to the instance's properties like this
        console.log(`Barry's age is ${barry.age}`);
        // let's change Barry's age
        barry.age = 37;
        // save the change to the database. Since the node already exists, it will just be updated
        await barry.save();

        // let's have Barry like every movie!
        await barry.relateTo({
            alias: 'LikesMovie',
            where: {},
        });
    }

    // finally, let's make Cynthia like Interstellar
    await cynthia.relateTo({
        alias: 'LikesMovie',
        where: {
            name: 'Interstellar',
        },
    });
};

const queryData = async (): Promise<void> => {
    // find a specific user and a specific movie
    const specificUserAndMovieResult = await new QueryBuilder()
        .match({
            model: Users,
            where: {
                name: 'Jason',
            },
            identifier: 'user',
        })
        .match({
            model: Movies,
            where: {
                name: 'Inception',
            },
            identifier: 'movie',
        })
        .return(['user', 'movie'])
        .run(neogma.queryRunner);

    const jason = QueryRunner.getResultProperties<UsersPropertiesI>(
        specificUserAndMovieResult,
        'user',
    )[0];
    const inception = QueryRunner.getResultProperties<MoviesPropertiesI>(
        specificUserAndMovieResult,
        'movie',
    )[0];

    console.log(`${jason.name} is ${jason.age} years old`);
    console.log(`${inception.name} came out in ${inception.year}`);

    // find the common liked movies between Jason and Barry
    const commonMoviesBetweenJasonAndBarryResult = await new QueryBuilder()
        .match({
            related: [
                {
                    model: Users,
                    where: {
                        name: 'Jason',
                    },
                },
                Users.getRelationshipByAlias('LikesMovie'),
                {
                    model: Movies,
                    identifier: 'movie',
                },
                {
                    direction: 'in',
                },
                {
                    model: Users,
                    where: {
                        name: 'Barry',
                    },
                },
            ],
        })
        .return('movie')
        .run(neogma.queryRunner);

    const commonMovieNames = QueryRunner.getResultProperties<MoviesPropertiesI>(
        commonMoviesBetweenJasonAndBarryResult,
        'movie',
    )
        .map((result) => result.name)
        .join(', ');

    console.log(
        `Common liked movies between Jason and Barry: ${commonMovieNames}`,
    );

    // find the most liked movie, how many users like it, and their average age
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
    const totalLikes = mostLikedMovieResult.records[0].get('totalLikes');
    const averageAge = mostLikedMovieResult.records[0].get('averageAge');
    console.log(
        `The most liked movie is ${movie.name}, as ${totalLikes} users like it! Their average age is ${averageAge}`,
    );
};

const main = async () => {
    // populate the data
    await populateData();
    // query the data
    await queryData();
};

main();
