const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let dB = null;

const connectServerAndDb = async () => {
  try {
    dB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Error Ocuured :${error}`);
    process.exit(1);
  }
};
connectServerAndDb();

//API 1
app.get("/movies/", async (request, response) => {
  const getALlMoviesQuiries = `
     select 
     movie_name 
     from movie`;
  let moviesArray = await dB.all(getALlMoviesQuiries);
  const convertServerObject = (objectItem) => {
    return {
      movieName: objectItem.movie_name,
    };
  };

  response.send(
    moviesArray.map((eachObject) => convertServerObject(eachObject))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createPlayerQuery = `insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}');`;
  const createPlayerQueryResponse = await dB.run(createPlayerQuery);
  response.send(`Movie Successfully Added`);
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const requiredMovieQuery = `select * from movie where movie_id=${movieId}`;
  const requireMovieQueryResponse = await dB.get(requiredMovieQuery);
  const convertServerObject = (objectItem) => {
    return {
      movieId: objectItem.movie_id,
      directorId: objectItem.director_id,
      movieName: objectItem.movie_name,
      leadActor: objectItem.lead_actor,
    };
  };
  response.send(convertServerObject(requireMovieQueryResponse));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `update movie set 
  movie_id = ${movieId} , movie_name = '${movieName}' ,lead_actor = '${leadActor}' 
  where movie_id = ${movieId};`;
  await dB.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `delete from movie where movie_id=${movieId}`;
  await dB.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getALlMoviesDirectorQuiries = `
     select 
     *
     from director`;
  let directorArray = await dB.all(getALlMoviesDirectorQuiries);
  const convertServerObject = (objectItem) => {
    return {
      directorId: objectItem.director_id,
      directorName: objectItem.director_name,
    };
  };

  response.send(
    directorArray.map((eachObject) => convertServerObject(eachObject))
  );
});

///API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorsMovieQuery = `select 
  movie_name 
  from movie natural join director
  where director_id=${directorId}`;
  const directorMovieQueryResponse = await dB.all(directorsMovieQuery);
  const convertServerObjectOfMovie = (objectItem) => {
    return {
      movieName: objectItem.movie_name,
    };
  };

  response.send(
    directorMovieQueryResponse.map((eachObject) =>
      convertServerObjectOfMovie(eachObject)
    )
  );
});
module.exports = app;
