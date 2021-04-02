import React from 'react';

const SvgGrid = ({x, y}: {x: number, y: number}) => {
    return (
        <svg width="100%" height="100%" x={x || 0} y={y || 0}>
            <defs>
                <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#80808020" strokeWidth=".5" />
                </pattern>
                <pattern id="medSmallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)" />
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#80808040" strokeWidth=".7" />
                </pattern>
                <pattern id="largeGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#medSmallGrid)" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ff000040" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#largeGrid)" />
        </svg>
    );
};

export default SvgGrid;
