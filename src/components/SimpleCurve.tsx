import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';

type XY = {
    x: number;
    y: number;
};

type WH = { // Width and Height
    w: number;
    h: number;
};

type PathPoint = {
    c: 'M' | 'Q';
    d?: XY[];
};

namespace PathPoints {
    export function toLines(points: PathPoint[]): { a: XY, b: XY; }[] {
        const lines: { a: XY, b: XY; }[] = [];
        let prev: XY | undefined;
        for (let point of points) {
            if (point.d && point.d.length > 0) {
                prev ? lines.push({ a: prev, b: (prev = point.d[0]) }) : prev = point.d[0];
                if (point.d.length > 1) {
                    lines.push({ a: prev, b: (prev = point.d[1]) });
                    if (point.d.length > 2) {
                        lines.push({ a: prev, b: (prev = point.d[2]) });
                    }
                }
            }
        }
        return lines;
    }

    function nonNullish<T>(value: T): value is NonNullable<T> {
        return Boolean(value);
    }

    export function getPoints(pathPoints: PathPoint[]): XY[] {
        return pathPoints.map(point => {
            return point.d && (point.d.length === 1 ? point.d[0] : point.d[point.d.length - 1]);
        }).filter(nonNullish);
    }

    export function getControlPoints(pathPoints: PathPoint[]): XY[] {
        return pathPoints.reduce<XY[]>((acc, cur) => {
            cur.d && cur.d.length > 1 && acc.push(...cur.d.slice(0, cur.d.length - 1));
            return acc;
        }, []);
    }

    export function toSvgPath(points: PathPoint[]): string {
        return points.map(point => `${point.c} ${point.d?.map(xy => `${xy.x} ${xy.y}`) || ''}`).join(' ');
    }

    export function generateCurve({ start, end, steps }: { start: XY, end: XY, steps: number; }): PathPoint[] {
        let pathPoints: PathPoint[] = [];
        let step: WH = { w: (end.x - start.x) / steps, h: end.y - start.y };
        let prev: XY | undefined;
        pathPoints.push({ c: 'M', d: [(prev = start)] });
        for (let i = 0; i < steps; i++) {
            let a: XY = { x: prev.x + step.w / 2, y: -step.h };
            let b: XY = { x: prev.x + step.w, y: prev.y };
            pathPoints.push({ c: 'Q', d: [a, b] });
            prev = b;
        }
        return pathPoints;
    }
} //namespace PathPoints

function MarkLines({ pathPoints, ...rest }: { pathPoints: PathPoint[]; } & React.SVGAttributes<SVGElement>) {
    rest = { stroke: "#ff000080", strokeDasharray: "3,3", ...rest };
    const lines = PathPoints.toLines(pathPoints);
    return (<>
        {lines.map((line, index) =>
            <line x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y} {...rest} key={index} />
        )}
    </>);
}

function MarkPlaces({ places, ...rest }: { places: XY[]; } & React.SVGAttributes<SVGElement>) {
    rest = { fill: "none", stroke: "red", r: 3, ...rest };
    return (<>
        {places.map((xy, index) =>
            <circle cx={xy.x} cy={xy.y} {...rest} key={index}>
                <title>{xy.x}, {xy.y}</title>
            </circle>
        )}
    </>);
}

function MarkPathPoints({ pathPoints, ...rest }: { pathPoints: PathPoint[]; } & React.SVGAttributes<SVGElement>) {
    rest = { fill: "none", stroke: "red", r: 3, ...rest };
    return (<>
        {pathPoints.map((point, index) => {
            return <React.Fragment key={index}>
                {point.d?.map((xy, indexXY) =>
                    <circle cx={xy.x} cy={xy.y} {...rest} key={`${index}.${indexXY}`}>
                        <title>{xy.x}, {xy.y}</title>
                    </circle>
                )}
            </React.Fragment>;
        })}
    </>);
}

function SimpleCurve() {

    let pathPoints: PathPoint[] = PathPoints.generateCurve({ start: { x: -200, y: -100 }, end: { x: 200, y: -150 }, steps: 4 });
    let linePath = PathPoints.toSvgPath(pathPoints);
    let places = PathPoints.getPoints(pathPoints);
    let ctrlPlaces = PathPoints.getControlPoints(pathPoints);

    return (
        <div className="pt-8 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    {/* <MarkPathPoints pathPoints={pathPoints} /> */}
                    <MarkLines pathPoints={pathPoints} />

                    <MarkPlaces places={places} stroke="green"/>
                    <MarkPlaces places={ctrlPlaces} stroke="red"/>

                    <path d={linePath} stroke="black" fill="none" />
                </svg>
            </div>

            <svg className="mx-6 my-2" viewBox="0 0 1366 768" fill="none" stroke="green">
                <path className="st0" d="M42 85s16-10 16-21-4-16-6-25 3-24 3-24L38 28c-6 6-13 12-13 24-1 11 17 33 17 33z" />
                <path className="st0" d="M42 85s0-12-3-31c-2-20 16-39 16-39" />
            </svg>
        </div>
    );
}

export default SimpleCurve;
