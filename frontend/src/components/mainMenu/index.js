import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectId, setScreen } from '../../store/slices/figure-it-out';
import { sendJoin } from '../../ws';
const MainMenu = () => {
    const dispatch = useDispatch();
    const id = useSelector(selectId);
    const [username, setUsername] = useState('');

    const handlePlayClick = () => {
        sendJoin({
            id : id,
            name : username
        });
        dispatch(setScreen('gameList'));
    };
    return (
        <div>
            <h1>Figure It Out!</h1>
            <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handlePlayClick}>Play</button>
        </div>
    );
};

export default MainMenu;