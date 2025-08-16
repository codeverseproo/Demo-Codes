// components/InteractiveFenwickTree.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

// Define a maximum array size to prevent performance issues
const MAX_ARRAY_SIZE = 32;

/**
 * A fully responsive, dark-theme enabled, interactive component for visualizing Fenwick Tree (BIT) data structures.
 * It includes detailed performance metrics, step-by-step animations, and input limitations for stability.
 */
const InteractiveFenwickTree = ({ initialArray = [1, 3, 5, 7, 9, 11] }) => {
  const [array, setArray] = useState(initialArray.slice(0, MAX_ARRAY_SIZE));
  const [tree, setTree] = useState([]);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState({ tree: new Set(), array: new Set(), links: new Set() });
  const [queryRange, setQueryRange] = useState({ l: 0, r: initialArray.length - 1 });
  const [updateParams, setUpdateParams] = useState({ idx: 0, val: array[0] || 0 });
  const [prefixQueryIdx, setPrefixQueryIdx] = useState(initialArray.length - 1);
  const [inputWarning, setInputWarning] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [rangeQueryResult, setRangeQueryResult] = useState(null);


  // Effect to manage the theme based on Tailwind's class-based approach
  useEffect(() => {
    const root = window.document.documentElement;
    setIsDarkMode(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDarkMode(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({ operationHistory: [], memoryUsage: [], totalOperations: 0, peakMemoryUsage: 0 });
  const [currentOperation, setCurrentOperation] = useState(null);
  const operationStartTime = useRef(null);

  // --- Performance Tracking Logic ---
  const trackOperation = useCallback((operationType, startTime) => {
    const duration = performance.now() - startTime;
    const memoryInfo = performance.memory ? { used: performance.memory.usedJSHeapSize / 1024 / 1024 } : { used: 0 };
    setPerformanceMetrics(prev => ({
      ...prev,
      operationHistory: [...prev.operationHistory, { type: operationType, duration, complexity: `O(log n)` }].slice(-50),
      memoryUsage: [...prev.memoryUsage, memoryInfo.used].slice(-50),
      totalOperations: prev.totalOperations + 1,
      peakMemoryUsage: Math.max(prev.peakMemoryUsage, memoryInfo.used)
    }));
  }, []);

  // --- Fenwick Tree Class with Step Generation ---
  class FenwickTreeWithSteps {
    constructor(arr) {
      this.n = arr.length;
      this.originalArr = [...arr];
      this.tree = new Array(this.n + 1).fill(0);
      this.steps = [];
      this.operationCount = 0;
      if (this.n > 0) this.build();
    }

    incrementOp() { this.operationCount++; }

    build() {
      this.steps.push({ message: `Building Fenwick Tree from array.`, highlights: { tree: new Set(), array: new Set(), links: new Set() } });
      for (let i = 0; i < this.n; i++) {
        this.updateWithSteps(i, this.originalArr[i], true);
      }
      this.steps.push({ message: `Build complete. Ready for operations.`, highlights: { tree: new Set(), array: new Set(), links: new Set() } });
    }

    updateWithSteps(idx, val, isBuild = false) {
      const difference = isBuild ? val : val - this.originalArr[idx];
      if (!isBuild) {
        this.originalArr[idx] = val;
        this.steps.push({ message: `Updating index ${idx} to ${val}. The difference is ${difference}.`, highlights: { array: new Set([idx]), tree: new Set(), links: new Set() } });
      }
      
      let currentIdx = idx + 1;
      while (currentIdx <= this.n) {
        this.incrementOp();
        this.tree[currentIdx] += difference;
        this.steps.push({
          message: `Update: Add ${difference} to tree[${currentIdx}]. New value: ${this.tree[currentIdx]}.`,
          highlights: { tree: new Set([currentIdx]), array: new Set([idx]), links: new Set([currentIdx]) },
          operationCount: this.operationCount,
        });
        currentIdx += currentIdx & -currentIdx;
      }
    }

    queryWithSteps(idx) {
      let sum = 0;
      let currentIdx = idx + 1;
      this.steps.push({ message: `Querying prefix sum up to index ${idx}.`, highlights: { array: new Set([idx]), tree: new Set(), links: new Set() } });
      
      while (currentIdx > 0) {
        this.incrementOp();
        sum += this.tree[currentIdx];
        this.steps.push({
          message: `Query: Add tree[${currentIdx}] (${this.tree[currentIdx]}) to sum. Current sum: ${sum}.`,
          highlights: { tree: new Set([currentIdx]), array: new Set(Array.from({length: idx + 1}, (_, i) => i)), links: new Set([currentIdx]) },
          operationCount: this.operationCount,
        });
        currentIdx -= currentIdx & -currentIdx;
      }
      this.steps.push({ message: `Prefix sum for index ${idx} is ${sum}.`, highlights: { array: new Set(), tree: new Set(), links: new Set() } });
      return sum;
    }
    
    rangeQueryWithSteps(l, r) {
        this.steps.push({ message: `Starting range query from index ${l} to ${r}.`, highlights: { array: new Set(Array.from({length: r - l + 1}, (_, i) => i + l)), tree: new Set(), links: new Set() } });
        const sumR = this.queryWithSteps(r);
        const sumL_minus_1 = l > 0 ? this.queryWithSteps(l - 1) : 0;
        const result = sumR - sumL_minus_1;
        this.steps.push({ message: `Range sum [${l}, ${r}] = (Sum to ${r}) - (Sum to ${l-1}) = ${sumR} - ${sumL_minus_1} = ${result}.`, highlights: { array: new Set(), tree: new Set(), links: new Set() } });
        return result;
    }
  }

  // --- Component Effects ---
  useEffect(() => {
    const ft = new FenwickTreeWithSteps(array);
    setTree([...ft.tree]);
    setAnimationSteps(ft.steps);
    setCurrentStep(ft.steps.length - 1);
    setHighlightedIndices({ tree: new Set(), array: new Set(), links: new Set() });
  }, [array]);

  useEffect(() => {
    if (!isPlaying || currentStep >= animationSteps.length - 1) {
      if (currentStep >= animationSteps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 600);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, animationSteps.length]);

  useEffect(() => {
    if (animationSteps.length === 0) return;
    const step = animationSteps[currentStep];
    if (step) {
      setHighlightedIndices(step.highlights);
      setCurrentOperation(step);
    }
  }, [currentStep, animationSteps]);

  // --- Event Handlers ---
  const executeOperation = (type) => {
    operationStartTime.current = performance.now();
    setQueryResult(null);
    setRangeQueryResult(null);

    const ft = new FenwickTreeWithSteps(array);
    ft.steps = [];

    if (type === 'update') {
      const newArray = [...array];
      newArray[updateParams.idx] = updateParams.val;
      setArray(newArray); // This triggers a rebuild.
      trackOperation(type, operationStartTime.current);
      return;
    }
    if (type === 'query') {
      const result = ft.queryWithSteps(prefixQueryIdx);
      ft.steps.push({ message: `Query complete. Result: ${result}`, highlights: { tree: new Set(), array: new Set(), links: new Set() } });
      setQueryResult(result);
    } else if (type === 'range_query') {
      const result = ft.rangeQueryWithSteps(queryRange.l, queryRange.r);
      ft.steps.push({ message: `Range query complete. Result: ${result}`, highlights: { tree: new Set(), array: new Set(), links: new Set() } });
      setRangeQueryResult(result);
    }
    
    setAnimationSteps(ft.steps);
    setCurrentStep(0);
    setIsPlaying(true);
    trackOperation(type, operationStartTime.current);
  };

  const handleArrayChange = (e) => {
    let newArray = e.target.value.split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    if (newArray.length > MAX_ARRAY_SIZE) {
      newArray = newArray.slice(0, MAX_ARRAY_SIZE);
      setInputWarning(`Input limited to ${MAX_ARRAY_SIZE} elements.`);
      setTimeout(() => setInputWarning(''), 3000);
    } else { setInputWarning(''); }
    setArray(newArray);
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(animationSteps.length - 1);
  };
  const handleNextStep = () => { if (currentStep < animationSteps.length - 1) { setIsPlaying(false); setCurrentStep(currentStep + 1); } };
  const handlePrevStep = () => { if (currentStep > 0) { setIsPlaying(false); setCurrentStep(currentStep - 1); } };
  const handleScrub = (e) => { setIsPlaying(false); setCurrentStep(parseInt(e.target.value, 10)); };

  return (
    <div className="fenwick-tree-visualizer p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans rounded-lg shadow-md transition-colors duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Interactive Fenwick Tree (BIT)</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Use the controls to build the tree, run queries, or update values. Click 'Play' to see a step-by-step animation.
        </p>
      </div>

      <div className="controls my-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="font-medium text-sm sm:text-base whitespace-nowrap">Array:</label>
                <input type="text" value={array.join(', ')} onChange={handleArrayChange} className="px-3 py-2 border rounded-md w-full text-sm sm:text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" placeholder="e.g., 1, 3, 5, 7" />
              </div>
              {inputWarning && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{inputWarning}</p>}
            </div>
            <AnimationControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} onNext={handleNextStep} onPrev={handlePrevStep} currentStep={currentStep} totalSteps={animationSteps.length > 0 ? animationSteps.length -1 : 0} onScrub={handleScrub} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Operations</h3>
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <label className="font-medium text-sm sm:text-base">Update Idx:</label>
                        <input type="number" value={updateParams.idx} onChange={(e) => setUpdateParams({...updateParams, idx: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                        <span className="text-slate-500 dark:text-slate-400">to val:</span>
                        <input type="number" value={updateParams.val} onChange={(e) => setUpdateParams({...updateParams, val: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" />
                        <button onClick={() => executeOperation('update')} className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full sm:w-auto ml-auto">Run</button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <label className="font-medium text-sm sm:text-base">Prefix Sum at Idx:</label>
                        <input type="number" value={prefixQueryIdx} onChange={(e) => setPrefixQueryIdx(parseInt(e.target.value) || 0)} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                        <button onClick={() => executeOperation('query')} className="px-3 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto ml-auto">Run</button>
                    </div>
                    {queryResult !== null && <p className="text-center mt-2 font-bold text-lg">Result: <span className="text-sky-500">{queryResult}</span></p>}
                </div>
                <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <label className="font-medium text-sm sm:text-base">Range Sum:</label>
                        <input type="number" value={queryRange.l} onChange={(e) => setQueryRange({...queryRange, l: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                        <span className="text-slate-500 dark:text-slate-400">to</span>
                        <input type="number" value={queryRange.r} onChange={(e) => setQueryRange({...queryRange, r: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                        <button onClick={() => executeOperation('range_query')} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto ml-auto">Run</button>
                    </div>
                     {rangeQueryResult !== null && <p className="text-center mt-2 font-bold text-lg">Result: <span className="text-green-500">{rangeQueryResult}</span></p>}
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="visualization-area p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <FenwickTreeVisualization array={array} tree={tree} highlightedIndices={highlightedIndices} isDarkMode={isDarkMode} />
        </div>
        <div className="step-display">
            <h3 className="text-md sm:text-lg font-semibold mb-2">Animation Step</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 min-h-[80px] text-sm sm:text-base">
              {animationSteps[currentStep] && <p><strong>Step {currentStep + 1}:</strong> {animationSteps[currentStep].message}</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const AnimationControls = React.memo(({ isPlaying, onPlayPause, onReset, onNext, onPrev, currentStep, totalSteps, onScrub }) => (
  <div className="animation-controls p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onPrev} disabled={currentStep === 0} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><PrevIcon /></button>
        <button onClick={onPlayPause} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
        <button onClick={onNext} disabled={currentStep >= totalSteps} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><NextIcon /></button>
      </div>
      <div className="text-sm font-mono whitespace-nowrap text-slate-600 dark:text-slate-300">Step: {currentStep + 1} / {totalSteps + 1}</div>
      <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><ResetIcon /></button>
    </div>
    <input type="range" min="0" max={totalSteps} value={currentStep} onChange={onScrub} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer" />
  </div>
));

const FenwickTreeVisualization = React.memo(({ array, tree, highlightedIndices, isDarkMode }) => {
    const n = array.length;
    if (n === 0) {
        return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Enter an array to build the tree.</div>;
    }

    const boxSize = 50;
    const boxMargin = 10;
    const totalWidth = n * (boxSize + boxMargin);
    const svgHeight = 250;

    const links = useMemo(() => {
        const generatedLinks = [];
        for (let i = 1; i <= n; i++) {
            const parent = i + (i & -i);
            if (parent <= n) {
                generatedLinks.push({
                    source: i,
                    target: parent,
                });
            }
        }
        return generatedLinks;
    }, [n]);

    const getBoxCenter = (idx, isTree) => {
        const x = idx * (boxSize + boxMargin) + boxSize / 2;
        const y = isTree ? boxSize / 2 + 20 : 150 + boxSize / 2;
        return { x, y };
    };

    return (
        <div className="flex justify-center overflow-x-auto">
            <svg width={totalWidth} height={svgHeight} className="min-w-full">
                {/* Lines connecting tree nodes */}
                {links.map((link, i) => {
                    const sourcePos = getBoxCenter(link.source - 1, true);
                    const targetPos = getBoxCenter(link.target - 1, true);
                    const isHighlighted = highlightedIndices.links.has(link.source) || highlightedIndices.links.has(link.target);
                    return (
                        <motion.path
                            key={`link-${i}`}
                            d={`M ${sourcePos.x} ${sourcePos.y + boxSize/2} Q ${(sourcePos.x + targetPos.x)/2} ${sourcePos.y + boxSize} ${targetPos.x} ${targetPos.y - boxSize/2}`}
                            stroke={isHighlighted ? (isDarkMode ? '#f59e0b' : '#f59e0b') : (isDarkMode ? '#475569' : '#cbd5e1')}
                            strokeWidth={isHighlighted ? "2.5" : "1.5"}
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    );
                })}

                {/* Fenwick Tree Boxes (1-indexed) */}
                <g>
                    <text x="0" y="15" className="text-sm font-semibold fill-current text-slate-600 dark:text-slate-400">Fenwick Tree (1-indexed)</text>
                    {tree.slice(1).map((val, idx) => {
                        const treeIdx = idx + 1;
                        const isHighlighted = highlightedIndices.tree.has(treeIdx);
                        return (
                            <g key={`tree-${idx}`} transform={`translate(${idx * (boxSize + boxMargin)}, 20)`}>
                                <motion.rect
                                    width={boxSize} height={boxSize}
                                    className="fill-white dark:fill-slate-700"
                                    strokeWidth="2"
                                    rx="4"
                                    animate={{ 
                                        stroke: isHighlighted ? (isDarkMode ? '#f59e0b' : '#f59e0b') : (isDarkMode ? '#475569' : '#cbd5e1'),
                                        scale: isHighlighted ? 1.1 : 1
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <text x={boxSize / 2} y={boxSize / 2} textAnchor="middle" dy=".3em" className="font-bold text-sm fill-current text-slate-800 dark:text-slate-200">{val}</text>
                                <text x={boxSize / 2} y={boxSize + 15} textAnchor="middle" className="text-xs fill-current text-slate-500 dark:text-slate-400">{treeIdx}</text>
                            </g>
                        );
                    })}
                </g>

                {/* Original Array Boxes (0-indexed) */}
                <g>
                    <text x="0" y="145" className="text-sm font-semibold fill-current text-slate-600 dark:text-slate-400">Original Array (0-indexed)</text>
                    {array.map((val, idx) => {
                        const isHighlighted = highlightedIndices.array.has(idx);
                        return (
                            <g key={`array-${idx}`} transform={`translate(${idx * (boxSize + boxMargin)}, 150)`}>
                                <motion.rect
                                    width={boxSize} height={boxSize}
                                    className="fill-white dark:fill-slate-700"
                                    strokeWidth="2"
                                    rx="4"
                                    animate={{ 
                                        stroke: isHighlighted ? (isDarkMode ? '#38bdf8' : '#0ea5e9') : (isDarkMode ? '#475569' : '#cbd5e1'),
                                        scale: isHighlighted ? 1.1 : 1
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <text x={boxSize / 2} y={boxSize / 2} textAnchor="middle" dy=".3em" className="font-bold text-sm fill-current text-slate-800 dark:text-slate-200">{val}</text>
                                <text x={boxSize / 2} y={boxSize + 15} textAnchor="middle" className="text-xs fill-current text-slate-500 dark:text-slate-400">{idx}</text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
});

// --- Helper Components ---
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const PrevIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>;
const NextIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 5 22 12 13 19 13 5"></polygon><polygon points="2 5 11 12 2 19 2 5"></polygon></svg>;
const ResetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>;

export default InteractiveFenwickTree;
