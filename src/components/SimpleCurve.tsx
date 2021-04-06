import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { getPoints, parsePathString, pathToAbsolute, printTuples, SvgTuple, WH, XY } from './svg-utils';

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
    const path1 = 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34h10v30';
    const path2 = 'M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z';

    const tuples: SvgTuple[] = parsePathString(path2);
    const tuplesAbs = pathToAbsolute(tuples);
    const points: XY[] = getPoints(tuplesAbs);

    printTuples(tuplesAbs);

    return (
        <div className="pt-4 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                    <RenderXYs xys={points} />
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
