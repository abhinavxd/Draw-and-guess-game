import "../css/topGameHeader.css";
const TopGameHeader = (props) => {
    return (
        <div className='top-bar-game'>
            <div>{props.gameId !== undefined ? (<div>Your room id is {props.gameId}</div>) : ("")} </div>
            <div id="current-word">
                {props.currentWord}
            </div>
        </div>
    );
};

export default TopGameHeader;