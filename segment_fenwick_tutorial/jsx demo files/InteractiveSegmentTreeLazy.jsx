// components/InteractiveSegmentTreeLazy.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

// --- Segment Tree with Lazy Propagation Class ---
class SegmentTreeLazy {
    constructor(arr) {
        this.n = arr.length;
        this.arr = [...arr];
        this.tree = Array(4 * this.n).fill(0);
        this.lazy = Array(4 * this.n).fill(0);
        this.steps = [];
        this.operationCount = 0;
        if (this.n > 0) this._build(0, 0, this.n - 1);
    }

    _build(tree_idx, lo, hi) {
        if (lo === hi) {
            this.tree[tree_idx] = this.arr[lo];
            return;
        }
        const mid = Math.floor((lo + hi) / 2);
        this._build(2 * tree_idx + 1, lo, mid);
        this._build(2 * tree_idx + 2, mid + 1, hi);
        this.tree[tree_idx] = this.tree[2 * tree_idx + 1] + this.tree[2 * tree_idx + 2];
    }

    _push_down(tree_idx, lo, hi) {
        if (this.lazy[tree_idx] !== 0) {
            const lazyVal = this.lazy[tree_idx];
            this.tree[tree_idx] += lazyVal * (hi - lo + 1);
            this.steps.push({
                message: `Push Down: Applying lazy value (+${lazyVal}) to node ${tree_idx}. New value: ${this.tree[tree_idx]}.`,
                highlights: { nodes: new Set([tree_idx]), lazy: new Set([tree_idx]) },
                treeState: [...this.tree],
                lazyState: [...this.lazy]
            });

            if (lo !== hi) {
                this.lazy[2 * tree_idx + 1] += lazyVal;
                this.lazy[2 * tree_idx + 2] += lazyVal;
                this.steps.push({
                    message: `Propagating lazy value (+${lazyVal}) to children ${2 * tree_idx + 1} and ${2 * tree_idx + 2}.`,
                    highlights: { nodes: new Set([2 * tree_idx + 1, 2 * tree_idx + 2]), lazy: new Set([2 * tree_idx + 1, 2 * tree_idx + 2]) },
                    treeState: [...this.tree],
                    lazyState: [...this.lazy]
                });
            }
            this.lazy[tree_idx] = 0;
        }
    }

    _range_update(tree_idx, lo, hi, l, r, val) {
        this._push_down(tree_idx, lo, hi);
        if (r < lo || hi < l) return;

        if (l <= lo && hi <= r) {
            this.lazy[tree_idx] += val;
            this.steps.push({
                message: `Range Update: Node ${tree_idx} [${lo},${hi}] is fully in range. Adding (+${val}) to its lazy tag.`,
                highlights: { nodes: new Set([tree_idx]), lazy: new Set([tree_idx]) },
                treeState: [...this.tree],
                lazyState: [...this.lazy]
            });
            this._push_down(tree_idx, lo, hi);
            return;
        }

        const mid = Math.floor((lo + hi) / 2);
        this._range_update(2 * tree_idx + 1, lo, mid, l, r, val);
        this._range_update(2 * tree_idx + 2, mid + 1, hi, l, r, val);
        this.tree[tree_idx] = this.tree[2 * tree_idx + 1] + this.tree[2 * tree_idx + 2];
        this.steps.push({
            message: `Updating parent node ${tree_idx} from children. New value: ${this.tree[tree_idx]}.`,
            highlights: { nodes: new Set([tree_idx, 2 * tree_idx + 1, 2 * tree_idx + 2]), lazy: new Set() },
            treeState: [...this.tree],
            lazyState: [...this.lazy]
        });
    }

    _query(tree_idx, lo, hi, l, r) {
        if (r < lo || hi < l) return 0;
        this._push_down(tree_idx, lo, hi);

        if (l <= lo && hi <= r) {
            this.steps.push({
                message: `Query: Node ${tree_idx} [${lo},${hi}] is fully in range. Adding its value (${this.tree[tree_idx]}) to sum.`,
                highlights: { nodes: new Set([tree_idx]), lazy: new Set() },
                treeState: [...this.tree],
                lazyState: [...this.lazy]
            });
            return this.tree[tree_idx];
        }

        const mid = Math.floor((lo + hi) / 2);
        const p1 = this._query(2 * tree_idx + 1, lo, mid, l, r);
        const p2 = this._query(2 * tree_idx + 2, mid + 1, hi, l, r);
        return p1 + p2;
    }
}

const InteractiveSegmentTreeLazy = () => {
    const [array, setArray] = useState([1, 2, 3, 4, 5]);
    const [animationSteps, setAnimationSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [treeState, setTreeState] = useState([]);
    const [lazyState, setLazyState] = useState([]);
    const [highlights, setHighlights] = useState({ nodes: new Set(), lazy: new Set() });
    const [updateRange, setUpdateRange] = useState({ l: 1, r: 3, val: 10 });
    const [queryRange, setQueryRange] = useState({ l: 0, r: 4 });
    const [queryResult, setQueryResult] = useState(null);

    const stRef = useRef(new SegmentTreeLazy(array));

    const resetTree = useCallback(() => {
        stRef.current = new SegmentTreeLazy(array);
        setTreeState([...stRef.current.tree]);
        setLazyState([...stRef.current.lazy]);
        setAnimationSteps([]);
        setCurrentStep(0);
        setIsPlaying(false);
        setQueryResult(null);
    }, [array]);

    useEffect(() => {
        resetTree();
    }, [array, resetTree]);

    useEffect(() => {
        if (!isPlaying || currentStep >= animationSteps.length) {
            if (currentStep >= animationSteps.length) setIsPlaying(false);
            return;
        }
        const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 800);
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, animationSteps]);

    useEffect(() => {
        if (animationSteps.length === 0 || currentStep >= animationSteps.length) {
            setHighlights({ nodes: new Set(), lazy: new Set() });
            return;
        }
        const step = animationSteps[currentStep];
        if (step && step.highlights) {
            setHighlights(step.highlights);
            setTreeState(step.treeState);
            setLazyState(step.lazyState);
        }
    }, [currentStep, animationSteps]);

    const executeOperation = (type) => {
        resetTree();
        const st = new SegmentTreeLazy(array);
        st.steps.push({
            message: `Starting ${type} operation.`,
            highlights: { nodes: new Set(), lazy: new Set() },
            treeState: [...st.tree],
            lazyState: [...st.lazy]
        });

        if (type === 'update') {
            st._range_update(0, 0, st.n - 1, updateRange.l, updateRange.r, updateRange.val);
            st.steps.push({
                message: `Range update complete.`,
                highlights: { nodes: new Set(), lazy: new Set() },
                treeState: [...st.tree],
                lazyState: [...st.lazy]
            });
        } else if (type === 'query') {
            const result = st._query(0, 0, st.n - 1, queryRange.l, queryRange.r);
            setQueryResult(result);
            st.steps.push({
                message: `Query complete. Result: ${result}`,
                highlights: { nodes: new Set(), lazy: new Set() },
                treeState: [...st.tree],
                lazyState: [...st.lazy]
            });
        }
        
        setAnimationSteps(st.steps);
        setIsPlaying(true);
    };
    
    return (
        <div className="max-w-5xl mx-auto font-sans">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Segment Tree with Lazy Propagation</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Visualizing efficient range updates.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="controls p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-3">Controls</h3>
                        <div className="space-y-3 text-sm">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
                                <label className="font-medium">Range Update</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="number" value={updateRange.l} onChange={e => setUpdateRange({...updateRange, l: +e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white dark:bg-slate-700" />
                                    <span>to</span>
                                    <input type="number" value={updateRange.r} onChange={e => setUpdateRange({...updateRange, r: +e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white dark:bg-slate-700" />
                                    <span>add</span>
                                    <input type="number" value={updateRange.val} onChange={e => setUpdateRange({...updateRange, val: +e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white dark:bg-slate-700" />
                                </div>
                                <button onClick={() => executeOperation('update')} className="w-full mt-2 px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600">Run Update</button>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
                                <label className="font-medium">Range Query</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="number" value={queryRange.l} onChange={e => setQueryRange({...queryRange, l: +e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white dark:bg-slate-700" />
                                    <span>to</span>
                                    <input type="number" value={queryRange.r} onChange={e => setQueryRange({...queryRange, r: +e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white dark:bg-slate-700" />
                                </div>
                                <button onClick={() => executeOperation('query')} className="w-full mt-2 px-3 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700">Run Query</button>
                                {queryResult !== null && <p className="text-center mt-2 font-bold">Result: {queryResult}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Animation</h3>
                        <AnimationControls isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} onReset={resetTree} currentStep={currentStep} totalSteps={animationSteps.length > 0 ? animationSteps.length -1 : 0} />
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border dark:border-slate-600 min-h-[80px] text-sm mt-3">
                            <p><strong>Step {currentStep + 1}:</strong> {animationSteps[currentStep]?.message || "Ready."}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <LazyTreeVisualization tree={treeState} lazy={lazyState} arraySize={array.length} highlights={highlights} />
                </div>
            </div>
        </div>
    );
};

const LazyTreeVisualization = React.memo(({ tree, lazy, arraySize, highlights }) => {
    const { nodes, edges, maxLevel } = useMemo(() => {
        if (!arraySize || arraySize === 0) return { nodes: [], edges: [], maxLevel: 0 };
        const calculatedNodes = [], calculatedEdges = [], visited = new Set();
        const maxLevels = Math.ceil(Math.log2(arraySize)) + 1;
        const queue = [{ index: 0, level: 0, position: 0 }];
        const getNodePosition = (level, position, totalWidth = 800) => ({ x: (position + 0.5) * (totalWidth / Math.pow(2, level)), y: level * 90 + 50 });
        
        while (queue.length > 0) {
            const { index, level, position } = queue.shift();
            if (index >= tree.length || level >= maxLevels || visited.has(index)) continue;
            visited.add(index);
            const pos = getNodePosition(level, position);
            calculatedNodes.push({ index, value: tree[index], lazy: lazy[index], x: pos.x, y: pos.y, level });
            
            const leftChild = 2 * index + 1, rightChild = 2 * index + 2;
            if (leftChild < tree.length && leftChild < 4 * arraySize) {
                queue.push({ index: leftChild, level: level + 1, position: position * 2 });
                calculatedEdges.push({ from: pos, to: getNodePosition(level + 1, position * 2) });
            }
            if (rightChild < tree.length && rightChild < 4 * arraySize) {
                queue.push({ index: rightChild, level: level + 1, position: position * 2 + 1 });
                calculatedEdges.push({ from: pos, to: getNodePosition(level + 1, position * 2 + 1) });
            }
        }
        return { nodes: calculatedNodes, edges: calculatedEdges, maxLevel: maxLevels - 1 };
    }, [tree, lazy, arraySize]);

    const svgHeight = (maxLevel + 1.5) * 90;

    return (
        <svg width="100%" height={svgHeight} viewBox={`0 0 800 ${svgHeight}`}>
            {edges.map((edge, i) => <motion.line key={`edge-${i}`} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />)}
            {nodes.map((node) => {
                const isNodeHighlighted = highlights?.nodes?.has(node.index);
                const isLazyHighlighted = highlights?.lazy?.has(node.index);
                return (
                    <g key={`node-${node.index}`} transform={`translate(${node.x}, ${node.y})`}>
                        <motion.circle r="28" className="fill-white dark:fill-slate-700" strokeWidth="2" animate={{ stroke: isNodeHighlighted ? '#3b82f6' : '#94a3b8' }} />
                        <text textAnchor="middle" dy=".3em" className="font-bold text-lg fill-current text-slate-800 dark:text-slate-200 pointer-events-none">{node.value}</text>
                        <text textAnchor="middle" dy="-35" className="text-xs fill-current text-slate-500 dark:text-slate-400 pointer-events-none">idx: {node.index}</text>
                        {node.lazy !== 0 && (
                            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <circle cx="22" cy="-22" r="12" className="fill-orange-400" strokeWidth="2" stroke={isLazyHighlighted ? '#ffffff' : 'none'} />
                                <text x="22" y="-22" textAnchor="middle" dy=".3em" className="text-xs font-bold fill-white pointer-events-none">+{node.lazy}</text>
                            </motion.g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
});

const AnimationControls = React.memo(({ isPlaying, onPlayPause, onReset, currentStep, totalSteps }) => (
  <div className="animation-controls flex flex-col gap-3">
    <div className="flex items-center justify-around">
        <button onClick={onPlayPause} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
        <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><ResetIcon /></button>
    </div>
    <div className="text-sm font-mono text-center text-slate-600 dark:text-slate-300">Step: {currentStep} / {totalSteps}</div>
  </div>
));

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const ResetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>;

export default InteractiveSegmentTreeLazy;