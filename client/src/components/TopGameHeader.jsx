import "../css/topGameHeader.css";
const TopGameHeader = ({ gameId, setStartTimer, startTimer, currentWord }) => {
    return (
        <div className='top-bar-game'>
            <div>{gameId !== undefined ? (<div>Your room id is {gameId}</div>) : ("")} </div>
            <div id="current-word">
                {currentWord}
            </div>
        </div>
    );
};

export default TopGameHeader;