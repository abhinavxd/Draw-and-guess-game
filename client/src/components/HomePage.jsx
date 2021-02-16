import "../css/homePage.css";
import Header from "./Header";
import { useState } from "react";
import PlayArea from "./PlayArea";

const HomePage = (props) => {
    const [gameStarted, setGameStarted] = useState(false);
    const startGameHandler = () => {
        setGameStarted(true);
    };
    return (
        <div class='container-fluid'>
            <Header />
            {!gameStarted ?
                <div id="menu-container" >
                    <div class='color-white'>
                        <h1>Welcome!</h1>
                    </div>
                    <div>
                        <input placeholder='Enter your name'></input>
                    </div>
                    <br></br>
                    <button type='button' className='btn btn-success' onClick={startGameHandler}>Play</button>
                </div> : <PlayArea />}
        </div>
    );
}

export default HomePage;
