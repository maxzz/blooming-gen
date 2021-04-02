import React from 'react';
import PropTypes from 'prop-types';
import SvgGrid from './SvgGrid';

type PathPoint = {
    c: string;
    d?: { x: number; y: number; }[];
};

function SimpleCurve() {
    const radius = 3;
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

    let pathPoints: PathPoint[] = [
        { c: 'M', d: [{ x: 0, y: 0 },] },
        { c: 'Q', d: [{ x: 100, y: -180 }, { x: 180, y: 0 },] },
    ];
    function makePath(points: PathPoint[]) {
        return points.map(point => `${point.c} ${point.d?.map(xy => `${xy.x} ${xy.y}`) || ''}`).join(' ');
    }

    return (
        <div className="max-w-md mx-auto bg-indigo-100 h-full">
            <div className="w-96 h-96 border border-dotted border-red-800">
                <svg className="bg-red-300" viewBox="-200 -200 400 400">
                    <SvgGrid x={-200} y={-200}/>

                    <circle cx={point1.x} cy={point1.y} r={radius} fill='red' />
                    <circle cx={point2.x} cy={point2.y} r={radius} fill='blue' />
                    <circle cx={pointc.x} cy={pointc.y} r={radius} fill='lime' />

                    <line x1={point1.x} y1={point1.y} x2={pointc.x} y2={pointc.y} stroke="red" />
                    <line x1={pointc.x} y1={pointc.y} x2={point2.x} y2={point2.y} stroke="blue" />

                    {/* <path d={`M ${point1.x} ${point1.y} Q ${pointc.x} ${pointc.y} ${point2.x} ${point2.y}`} stroke="black" fill="transparent" /> */}
                    <path d={`${makePath(pathPoints)}`} stroke="black" fill="transparent" />
                </svg>
            </div>
            <svg viewBox="0 0 1366 768" fill="none" stroke="green">
                <path className="st0" d="M42 85s16-10 16-21-4-16-6-25 3-24 3-24L38 28c-6 6-13 12-13 24-1 11 17 33 17 33z" />
                <path className="st0" d="M42 85s0-12-3-31c-2-20 16-39 16-39" />
            </svg>
        </div>
    );
}

export default SimpleCurve;
