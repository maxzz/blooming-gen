import React, { useState } from 'react';
import './App.css';

function App() {
    const point1 = {
        x: 0,
        y: 0,
    };
    const point2 = {
        x: 180,
        y: 0,
    };
    const pointc = {
        x: 100,
        y: -180,
    };
    const radius = 3;
    return (
        <div className="App h-screen bg-gray-100">
            <div className="max-w-md mx-auto bg-indigo-100 h-full">
                <div className="w-96 h-96 border border-dotted border-red-800">
                    <svg className="" viewBox="-200 -200 400 400">

                        <circle cx={point1.x} cy={point1.y} r={radius} fill='red' />
                        <circle cx={point2.x} cy={point2.y} r={radius} fill='#2000ff' />
                        <circle cx={pointc.x} cy={pointc.y} r={radius} fill='#0020ff' />

                        <line x={point1.x} y={point1.y} x1={pointc.x} y1={pointc.y} stroke="red" />
                        {/* <line x={pointc.x} y={pointc.y} x1={point2.x} y1={point2.y} stroke="red" /> */}

                        <path d={`M ${point1.x} ${point1.y} Q ${pointc.x} ${pointc.y} ${point2.x} ${point2.y}`} stroke="black" fill="transparent"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default App;
