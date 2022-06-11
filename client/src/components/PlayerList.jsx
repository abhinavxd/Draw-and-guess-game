import { Fragment } from "react";
import styles from "../css/playerList.module.css";
const PlayerList = (props) => {
    return (
        <Fragment>
            <div className={styles.playerDataContainer}>
                {props.players.map((player, index) => (
                    <div key={index} className={styles.playerData}>
                        <div>
                            <span>{player.username}</span>
                        </div>
                        <div>
                            Score: <b>{player.score}</b>
                        </div>
                    </div>
                ))}
            </div>
        </Fragment>
    )
};

export default PlayerList;