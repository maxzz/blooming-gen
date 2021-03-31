import React, { useState } from 'react';
import './App.css';

function App() {
    return (
        <div className="App h-screen bg-gray-100">
            <div className="max-w-md mx-auto bg-indigo-100 h-full">
                <div className="w-24 h-24 border border-dotted border-red-800">
                    <svg className="" viewBox="-24 -24 48 48">
                        <rect x='-10' y='-10' width='20' height='20' fill="red" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default App;
