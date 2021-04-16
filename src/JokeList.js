import React, { Component, useCallback, useEffect, useState } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";
import useToggle from "./useToggle";

/** List of jokes. */
function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, toggleIsLoading] = useToggle();

  useEffect(() => {
    getJokes();
  }, []);

  async function getJokes() {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let getJokes = [];
      let seenJokes = new Set();

      while (getJokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          getJokes.push({ ...joke, votes: 0});
        } else {
          console.log("duplicate found!");
        }
      }
      setJokes(getJokes);
      toggleIsLoading();
    } catch (err) {
      console.error(err);
    }
  }
  function generateNewJokes() {
    toggleIsLoading();
    getJokes();
  }

  function vote(id, delta) {
    setJokes(jokes => {
      return jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
        .sort((a, b) => b.votes - a.votes);
  });
}

if (isLoading) {
  return (
    <div className="loading">
      <i className="fas fa-4x fa-spinner fa-spin" />
    </div>
  );
}
return (
  <div className="JokeList">
    <button
      className="JokeList-getmore"
      onClick={generateNewJokes}
    >
      Get New Jokes
        </button>

    {jokes.map(j => (
      <Joke
        text={j.joke}
        key={j.id}
        id={j.id}
        votes={j.votes}
        vote={vote}
      />
    ))}
  </div>
);
}

export default JokeList;
