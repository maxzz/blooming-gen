import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { CXY, getPoints, parsePathString, pathToAbsolute, printCXYs, printTuples, SvgTuple, WH, XY } from './svg-utils';

export function getControlPoints(tuplesAbs: SvgTuple[]): CXY[] {
    let rv: CXY[] = [];
    let prevPos: XY = { x: 0, y: 0 };
    let prevTuple: SvgTuple;
    tuplesAbs.forEach((tuple: SvgTuple, index: number, items: SvgTuple[]) => {
        console.log(`i: ${index}------------------------ tuple: ${JSON.stringify(tuple)}`);

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
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[1], y: tuple[2] } });
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[3], y: tuple[4] } });
                prevPos = curPos;
                break;
            case 'S': {
                curPos = { x: tuple[3], y: tuple[4] };
                switch (prevTuple[0]) {
                    case 'C':
                    case 'S':
                        let ofs = prevTuple[0] === 'C' ? 3 : 1;
                        let prevCtrl: XY = { x: prevPos.x - (prevTuple[ofs] - prevTuple[ofs + 2]), y: prevPos.y - (prevTuple[ofs + 1] - prevTuple[ofs + 3]) }; // reflection
                        rv.push({ i: index, n: c, pt: prevPos, cp: prevCtrl });
                        break;
                }
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[1], y: tuple[2] } });
                prevPos = curPos;
                break;
            }
            case 'Q':
                curPos = { x: tuple[3], y: tuple[4] };
                let cp: XY = { x: tuple[1], y: tuple[2] };
                rv.push({ i: index, n: c, pt: prevPos, cp: cp });
                rv.push({ i: index, n: c, pt: curPos, cp: cp });
                prevPos = curPos;
                break;
            case 'T': {
                curPos = { x: tuple[1], y: tuple[2] };

                let q;
                for (q = index - 1; q >= 0; q--) {
                    console.log(`backtrack: q: ${q} ${JSON.stringify(tuplesAbs[q])}`);
                    if (tuplesAbs[q][0] === 'Q') {
                        break;
                    }
                    if (tuplesAbs[q][0] !== 'T') {
                        break;
                    }
                }
                if (q === -1) {
                    console.log(`none: q: ${q}`);
                }
                else {
                    console.log(`done: q: ${q}`);
                }

                if (q === -1 || tuplesAbs[q][0] !== 'Q') {
                    console.log(`NOTHING: q: ${q}`);
                }

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

                /*
                // function backtrackCP(i: number): SvgTuple {
                // }
                    function backtrackCP(i: number, cp: XY): XY {
                        let prev = items[i - 1];
                        if (!prev) {
                            console.log(`done`);
                            return cp;
                        }
                        console.log(`backtrack: i: ${i} curPos: ${JSON.stringify(curPos)} prev: ${JSON.stringify(prev)}`);

                        if (prev[0] === 'Q') { // Q, x1, y1, x, y
                            return {
                                x: cp.x + (-prev[1] + cp.x),
                                y: cp.y + (-prev[2] + cp.y),
                            }
                        }
                        if (prev[0] === 'T') { // T, x, y
                            let prevCP = backtrackCP(i - 1, {
                                x: prev[1],
                                y: prev[2],
                            });
                            return {
                                x: 2*cp.x - (prevCP.x),
                                y: 2*cp.y - (prevCP.y),
                            }
                        }
                        return cp;
                    }
                    let cp: XY = backtrackCP(index, prevPos);
                    rv.push({ i: index, n: c, pt: prevPos, cp: cp });
                    rv.push({ i: index, n: c, pt: curPos, cp: cp });
                */

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
                <circle cx={cxy.cp.x} cy={cxy.cp.y} {...rest}>
                    <title>Command {cxy.n}: {cxy.i}: x:{cxy.cp.x} y: {cxy.cp.y}</title>
                </circle>
                <line x1={cxy.pt.x} y1={cxy.pt.y} x2={cxy.cp.x} y2={cxy.cp.y} {...rest} strokeDasharray=".5 .5" />
            </React.Fragment>
        )}
    </>);
}

function SimpleCurve() {
    //const path1 = 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'; //h10v30
    const path1 = 'M 0,5    S 2,-2  4,5    S 7,8   8,4    t 0.2,-2    h10    v10    h3    v10    h-24    v-30    h50';
    // const path2 = 'M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z'; // h60
    // const path2 = 'M 20,100    S 30,40 50,100    S 100,80 100,100'; //'M 2,10    S 3,4 5,10    S 10,8 10,10' * 10
    // const path2 = 'M20,20    Q80,20 80,80    Q140,20 180,180'; //'M2,2    Q8,2 8,8    Q14,2 18,18' * 10
    //const path2 = 'M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100'; //'M2,2    Q4,2 4,10    Q7,2 8,9    T 10,10    T 12,12    T14,10    T15,10    T16,10    T17,10' * 10
    //const path2 = 'M20,20    Q30,50 40,20    T60,20    T80,20';
    const path2 = 'M20,20   L10,10   T30,50 40,20    T60,20    T80,20';

    const tuples: SvgTuple[] = parsePathString(path2);
    const tuplesAbs = pathToAbsolute(tuples);
    const points: XY[] = getPoints(tuplesAbs);
    const cpoints: CXY[] = getControlPoints(tuplesAbs);

    //printTuples(tuplesAbs);
    //printCXYs(cpoints);

    return (
        <div className="pt-4 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    <circle cx="0" cy="0" r="2" fill="violet" />
                    <text x="-80" y="-5" fontSize="6.5">{path2}</text>

                    <RenderXYs xys={points} />
                    <RenderCXYs cxys={cpoints} />
                    {/* <path d={path1} fill="none" stroke="red" /> */}
                    <path d={path2} fill="none" stroke="red" />
                </svg>
            </div>

            <div className="ml-8 py-4" >
                <div className="w-72 h-72">
                    {/* <svg className="bg-red-100" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7"> */}
                    {/* <svg className="" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7" style={{background: 'radial-gradient(ellipse at center, #fefefe 0%, #cbeeff 100%)'}}> */}
                    <svg className="" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7" style={{background: 'radial-gradient(ellipse at center, #fefefe 0%, rgb(254, 226, 226) 100%)'}}>

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
