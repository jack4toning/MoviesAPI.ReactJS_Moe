// const fs = require('fs');

const movieIds = [];
const movies = [];
const promisesForId = [];
const promisesForMovie = [];

const postUrlFrag = 'https://image.tmdb.org/t/p/w500';
const urlForId =
  'https://api.themoviedb.org/3/discover/movie?api_key=f069dfdab198b286aa8b07e42ed90c2a&sort_by=vote_average.desc&page=';

const urlForMovie = 'https://api.themoviedb.org/3/movie/';
const API_KEY = 'api_key=f069dfdab198b286aa8b07e42ed90c2a';

for (let i = 1; i < 1; i++) {
  const promise = new Promise((res, rej) => {
    fetch(`${urlForId}${i}`)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.forEach(movie => {
          movieIds.push(movie.id);
        });
        res();
      })
      .catch(() => {
        rej();
      });
  });

  promisesForId.push(promise);
}

console.log(promisesForId);

Promise.allSettled(promisesForId).then(() => {
  movieIds.forEach(id => {
    const promise = new Promise((res, rej) => {
      console.log(id);
      fetch(`${urlForMovie}${id}?${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          console.log(data);
          movies.push(data);
          return res();
        })
        .catch(() => {
          rej();
        });
    });

    promisesForMovie.push(promise);
  });
});

Promise.allSettled(promisesForMovie)
  .then(() => {
    return movies.map(movie => transformMovie(movie));
  })
  .then(transformedMovies => {
    // fs.writeFile(
    //   './testMovies.json',
    //   JSON.stringify(transformedMovies),
    //   err => {
    //     if (err) {
    //       return console.log('write failed... ' + err.message);
    //     }
    //     console.log('write succeeded');
    //   }
    // );
    console.log(transformedMovies);
  });

const transformMovie = movie => {
  const {
    id,
    title,
    tagline,
    vote_average,
    vote_count,
    release_date,
    poster_path,
    overview,
    budget,
    revenue,
    genres,
    runtime,
  } = movie;

  return {
    id,
    title,
    tagline,
    vote_average,
    vote_count,
    release_date,
    poster_path: postUrlFrag + poster_path,
    overview,
    budget,
    revenue,
    genres: genres.map(item => item.name),
    runtime,
  };
};
