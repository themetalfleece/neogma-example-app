import * as uuid from 'uuid';

import { neogma } from '../init/neogma';

import { Users } from '../models/Users';
import { Movies } from '../models/Movies';

(async () => {
    // remove all existing nodes and relationships in the database
    await neogma.queryRunner.run('match (n) detach delete n');

    // create a single node
    await Users.createOne({
        id: uuid.v4(),
        name: 'Barry',
        age: 36,
    });

    // create nodes in bulk
    await Movies.createMany([
        {
            id: uuid.v4(),
            name: 'The Dark Knight',
            year: 2008,
        },
        {
            id: uuid.v4(),
            name: 'Inception',
            year: 2010,
        },
    ]);

    // build an instance
    const cynthia = Users.build({
        id: uuid.v4(),
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
        id: uuid.v4(),
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
                    id: uuid.v4(),
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

    process.exit(0);
})();
