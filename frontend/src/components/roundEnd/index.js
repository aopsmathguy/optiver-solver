import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    selectGame, selectId
} from "../../store/slices/figure-it-out";
import Figure from "../figure";
import { sendSetGameProperties, sendStartRound } from "../../ws";
function RoundEnd(){
    const dispatch = useDispatch();
    const game = useSelector(selectGame);
    const id = useSelector(selectId);
    const properties = game.gameProperties;
    const [localProperties, setLocalProperties] = React.useState(JSON.stringify(properties, null, 2));
    if (!game || !game.code) return null;
    function saveProperties(){
        sendSetGameProperties(JSON.parse(localProperties));
    }
    function startRound(){
        sendStartRound();
    }
    const isHost = game.host_id === id;
    const playerStats = game.players;
    const scoresSorted = Object.values(playerStats).sort((a, b) => b.score - a.score);
    const totalScoresSorted = Object.values(playerStats).sort((a, b) => b.totalScore - a.totalScore);

    if (game.roundInfo.currRound){
        return <div>
            {isHost && <button onClick={startRound}>Next</button>}
            <h1>Round {game.currRound} Over</h1>
            <h2>Round Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {scoresSorted.map(({name, score}, i) => <tr key={i}>
                        <td>{name}</td>
                        <td>{score}</td>
                    </tr>)}
                </tbody>
            </table>
            <h2>Total Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Total Score</th>
                    </tr>
                </thead>
                <tbody>
                    {totalScoresSorted.map(({name, totalScore}, i) => <tr key={i}>
                        <td>{name}</td>
                        <td>{totalScore}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    } else{
        return <div>
            {isHost && <button onClick={startRound}>New Game</button>}
            <h2>Total Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Total Score</th>
                    </tr>
                </thead>
                <tbody>
                    {totalScoresSorted.map(({name, totalScore}, i) => <tr key={i}>
                        <td>{name}</td>
                        <td>{totalScore}</td>
                    </tr>)}
                </tbody>
            </table>
            <h2>Change Properties</h2>
            <textarea value={localProperties} onChange={(e) => setLocalProperties(e.target.value)}></textarea>
            <button onClick={saveProperties}>Save</button>
        </div>
    }
}
export default RoundEnd;