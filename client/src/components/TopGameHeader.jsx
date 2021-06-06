// import "../css/topGameHeader.css";
const TopGameHeader = ({ gameId, gameStarted, currentWord }) => {
    return (
        <div className='pt-4 pb-2 px-3 rounded-xl bg-indigo-100'>
            <div className="block">
                {gameId !== undefined
                    ? (<p className="font-sans text-xl">
                        { !gameStarted
                            ? "To start drawing share this room ID with your friend"
                            : "Room id"
                        }
                    : { gameId}
                    </p>
                    )
                    : ("")
                }
            </div>

            {
                currentWord && <div id="current-word">
                    Current word <span style={{ letterSpacing: '5px', paddingLeft: 10 }}>{currentWord}</span>
                </div>}
        </div>
    );
};

export default TopGameHeader;