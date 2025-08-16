// components/RealTimeAnalytics.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// --- Fenwick Tree Implementation ---
class FenwickTree {
    constructor(size) {
        this.size = size;
        this.tree = new Array(size + 1).fill(0);
    }

    update(idx, delta) {
        idx++; // 1-based index
        while (idx <= this.size) {
            this.tree[idx] += delta;
            idx += idx & -idx;
        }
    }

    query(idx) {
        idx++; // 1-based index
        let sum = 0;
        while (idx > 0) {
            sum += this.tree[idx];
            idx -= idx & -idx;
        }
        return sum;
    }
    
    // Helper to get the current state for visualization
    getTreeState() {
        return this.tree.slice(1);
    }
}

const TIME_WINDOW_SECONDS = 10;

const RealTimeAnalytics = () => {
    const [events, setEvents] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fenwickTreeState, setFenwickTreeState] = useState(new Array(TIME_WINDOW_SECONDS).fill(0));
    const [totalClicks, setTotalClicks] = useState(0);

    // Use useRef to hold the Fenwick Tree instance and events to avoid re-creations on re-renders
    const fenwickTreeRef = useRef(new FenwickTree(TIME_WINDOW_SECONDS));
    const eventsRef = useRef([]);

    // Effect to detect theme changes from the parent document
    useEffect(() => {
        const root = window.document.documentElement;
        setIsDarkMode(root.classList.contains('dark'));
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const addNewEvent = useCallback(() => {
        const now = Date.now();
        const newEvent = { time: now, value: 1 };
        
        let currentEvents = [...eventsRef.current, newEvent];
        
        // Update Fenwick Tree
        const indexInWindow = Math.floor((now / 1000) % TIME_WINDOW_SECONDS);
        fenwickTreeRef.current.update(indexInWindow, 1);

        // Prune old events
        const cutoffTime = now - TIME_WINDOW_SECONDS * 1000;
        const eventsToRemove = currentEvents.filter(e => e.time < cutoffTime);
        
        eventsToRemove.forEach(event => {
            const oldIndex = Math.floor((event.time / 1000) % TIME_WINDOW_SECONDS);
            const hasNewerEventAtIndex = currentEvents.some(e => e.time > event.time && Math.floor((e.time / 1000) % TIME_WINDOW_SECONDS) === oldIndex);
            if (!hasNewerEventAtIndex) {
                fenwickTreeRef.current.update(oldIndex, -event.value);
            }
        });

        eventsRef.current = currentEvents.filter(e => e.time >= cutoffTime);
        
        // Update state for re-rendering
        setEvents(eventsRef.current);
        setFenwickTreeState(fenwickTreeRef.current.getTreeState());
        setTotalClicks(fenwickTreeRef.current.query(TIME_WINDOW_SECONDS - 1));
    }, []);

    // Simulation interval
    useEffect(() => {
        if (isPaused) {
            return;
        }
        const interval = setInterval(addNewEvent, 1500);
        return () => clearInterval(interval);
    }, [isPaused, addNewEvent]);

    return (
        <div className="max-w-4xl mx-auto font-sans">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Real-Time Analytics Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Simulating live website traffic with a Fenwick Tree.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                <h2 className="text-lg font-semibold mb-2 text-sky-600 dark:text-sky-400">Live Metric</h2>
                <div className="flex items-baseline gap-4">
                    <p className="text-5xl font-bold text-slate-900 dark:text-white">{totalClicks}</p>
                    <p className="text-slate-500 dark:text-slate-400">Clicks in the last 10 seconds</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-3">Live Data Stream</h2>
                    <div className="h-48 overflow-y-auto space-y-2 pr-2">
                        {events.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Waiting for data...</p>
                        ) : (
                            [...events].reverse().map(event => (
                                <motion.div
                                    key={event.time}
                                    className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Click event at {new Date(event.time).toLocaleTimeString()}
                                </motion.div>
                            ))
                        )}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={addNewEvent} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Simulate Click
                        </button>
                        <button onClick={() => setIsPaused(!isPaused)} className={`w-full px-4 py-2 text-white rounded-md transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                            {isPaused ? 'Resume Stream' : 'Pause Stream'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-3">Fenwick Tree State</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Each cell shows the sum it's responsible for.</p>
                    <div className="flex flex-wrap gap-2">
                        {fenwickTreeState.map((value, index) => (
                            <div key={index} className="w-12 h-12 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md">
                                <span className="font-bold text-lg">{value}</span>
                                <span className="text-xs text-slate-500">{index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeAnalytics;
