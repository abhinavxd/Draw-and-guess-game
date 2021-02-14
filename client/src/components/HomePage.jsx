const HomePage = (props) => {
    const startGameHandler = () => {
        props.setGameStarted(true);
    };
    return (
        <div>
            <h1>Welcome to glowing meme</h1>
            <div>
                <input placeholder='Enter your name'></input>
            </div>
            <br></br>
            <div>
                <button onClick={startGameHandler}>Play</button>
            </div>
        </div>
    );
}

export default HomePage;
