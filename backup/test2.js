const fs = require('fs');
const fetch = require('node-fetch');

const movieIds = [];
const movies = [];
const promisesForId = [];
const promisesForMovie = [];

const postUrlFrag = 'https://image.tmdb.org/t/p/w500';
const urlForId =
  'https://api.themoviedb.org/3/discover/movie?api_key=f069dfdab198b286aa8b07e42ed90c2a&sort_by=vote_average.desc&page=';

const urlForMovie = 'https://api.themoviedb.org/3/movie/';
const API_KEY = 'api_key=f069dfdab198b286aa8b07e42ed90c2a';

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

const runTask = async () => {
  for (let i = 1; i < 2; i++) {
    const promise = new Promise(async (res, rej) => {
      try {
        const response = await fetch(`${urlForId}${i}`);
        const data = await response.json();

        data.results.forEach(movie => {
          movieIds.push(movie.id);
        });

        res();
      } catch (error) {
        rej(error);
      }
    });

    promisesForId.push(promise);
  }

  await Promise.allSettled(promisesForId);
  await new Promise((resolve, rej) => {
    console.log(movieIds);
    movieIds.forEach(id => {
      const promise = new Promise(async (res, rej) => {
        try {
          const response = await fetch(`${urlForMovie}${id}?${API_KEY}`);
          const data = await response.json();
          movies.push(data);
          res();
        } catch (error) {
          rej(error);
        }
      });

      promisesForMovie.push(promise);
    });
    resolve();
  });
  await Promise.allSettled(promisesForMovie);

  const transformedMovies = movies.map(movie => transformMovie(movie));

  fs.writeFile('./testMovies.json', JSON.stringify(transformedMovies), err => {
    if (err) {
      return console.log('write failed... ' + err.message);
    }
    console.log('write succeeded');
  });
};

runTask();
