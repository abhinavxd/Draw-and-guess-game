import styles from "../css/topGameHeader.module.css";
const TopGameHeader = ({ gameId, gameStarted, currentWord }) => {
    return (
        <div className={styles.topGameBar}>
            <div>{gameId !== undefined ? (<div>{!gameStarted ? "To start drawing share this URL with your friend" : "Room URL"} : <a href={`${process.env.REACT_APP_DOMAIN}/${gameId}`}>{process.env.REACT_APP_DOMAIN}/{gameId}</a></div>) : ("")} </div>
            {currentWord && <div>
                Current word <span style={{ letterSpacing: '5px', paddingLeft: 10 }}>{currentWord}</span>
            </div>}
        </div>
    );
};

export default TopGameHeader;