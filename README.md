# This is an example application which uses [Neogma](https://github.com/themetalfleece/neogma), a Neo4j OGM for Node.js build with TypeScript

It's a simple application which demonstrates Neogma by creating Users, Movies, and relationships between them.

It then queries the database to find common liked movies between users, and the most liked movie.

## Install

1. Install [node.js](https://nodejs.org/en/download/), [yarn](https://classic.yarnpkg.com/en/docs/install/), [neo4j](https://neo4j.com/download/).
2. Clone this repository, and using a terminal navigate to its directory.
3. Run `yarn` to install the dependencies.

## Build & Run

1. Copy the contents of the `.env.example` file to a `.env` next to it, and edit it with your values.
2. Run `yarn build` to build the files.
3. Run `yarn start` to start the application.

-   You can run `yarn dev` to combine the 2 steps above, while listening to changes and restarting automatically.
    -   You need to run `yarn global add ts-node nodemon` once for this to run.

## Populate data

1. Run `yarn build` to build the files.
2. Run `yarn populate`
