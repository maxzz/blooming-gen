import React from 'react';
import PropTypes from 'prop-types';
import DebugGrid from './SvgGrid';

type XY = {
    x: number;
    y: number;
}

type WH = { // Width and Height
    w: number;
    h: number;
}

type PathPoint = {
    c: 'M' | 'Q';
    d?: XY[];
}

function makeLines(points: PathPoint[]) {
    const lines: {a: XY, b: XY}[] = [];
    let prev: XY | undefined;
    for (let point of points) {
        if (point.d && point.d.length > 0) {
            prev ? lines.push({a: prev, b: (prev = point.d[0])}) : prev = point.d[0];
            if (point.d.length > 1) {
                lines.push({a: prev, b: (prev = point.d[1])});
                if (point.d.length > 2) {
                    lines.push({a: prev, b: (prev = point.d[2])});
                }
            }
        }
    }
    return lines;
}

type LineMarkersProps = {
    points: PathPoint[];
    [key: string]: any;
};

// type LineMarkersProps = {
//     points: PathPoint[];
// } & React.SVGAttributes<SVGElement>;

function LineMarkers(props: LineMarkersProps) {
    const {points, ...rest} = props;
    const lines = makeLines(points);
    return (
        <>
            {lines.map((line, index) => (
                <line x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y} {...rest} key={index}/>
            ))}
        </>
    );

}

function PointMarkers({points}: {points: PathPoint[]}) {
    return (
        <>
            {points.map((point, index) => {
                return <React.Fragment key={index}> {point.d?.map((xy, indexXY) => (
                    <circle cx={xy.x} cy={xy.y} r={3} fill='red' key={`${index}.${indexXY}`}>
                        <title>{xy.x}, {xy.y}</title>
                    </circle>
                ))} </React.Fragment>
            })}
        </>
    );
}

function makePath(points: PathPoint[]): string {
    return points.map(point => `${point.c} ${point.d?.map(xy => `${xy.x} ${xy.y}`) || ''}`).join(' ');
}

function generateCurvePoints(start: XY, end: XY, steps: number): PathPoint[] {
    let pathPoints: PathPoint[] = [];
    let step: WH = {w: (end.x - start.x) / steps, h: end.y - start.y};
    let prev: XY | undefined;
    pathPoints.push({ c: 'M', d: [(prev = start)] });
    for (let i = 0; i < steps; i++) {
        let a: XY = {x: prev.x + step.w / 2, y: -step.h};
        let b: XY = {x: prev.x + step.w, y: prev.y};
        pathPoints.push({ c: 'Q', d: [a, b] });
        prev = b;
    }
    return pathPoints;
}

function SimpleCurve() {

    let pathPoints = generateCurvePoints({x: -200, y: -100}, {x: 200, y: -150}, 4);
    let controlPoints = makePath(pathPoints);

    return (
        <div className="max-w-md mx-auto bg-indigo-100 h-full">
            <div className="mx-auto w-96 h-96 border border-dotted border-red-800">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <DebugGrid x={-200} y={-200} visible={true}/>
                    <PointMarkers points={pathPoints} />
                    <LineMarkers points={pathPoints} stroke="#ff000080" strokeDasharray="3,3"/>
                    <path d={controlPoints} stroke="black" fill="transparent" />
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
