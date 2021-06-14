import { useState } from "react";
import HomePage from './components/HomePage';
// import "./App.css";
function App() {
  return (
    <div className="App">
      <HomePage />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#6e71fa" fill-opacity="1" d="M0,224L26.7,218.7C53.3,213,107,203,160,176C213.3,149,267,107,320,117.3C373.3,128,427,192,480,202.7C533.3,213,587,171,640,133.3C693.3,96,747,64,800,69.3C853.3,75,907,117,960,117.3C1013.3,117,1067,75,1120,96C1173.3,117,1227,203,1280,224C1333.3,245,1387,203,1413,181.3L1440,160L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"></path>
      </svg>    
    </div>
  );
}

export default App;
