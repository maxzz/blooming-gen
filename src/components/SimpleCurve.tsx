import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { CXY, getPoints, parsePathString, pathToAbsolute, printCXYs, printTuples, SvgTuple, WH, XY } from './svg-utils';

export function getControlPoints(tuplesAbs: SvgTuple[]): CXY[] {
    let rv: CXY[] = [];
    let prevPos: XY = { x: 0, y: 0 };
    let prevTuple: SvgTuple;
    tuplesAbs.forEach((tuple: SvgTuple, index: number) => {
        let c = tuple[0];
        let curPos: XY;
        switch (c) { // abs path has only uppercase commands
            case 'M':
            case 'L':
                prevPos = { x: tuple[1], y: tuple[2] };
                break;
            case 'H':
                prevPos = { x: tuple[1], y: prevPos.y };
                break;
            case 'V':
                prevPos = { x: prevPos.x, y: tuple[1] };
                break;
            case 'C':
                curPos = { x: tuple[5], y: tuple[6] };
                rv.push({ i: index, n: c, p: curPos, c: { x: tuple[1], y: tuple[2] } });
                rv.push({ i: index, n: c, p: curPos, c: { x: tuple[3], y: tuple[4] } });
                prevPos = curPos;
                break;
            case 'S': {
                curPos = { x: tuple[3], y: tuple[4] };
                switch (prevTuple[0]) {
                    case 'C':
                    case 'S':
                        let ofs = prevTuple[0] === 'C' ? 3 : 1;
                        let prevCtrl: XY = { x: prevPos.x - (prevTuple[ofs] - prevTuple[ofs+2]), y: prevPos.y - (prevTuple[ofs+1] - prevTuple[ofs+3]) }; // reflection
                        rv.push({ i: index, n: c, p: prevPos, c: prevCtrl });
                        break;
                }
                rv.push({ i: index, n: c, p: curPos, c: { x: tuple[1], y: tuple[2] } });
                prevPos = curPos;
                break;
            }
            case 'Q':
                curPos = { x: tuple[3], y: tuple[4] };
                rv.push({ i: index, n: c, p: { x: prevPos.x, y: prevPos.y }, c: { x: tuple[1], y: tuple[2] } });
                rv.push({ i: index, n: c, p: curPos, c: { x: tuple[1], y: tuple[2] } });
                prevPos = curPos;
                break;
            case 'T': {
                let prevCtrl: XY;
                switch (prevTuple[0]) {
                    case 'C':
                    case 'S':
                        prevCtrl = { x: prevTuple[3], y: prevTuple[4] }; // TODO: reflection
                        break;
                    case 'Q':
                        prevCtrl = { x: prevTuple[1], y: prevTuple[2] }; // TODO: reflection
                        break;
                    default:
                        prevCtrl = prevPos;
                }
                curPos = { x: tuple[1], y: tuple[2] };
                rv.push({ i: index, n: c, p: curPos, c: prevCtrl });
                prevPos = curPos;
                break;
            }
            case 'A':
                //rv.push({ i: index, x: tuple[1], y: tuple[2] });
                curPos = { x: tuple[6], y: tuple[7] };
                prevPos = curPos;
                break;
        }
        prevTuple = tuple;
    });
    return rv;
}

function RenderXYs({ xys, ...rest }: { xys: XY[]; } & React.SVGAttributes<SVGElement>) {
    rest = { r: "5", stroke: "red", fill: "orange", ...rest };
    return (<>
        {xys.map((xy, index) => <React.Fragment key={index}>
            <circle cx={xy.x} cy={xy.y} {...rest}>
                <title>{index}: x:{xy.x} y: {xy.y}</title>
            </circle>
            <text x={xy.x + 7} y={xy.y} fontSize="5" stroke="none" >{index}</text>
        </React.Fragment>)}
    </>);
}

function RenderCXYs({ cxys, ...rest }: { cxys: CXY[]; } & React.SVGAttributes<SVGElement>) {
    rest = { r: "2", stroke: "maroon", strokeWidth: '.4', fill: "tomato", ...rest };
    return (<>
        {cxys.map((cxy, index) =>
            <React.Fragment key={index}>
                <circle cx={cxy.c.x} cy={cxy.c.y} {...rest}>
                    <title>Command {cxy.n}: {cxy.i}: x:{cxy.c.x} y: {cxy.c.y}</title>
                </circle>
                <line x1={cxy.p.x} y1={cxy.p.y} x2={cxy.c.x} y2={cxy.c.y} {...rest} strokeDasharray=".5 .5" />
            </React.Fragment>
        )}
    </>);
}

function SimpleCurve() {
    //const path1 = 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'; //h10v30
    const path1 = 'M 0,5    S 2,-2  4,5    S 7,8   8,4    t 0.2,-2    h10    v10    h3    v10    h-24    v-30    h50';
    // const path2 = 'M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z'; // h60
    // const path2 = 'M 20,100    S 30,40 50,100    S 100,80 100,100'; //'M 2,10    S 3,4 5,10    S 10,8 10,10' * 10
    const path2 = 'M20,20    Q80,20 80,80    Q140,20 180,180'; //'M2,2    Q8,2 8,8    Q14,2 18,18' * 10

    const tuples: SvgTuple[] = parsePathString(path2);
    const tuplesAbs = pathToAbsolute(tuples);
    const points: XY[] = getPoints(tuplesAbs);
    const cpoints: CXY[] = getControlPoints(tuplesAbs);

    //printTuples(tuplesAbs);
    printCXYs(cpoints);

    return (
        <div className="pt-4 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    <RenderXYs xys={points} />
                    <RenderCXYs cxys={cpoints} />
                    {/* <path d={path1} fill="none" stroke="red" /> */}
                    <path d={path2} fill="none" stroke="red" />
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
