import { Fragment } from "react";
// import "../css/playerList.css";
const PlayerList = (props) => {
    return (
        <Fragment>
            <div className='player-data-container'>
                {props.players.map((player, index) => (
                    <div key={index} className='player-data'>
                        <div>
                            <b>{player.username}</b>
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