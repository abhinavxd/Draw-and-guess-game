import "../css/topGameHeader.css";
const TopGameHeader = ({ gameId, setStartTimer, startTimer, currentWord }) => {
    return (
        <div className='top-bar-game'>
            <div>{gameId !== undefined ? (<div>Room id: {gameId}</div>) : ("")} </div>
            {currentWord && <div id="current-word">
                Current word <span style={{ letterSpacing: '5px', paddingLeft: 10 }}>{currentWord}</span>
            </div>}
        </div>
    );
};

export default TopGameHeader;