import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { PathPoint, pathPointsFromPath, WH, XY } from './svg-utils';

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

    // let pp = pathPointsFromPath("M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34");
    let pp = pathPointsFromPath("M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z");
    console.log('pp: ', pp);
    

    return (
        <div className="pt-8 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    {/* <MarkPathPoints pathPoints={pathPoints} /> */}

                    {/* <MarkLines pathPoints={pathPoints} />
                    <MarkPlaces places={places} stroke="green"/>
                    <MarkPlaces places={ctrlPlaces} stroke="red"/>
                    <path d={linePath} stroke="black" fill="none" /> */}

                    <MarkPathPoints pathPoints={pp} />
                </svg>
            </div>

            <div className="ml-4 py-2" >
                <svg className="w-16 h-16" viewBox="0 0 33.84 69.68" fill="none" stroke="green">
                    <MarkPathPoints pathPoints={pp} />
                    <path d="M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z"/>
                    <path d="M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34"/>
                </svg>                
            </div>
        </div>
    );
}

export default SimpleCurve;
