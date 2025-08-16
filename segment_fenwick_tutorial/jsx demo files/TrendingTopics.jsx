// components/TrendingTopics.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 2D Fenwick Tree Implementation ---
class FenwickTree2D {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tree = Array(rows + 1).fill(0).map(() => Array(cols + 1).fill(0));
    }

    update(row, col, delta) {
        row++; col++; // 1-based index
        for (let i = row; i <= this.rows; i += i & -i) {
            for (let j = col; j <= this.cols; j += j & -j) {
                this.tree[i][j] += delta;
            }
        }
    }

    _query(row, col) {
        row++; col++; // 1-based index
        let sum = 0;
        for (let i = row; i > 0; i -= i & -i) {
            for (let j = col; j > 0; j -= j & -j) {
                sum += this.tree[i][j];
            }
        }
        return sum;
    }
    
    // Query a rectangular sum from (r1, c1) to (r2, c2)
    query(r1, c1, r2, c2) {
        return this._query(r2, c2) - this._query(r1 - 1, c2) - this._query(r2, c1 - 1) + this._query(r1 - 1, c1 - 1);
    }
}

const TOPICS = ["Tech", "Sports", "Music", "Gaming"];
const REGIONS = ["Americas", "Europe", "Asia", "Africa"];

const TrendingTopics = () => {
    const [grid, setGrid] = useState(Array(TOPICS.length).fill(0).map(() => Array(REGIONS.length).fill(0)));
    const [isPaused, setIsPaused] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [trendingTopic, setTrendingTopic] = useState({ topic: 'None', count: 0 });
    const [lastEvent, setLastEvent] = useState(null);

    const fenwickTreeRef = useRef(new FenwickTree2D(TOPICS.length, REGIONS.length));
    const gridRef = useRef(grid);

    useEffect(() => {
        const root = window.document.documentElement;
        setIsDarkMode(root.classList.contains('dark'));
        const observer = new MutationObserver(() => setIsDarkMode(root.classList.contains('dark')));
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const addNewEvent = useCallback(() => {
        const topicIdx = Math.floor(Math.random() * TOPICS.length);
        const regionIdx = Math.floor(Math.random() * REGIONS.length);
        const engagement = Math.floor(Math.random() * 5) + 1;

        // Update raw grid
        const newGrid = gridRef.current.map(row => [...row]);
        newGrid[topicIdx][regionIdx] += engagement;
        gridRef.current = newGrid;
        setGrid(newGrid);

        // Update Fenwick Tree
        fenwickTreeRef.current.update(topicIdx, regionIdx, engagement);
        
        // Find new trending topic
        let maxCount = 0;
        let trend = 'None';
        for (let i = 0; i < TOPICS.length; i++) {
            const topicTotal = fenwickTreeRef.current.query(i, 0, i, REGIONS.length - 1);
            if (topicTotal > maxCount) {
                maxCount = topicTotal;
                trend = TOPICS[i];
            }
        }
        setTrendingTopic({ topic: trend, count: maxCount });
        setLastEvent({ topic: TOPICS[topicIdx], region: REGIONS[regionIdx], engagement, key: Date.now() });

    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(addNewEvent, 1200);
        return () => clearInterval(interval);
    }, [isPaused, addNewEvent]);

    return (
        <div className="max-w-4xl mx-auto font-sans">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Trending Topics Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Using a 2D Fenwick Tree to analyze engagement by topic and region.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                <h2 className="text-lg font-semibold mb-2 text-sky-600 dark:text-sky-400">Trending Now</h2>
                <div className="flex items-baseline gap-4">
                    <p className="text-5xl font-bold text-slate-900 dark:text-white">{trendingTopic.topic}</p>
                    <p className="text-slate-500 dark:text-slate-400">with {trendingTopic.count} total engagements</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-3">Engagement Grid (Topic vs. Region)</h2>
                    <div className="grid grid-cols-5 gap-2 text-center text-sm font-semibold">
                        <div></div> {/* Empty corner */}
                        {REGIONS.map(r => <div key={r} className="text-slate-500 dark:text-slate-400">{r}</div>)}
                        
                        {TOPICS.map((topic, topicIdx) => (
                            <React.Fragment key={topic}>
                                <div className="flex items-center justify-end text-slate-500 dark:text-slate-400 pr-2">{topic}</div>
                                {REGIONS.map((region, regionIdx) => (
                                    <div key={region} className="w-full h-16 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md text-xl font-bold">
                                        {grid[topicIdx][regionIdx]}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                     <h2 className="text-lg font-semibold mb-3">Live Event Stream</h2>
                    <div className="h-48 overflow-y-auto space-y-2 pr-2">
                         <AnimatePresence>
                            {lastEvent && (
                                <motion.div
                                    key={lastEvent.key}
                                    className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span className="font-bold text-blue-500">+{lastEvent.engagement}</span> engagement for <span className="font-semibold">{lastEvent.topic}</span> in <span className="font-semibold">{lastEvent.region}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={addNewEvent} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Simulate Event
                        </button>
                        <button onClick={() => setIsPaused(!isPaused)} className={`w-full px-4 py-2 text-white rounded-md transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                            {isPaused ? 'Resume Stream' : 'Pause Stream'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingTopics;
