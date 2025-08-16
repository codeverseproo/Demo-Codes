// components/AdImpressions.jsx
"use client";
import React from 'react';

// --- 2D Fenwick Tree Implementation ---
class FenwickTree2D {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tree = Array(rows + 1).fill(0).map(() => Array(cols + 1).fill(0));
    }

    update(r, c, val) {
        r++; c++;
        for (let i = r; i <= this.rows; i += i & -i) {
            for (let j = c; j <= this.cols; j += j & -j) {
                this.tree[i][j] += val;
            }
        }
    }

    _query(r, c) {
        r++; c++;
        let s = 0;
        for (let i = r; i > 0; i -= i & -i) {
            for (let j = c; j > 0; j -= j & -j) {
                s += this.tree[i][j];
            }
        }
        return s;
    }

    range_query(r1, c1, r2, c2) {
        return this._query(r2, c2) - this._query(r1 - 1, c2) - this._query(r2, c1 - 1) + this._query(r1 - 1, c1 - 1);
    }
}

const CITIES = ["NYC", "LA", "CHI", "HOU", "PHX", "PHI", "SA", "SD", "DAL", "SJ", "AUS", "JAX"];
const ROWS = 3;
const COLS = 4;

const AdImpressions = () => {
    const [grid, setGrid] = React.useState(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    const [isPaused, setIsPaused] = React.useState(false);
    const [selection, setSelection] = React.useState({ r1: 0, c1: 0, r2: 1, c2: 1 });
    const [selectedSum, setSelectedSum] = React.useState(0);
    const [lastEvent, setLastEvent] = React.useState(null);
    const [isSelecting, setIsSelecting] = React.useState(false);

    const fenwickTreeRef = React.useRef(new FenwickTree2D(ROWS, COLS));
    const gridRef = React.useRef(grid);

    const addNewImpression = React.useCallback(() => {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        const impressions = Math.floor(Math.random() * 10) + 1;
        const cityIndex = r * COLS + c;

        const newGrid = gridRef.current.map(row => [...row]);
        newGrid[r][c] += impressions;
        gridRef.current = newGrid;
        setGrid(newGrid);

        fenwickTreeRef.current.update(r, c, impressions);
        setLastEvent({ city: CITIES[cityIndex], impressions, key: Date.now() });
    }, []);

    React.useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(addNewImpression, 1500);
        return () => clearInterval(interval);
    }, [isPaused, addNewImpression]);

    React.useEffect(() => {
        const { r1, c1, r2, c2 } = selection;
        const sum = fenwickTreeRef.current.range_query(r1, c1, r2, c2);
        setSelectedSum(sum);
    }, [selection, grid]);

    const handleMouseDown = (r, c) => {
        setIsSelecting(true);
        setSelection({ r1: r, c1: c, r2: r, c2: c });
    };

    const handleMouseOver = (r, c) => {
        if (isSelecting) {
            setSelection(prev => ({ ...prev, r2: r, c2: c }));
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
    };
    
    const normalizedSelection = {
        r1: Math.min(selection.r1, selection.r2),
        c1: Math.min(selection.c1, selection.c2),
        r2: Math.max(selection.r1, selection.r2),
        c2: Math.max(selection.c1, selection.c2),
    };

    return (
        <div className="max-w-4xl mx-auto font-sans" onMouseUp={handleMouseUp}>
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Ad Campaign Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Using a 2D Fenwick Tree to analyze impressions by city.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-3">Impression Map</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Click and drag to select a region.</p>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                        {grid.map((row, r) =>
                            row.map((val, c) => {
                                const cityIndex = r * COLS + c;
                                const isSelected = r >= normalizedSelection.r1 && r <= normalizedSelection.r2 && c >= normalizedSelection.c1 && c <= normalizedSelection.c2;
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`h-20 flex flex-col items-center justify-center rounded-md transition-colors cursor-pointer ${isSelected ? 'bg-sky-200 dark:bg-sky-800' : 'bg-slate-100 dark:bg-slate-700'}`}
                                        onMouseDown={() => handleMouseDown(r, c)}
                                        onMouseOver={() => handleMouseOver(r, c)}
                                    >
                                        <span className="text-xs font-semibold">{CITIES[cityIndex]}</span>
                                        <span className="text-xl font-bold">{val}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-2 text-sky-600 dark:text-sky-400">Selected Region Total</h2>
                        <p className="text-5xl font-bold text-slate-900 dark:text-white">{selectedSum}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-3">Live Stream</h2>
                        <div className="h-24 overflow-y-auto">
                            {lastEvent && (
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm">
                                    <span className="font-bold text-blue-500">+{lastEvent.impressions}</span> impressions in <span className="font-semibold">{lastEvent.city}</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => setIsPaused(!isPaused)} className={`w-full px-4 py-2 text-white rounded-md transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdImpressions;
