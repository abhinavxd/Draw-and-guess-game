import { useState } from "react";
import HomePage from './components/HomePage';
import "./App.css";
import PlayArea from "./components/PlayArea";
function App() {
  const [gameStarted, setGameStarted] = useState(false);
  return (
    <div className="App">
      {!gameStarted ? <HomePage setGameStarted={setGameStarted}></HomePage> : <PlayArea></PlayArea>}
    </div>
  );
}

export default App;
