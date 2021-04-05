import React from 'react';
import PropTypes from 'prop-types';
import MarkGrid from './SvgGrid';
import { WH, XY } from './svg-utils';

function SimpleCurve() {

    return (
        <div className="pt-8 max-w-md mx-auto bg-indigo-100">
            <div className="mx-auto w-96 h-96 border border-l-0 border-t-0 border-red-300">
                <svg className="bg-red-100" viewBox="-200 -200 400 400">
                    <MarkGrid x={-200} y={-200} visible={true} />
                </svg>
            </div>

            <div className="ml-4 py-2" >
                <svg className="w-72 h-72 bg-indigo-400" viewBox="0 0 103.84 139.68" fill="none" stroke="green">
                {/* <svg className="w-24 max-h-24 bg-indigo-400" viewBox="0 0 33.84 69.68" fill="none" stroke="green"> */}
                    <MarkGrid x={0} y={0} visible={true} />
                    <path d="M18,69.48S33.7,60,33.7,49s-4.46-16.32-6.24-24.63,3-24,3-24A142.07,142.07,0,0,0,14.11,12.8C7.71,18.56.76,25.27.16,36.84S18,69.48,18,69.48Z"/>
                    <path d="M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34"/>
                </svg>                
            </div>
        </div>
    );
}

export default SimpleCurve;
