import { Users } from './models/Users';
import { Movies } from './models/Movies';

// we need to reverse the relationshio configuration after every model has been imported, so they're not undefined. Ideally, this would go to its own file
Movies.addRelationships({
    LikedByUser: Users.reverseRelationshipConfiguration('LikesMovie'),
});

const queryData = async (): Promise<void> => {
    // find a specific user and a specific movie
    const { user: jason, movie: inception } = await Users.findWithMovie(
        'Jason',
        'Inception',
    );

    console.log(`${jason.name} is ${jason.age} years old`);
    console.log(`${inception.name} came out in ${inception.year}`);

    // find the common liked movies between Jason and Barry
    const commonMovieNames = (
        await Users.findCommonLikesMovies('Jason', 'Barry')
    )
        .map((movie) => movie.name)
        .join(', ');

    console.log(
        `Common liked movies between Jason and Barry: ${commonMovieNames}`,
    );

    // find the most liked movie, how many users like it, and their average age
    const {
        movie: mostLikedMovie,
        averageAge,
        totalLikes,
    } = await Movies.findMostLiked();

    console.log(
        `The most liked movie is ${mostLikedMovie.name}, as ${totalLikes} users like it! Their average age is ${averageAge}`,
    );
};

const main = async () => {
    // query the data
    await queryData();
};

main();
