import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { parsePathString, pathToAbsolute, SvgTuple, WH, XY } from './svg-utils';

function getPoints(tuplesAbs: SvgTuple[]): XY[] {
    let rv: XY[] = [];
    let curPos: XY;
    let prevPos: XY = { x: 0, y: 0 };
    tuplesAbs.forEach((tuple: SvgTuple) => {
        let c = tuple[0];
        switch (c) {
            case 'M':
                curPos = { x: tuple[1], y: tuple[2] };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'H':
                curPos = { x: tuple[1], y: prevPos.y };
                rv.push(curPos);
                prevPos = curPos;
                break;
        }
    });
    return rv;
}

function RenderXYs({ xys, ...rest }: { xys: XY[] } & React.SVGAttributes<SVGElement> ) {
    rest = {r: "5", stroke: "red", fill: "tomato", ...rest};
    return (<>
        {xys.map((xy, index) =>
            <circle cx={xy.x} cy={xy.y} {...rest} key={index}>
                <title>{index}: x:{xy.x} y: {xy.y}</title>
            </circle>
        )}
    </>);
}

function SimpleCurve() {
    const path = 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34h10';
    const tuples: SvgTuple[] = parsePathString(path);
    const tuplesAbs = pathToAbsolute(tuples);
    const points: XY[] = getPoints(tuplesAbs);

    console.log('----------------- abs tuples: -----------------', `\n${tuplesAbs.map((tuple => JSON.stringify(tuple))).join('\n')}\n-----------------`);

    return (
        <div className="pt-4 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    <RenderXYs xys={points} />
                    <path d={path} fill="none" stroke="red" />
                </svg>
            </div>

            <div className="ml-8 py-4" >
                <div className="w-72 h-72">
                    <svg className="bg-red-100" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7">
                        {/* <svg className="w-24 max-h-24 bg-indigo-400" viewBox="0 0 33.84 69.68" fill="none" stroke="green"> */}
                        <MarkGrid x={-10} y={-10} stroke="pink" strokeWidth="1" />
                        <path d="M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z" />
                        <path d="M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default SimpleCurve;
