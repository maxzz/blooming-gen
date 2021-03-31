import React from 'react';
import PropTypes from 'prop-types';

function SimpleCurve() {
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
        <div className="max-w-md mx-auto bg-indigo-100 h-full">
            <div className="w-96 h-96 border border-dotted border-red-800">
                <svg className="" viewBox="-200 -200 400 400">

                    <circle cx={point1.x} cy={point1.y} r={radius} fill='red' />
                    <circle cx={point2.x} cy={point2.y} r={radius} fill='blue' />
                    <circle cx={pointc.x} cy={pointc.y} r={radius} fill='lime' />

                    <line x1={point1.x} y1={point1.y} x2={pointc.x} y2={pointc.y} stroke="red" />
                    <line x1={pointc.x} y1={pointc.y} x2={point2.x} y2={point2.y} stroke="blue" />

                    <path d={`M ${point1.x} ${point1.y} Q ${pointc.x} ${pointc.y} ${point2.x} ${point2.y}`} stroke="black" fill="transparent" />
                </svg>
            </div>
        </div>
    );
}

export default SimpleCurve;

