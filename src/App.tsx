import { useState, useEffect, useMemo, useCallback } from "react";
import { QUESTIONS } from "./questions";
import "./App.css";

interface AppState {
  scores: number[];
  average: number;
  curIndex: number;
  answers: Record<string, string>;
  allQuestionsAns: boolean;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    scores: [],
    average: 0,
    curIndex: 0,
    answers: {},
    allQuestionsAns: false,
  });

  // Calculate average using useMemo to avoid recalculation on every render
  const average = useMemo(() => {
    const stored = localStorage.getItem("all-users-scores");
    const storedScores = stored ? JSON.parse(stored) : [];
    const newScores = [
      ...Object.values(storedScores),
      state.scores[state.scores.length - 1],
    ];

    const total = (newScores as number[]).reduce(
      (sum, score) => sum + score,
      0
    );
    return total / newScores.length;
  }, [state.scores]);

  // Update localStorage and calculate the average when all questions are answered
  useEffect(() => {
    if (state.allQuestionsAns) {
      const stored = localStorage.getItem("all-users-scores");
      const storedScores = stored ? JSON.parse(stored) : {};
      const newScore = state.scores[state.scores.length - 1];

      localStorage.setItem(
        "all-users-scores",
        JSON.stringify({ ...storedScores, [Date.now()]: newScore })
      );

      setState((prevState) => ({
        ...prevState,
        average,
      }));
    }
  }, [state.allQuestionsAns, average]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const updatedAnswers: Record<string, string> = {
        ...state.answers,
        [state.curIndex]: answer,
      };

      const numYes = Object.values(updatedAnswers).filter(
        (value) => value === "Yes"
      ).length;
      const score = (numYes / Object.keys(QUESTIONS).length) * 100;

      const nextQuestionIndex = state.curIndex + 1;

      setState((prevState) => ({
        ...prevState,
        answers: updatedAnswers,
        scores: [...prevState.scores, score],
        curIndex:
          nextQuestionIndex < Object.keys(QUESTIONS).length
            ? nextQuestionIndex
            : 0,
        allQuestionsAns: nextQuestionIndex >= Object.keys(QUESTIONS).length,
      }));
    },
    [state.answers, state.curIndex, state.scores]
  );

  const handleRestart = useCallback(() => {
    setState({
      scores: [],
      average: 0,
      curIndex: 0,
      answers: {},
      allQuestionsAns: false,
    });
  }, []);

  return (
    <div className="App">
      <div>
        {!state.allQuestionsAns ? (
          <div>
            <p>{QUESTIONS[state.curIndex + 1]}</p>
            <div className="button-container">
              <button onClick={() => handleAnswer("Yes")}>Yes</button>
              <button onClick={() => handleAnswer("No")}>No</button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Score for this run:</h2>
            <p>{state.scores[state.scores.length - 1]}</p>
            <h2>Overall Average Rating:</h2>
            <p>{state.average}</p>
            <button onClick={handleRestart}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
