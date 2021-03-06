import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import './SimpleCurve.scss';
import { ControlPoint, CpType, getControlPoints, getPoints, parsePathString, pathToAbsolute, printControlPoints, printTuples, SvgTuple, XY } from './svg-utils';

function RenderPoints({ pts, ...rest }: { pts: XY[] } & React.SVGAttributes<SVGElement>) {
    rest = { r: "5", stroke: "red", fill: "orange", ...rest };
    return (<>
        {pts.map((xy, index) => <React.Fragment key={index}>
            <circle cx={xy.x} cy={xy.y} {...rest}>
                <title>{index}: x:{xy.x} y: {xy.y}</title>
            </circle>
            <text x={xy.x + 7} y={xy.y} fontSize="5" stroke="none" >{index}</text>
        </React.Fragment>)}
    </>);
}

function RenderCpts({ cpts, ...rest }: { cpts: ControlPoint[] } & React.SVGAttributes<SVGElement>) {
    rest = { r: "2", stroke: "maroon", strokeWidth: '.4', fill: "tomato", ...rest };
    return (<>
        {cpts.map((cpt, index) =>
            <React.Fragment key={index}>
                <circle cx={cpt.cp.x} cy={cpt.cp.y} {...rest} fill={cpt.t === CpType.computed ? 'none' : rest.fill}>
                    <title>Command {cpt.n}: {cpt.i}: x:{cpt.cp.x} y: {cpt.cp.y}</title>
                </circle>
                <line x1={cpt.pt.x} y1={cpt.pt.y} x2={cpt.cp.x} y2={cpt.cp.y} {...rest} strokeDasharray=".5 .5" />
            </React.Fragment>
        )}
    </>);
}

function SimpleCurve() {
    //const path1 = 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'; //h10v30
    const path1 = 'M 0,5    S 2,-2  4,5    S 7,8   8,4    t 0.2,-2    h10    v10    h3    v10    h-24    v-30    h50';
    // const path2 = 'M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z'; // h60

    // C curvers
    // const path2 = 'M 20,100    S 30,40 50,100    S 100,80 100,100'; //'M 2,10    S 3,4 5,10    S 10,8 10,10' * 10
    // const path2 = 'M 0 130 L -30 0 C 50 -15 80 -135 80 -55 C 140 -110 70 -5 105 60 L 0 130'; // quin
    // const path2 = 'M 0 130 L -30 0 C 50 -15 80 -135 80 -55 S 70 -5 105 59 S 35 106 0 130';
    // const path2 = 'M 0 130 L -30 0 S 70 -5 105 59 S 35 106 0 130';
    const path2 = 'M 0 130 L -30 0 S 70 -5 105 59 S 91 107 85 131 S 35 106 0 130';

    // Q curvers
    //const path2 = 'M20,20    Q80,20 80,80    Q140,20 180,180'; //'M2,2    Q8,2 8,8    Q14,2 18,18' * 10
    //const path2 = 'M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100'; //'M2,2    Q4,2 4,10    Q7,2 8,9    T 10,10    T 12,12    T14,10    T15,10    T16,10    T17,10' * 10
    //const path2 = 'M20,20    Q30,50 40,20    T60,20    T80,20';
    //const path2 = 'M20,20   L10,10   Q30,50 40,20    T60,20    T80,20';
    //const path2 = 'M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100';

    const [testPath, settestPath] = useState(path2);
    
    const tuples: SvgTuple[] = parsePathString(testPath);
    const tuplesAbs = pathToAbsolute(tuples);
    const points: XY[] = getPoints(tuplesAbs);
    const cpoints: ControlPoint[] = getControlPoints(tuplesAbs);

    //printTuples(tuplesAbs);
    //printControlPoints(cpoints);

    return (
        <div className="p-4 max-w-md mx-auto bg-indigo-100">

            <div className="shadow-sm">
                <input
                    className="w-full px-2 py-2 rounded shadow-inner border border-indigo-200 text-xs text-gray-500"
                    value={testPath} onChange={(event) => settestPath(event.target.value)}
                />
            </div>

            <div className="mt-2 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    <circle cx="0" cy="0" r="2" fill="violet" />
                    <text x="-80" y="-5" fontSize="6.5">{path2}</text>

                    <RenderPoints pts={points} />
                    <RenderCpts cpts={cpoints} />
                    {/* <path d={path1} fill="none" stroke="red" /> */}
                    <path d={testPath} fill="none" stroke="red" />
                </svg>
            </div>

            <div className="mt-4">
                <div className="mx-auto w-32 h-32">
                    {/* <svg className="bg-red-100" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7"> */}
                    {/* <svg className="" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7" style={{background: 'radial-gradient(ellipse at center, #fefefe 0%, #cbeeff 100%)'}}> */}
                    <svg className="" viewBox="-10 -10 100 100" fill="none" stroke="green" strokeWidth=".7" style={{ background: 'radial-gradient(ellipse at center, #fefefe 0%, rgb(254, 226, 226) 100%)' }}>

                        {/* <svg className="w-24 max-h-24 bg-indigo-400" viewBox="0 0 33.84 69.68" fill="none" stroke="green"> */}
                        <MarkGrid x={-10} y={-10} stroke="pink" strokeWidth="1" />

                        <g className="pulseAnim" transform="skewX(40) scale(.5)" style={{transformOrigin: '100% 100%'}}>
                            <path d="M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z" />
                            <path d="M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34" />
                        </g>
                    </svg>
                </div>
            </div>
            
        </div>
    );
}

export default SimpleCurve;
