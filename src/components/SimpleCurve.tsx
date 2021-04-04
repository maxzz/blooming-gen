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

type SvgTuple = [string, number?, number?, number?, number?, number?, number?];

function parsePathString(pathString: string) {
    if (!pathString) {
        return null;
    }

    console.log('src', pathString);
    
    let paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0};
    let data: any[] = [];

    const reSpaces = "\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029";
    const rePathCommand = new RegExp(`([a-z])[${reSpaces},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${reSpaces}]*,?[${reSpaces}]*)+)`, "ig");
    const rePathValues = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${reSpaces}]*,?[${reSpaces}]*`, "ig");

    pathString.replace(rePathCommand, 
        function (a: string, b: string, c: string) {
            let params: any[] = [];
            let name = b.toLowerCase() as keyof typeof paramCounts;

            c.replace(rePathValues, function (a: string, b: string) {
                b && params.push(+b);
            } as any);

            if (name == "m" && params.length > 2) {
                data.push([b].concat(params.splice(0, 2)));
                name = "l";
                b = b == "m" ? "l" : "L";
            }

            if (name == "o" && params.length == 1) {
                data.push([b, params[0]]);
            }

            if (name == "r") {
                data.push([b].concat(params));
            } else {
                while (params.length >= paramCounts[name]) {
                    data.push([b].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            }
        } as any
    );

    console.log('data', data);
}

parsePathString("M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34");
/*
source: 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'
data: [Array(3), Array(5), Array(5)]
    0: ["M", 18, 69.48]
    1: ["s", -0.6, -11.27, -3, -30.86]
    2: ["S", 30.43, 0.34, 30.43, 0.34]
*/

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

            <div className="ml-4 py-2" >
                <svg className="w-16 h-16" viewBox="0 0 33.84 69.68" fill="none" stroke="green">
                    <path d="M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z"/>
                    <path d="M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34"/>
                </svg>                
            </div>
        </div>
    );
}

export default SimpleCurve;
