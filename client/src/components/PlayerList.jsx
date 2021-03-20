import { Fragment } from "react";
import "../css/playerList.css";
const PlayerList = (props) => {
    return (
        <Fragment>
            <div className='player'>
                {props.players.map((player, index) => (
                    <Fragment key={index}>
                        <div>
                            {player.username}
                        </div>
                        <div>
                            Score: {player.score}
                        </div>
                    </Fragment>
                ))}
            </div>
        </Fragment>
    )
};

export default PlayerList;