import styles from "../css/topGameHeader.module.css";
const TopGameHeader = ({ gameId, gameStarted, currentWord }) => {
    return (
        <div className={styles.topGameBar}>
            <div>{gameId !== undefined ? (<div>{!gameStarted ? "To start drawing share this room ID with your friend" : "Room id"} : {gameId}</div>) : ("")} </div>
            {currentWord && <div id="current-word">
                Current word <span style={{ letterSpacing: '5px', paddingLeft: 10 }}>{currentWord}</span>
            </div>}
        </div>
    );
};

export default TopGameHeader;