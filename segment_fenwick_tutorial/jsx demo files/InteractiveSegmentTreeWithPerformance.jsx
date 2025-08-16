// components/InteractiveSegmentTreeWithPerformance.jsx
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
const MAX_ARRAY_SIZE = 50;

/**
 * A fully responsive, dark-theme enabled, interactive component for visualizing Segment Tree data structures.
 * It includes detailed performance metrics, step-by-step animations, and input limitations for stability.
 */
const InteractiveSegmentTreeWithPerformance = ({ initialArray = [1, 3, 5, 7, 9, 11] }) => {
  const [array, setArray] = useState(initialArray.slice(0, MAX_ARRAY_SIZE));
  const [tree, setTree] = useState([]);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [operationType, setOperationType] = useState('build');
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [queryRange, setQueryRange] = useState({ l: 0, r: initialArray.length - 1 });
  const [updateParams, setUpdateParams] = useState({ idx: 0, val: 0 });
  const [inputWarning, setInputWarning] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  // Effect to manage the theme based on Tailwind's class-based approach
  useEffect(() => {
    const root = window.document.documentElement;
    setIsDarkMode(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDarkMode(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    operationHistory: [],
    renderTimes: [],
    memoryUsage: [],
    totalOperations: 0,
    averageRenderTime: 0,
    peakMemoryUsage: 0
  });
  
  const [currentOperation, setCurrentOperation] = useState(null);
  const operationStartTime = useRef(null);

  // --- Performance Tracking Logic ---
  const trackOperation = useCallback((operationType, startTime) => {
    const duration = performance.now() - startTime;
    const memoryInfo = performance.memory ? { used: performance.memory.usedJSHeapSize / 1024 / 1024 } : { used: 0 };
    setPerformanceMetrics(prev => ({
      ...prev,
      operationHistory: [...prev.operationHistory, { type: operationType, duration, complexity: getComplexityForOperation(operationType, array.length) }].slice(-50),
      memoryUsage: [...prev.memoryUsage, memoryInfo.used].slice(-50),
      totalOperations: prev.totalOperations + 1,
      peakMemoryUsage: Math.max(prev.peakMemoryUsage, memoryInfo.used)
    }));
  }, [array.length]);

  const getComplexityForOperation = (operation, arraySize) => {
    const logN = arraySize > 1 ? Math.ceil(Math.log2(arraySize)) : 1;
    switch (operation) {
      case 'build': return { time: `O(n) = O(${arraySize})` };
      case 'query': return { time: `O(log n) = O(${logN})` };
      case 'update': return { time: `O(log n) = O(${logN})` };
      default: return { time: 'O(1)' };
    }
  };

  // --- Segment Tree Class ---
  class PerformanceSegmentTree {
    constructor(arr) {
      this.n = arr.length;
      this.tree = new Array(4 * this.n).fill(0);
      this.steps = [];
      this.operationCount = 0;
      if (this.n > 0) this.build(arr, 0, 0, this.n - 1);
    }
    incrementOp() { this.operationCount++; }
    build(arr, treeIdx, lo, hi) {
      this.incrementOp();
      this.steps.push({ type: 'build', treeIdx, message: `Building node ${treeIdx} [${lo}, ${hi}]`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(n)' });
      if (lo === hi) {
        this.tree[treeIdx] = arr[lo];
        this.incrementOp();
        this.steps.push({ type: 'assign', treeIdx, message: `Leaf ${treeIdx} = arr[${lo}] = ${arr[lo]}`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(1)' });
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      this.build(arr, 2 * treeIdx + 1, lo, mid);
      this.build(arr, 2 * treeIdx + 2, mid + 1, hi);
      this.tree[treeIdx] = this.tree[2 * treeIdx + 1] + this.tree[2 * treeIdx + 2];
      this.incrementOp();
      this.steps.push({ type: 'combine', treeIdx, value: this.tree[treeIdx], message: `Node ${treeIdx} = ${this.tree[2 * treeIdx + 1]} + ${this.tree[2 * treeIdx + 2]} = ${this.tree[treeIdx]}`, highlightNodes: [treeIdx, 2 * treeIdx + 1, 2 * treeIdx + 2], operationCount: this.operationCount, complexity: 'O(1)' });
    }
    queryWithSteps(treeIdx, lo, hi, l, r) {
      this.incrementOp();
      this.steps.push({ type: 'query_visit', treeIdx, message: `Visiting ${treeIdx} [${lo}, ${hi}] for query [${l}, ${r}]`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(log n)' });
      if (r < lo || hi < l) {
        this.steps.push({ type: 'query_reject', treeIdx, message: `No overlap. Return 0.`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(1)' });
        return 0;
      }
      if (l <= lo && hi <= r) {
        this.steps.push({ type: 'query_accept', treeIdx, value: this.tree[treeIdx], message: `Complete overlap. Return ${this.tree[treeIdx]}.`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(1)' });
        return this.tree[treeIdx];
      }
      const mid = Math.floor((lo + hi) / 2);
      const p1 = this.queryWithSteps(2 * treeIdx + 1, lo, mid, l, r);
      const p2 = this.queryWithSteps(2 * treeIdx + 2, mid + 1, hi, l, r);
      const result = p1 + p2;
      this.steps.push({ type: 'query_combine', treeIdx, result, message: `Combine: ${p1} + ${p2} = ${result}`, highlightNodes: [treeIdx], operationCount: this.operationCount, complexity: 'O(1)' });
      return result;
    }
  }

  // --- Component Effects ---
  useEffect(() => {
    operationStartTime.current = performance.now();
    const st = new PerformanceSegmentTree(array);
    setTree([...st.tree]);
    st.steps.push({ message: `Tree built successfully for [${array.join(', ')}]. Ready for operations.`, highlightNodes: [] });
    setAnimationSteps(st.steps);
    setCurrentStep(st.steps.length - 1);
    setHighlightedNodes(new Set());
    trackOperation('build', operationStartTime.current);
  }, [array, trackOperation]);

  useEffect(() => {
    if (!isPlaying || currentStep >= animationSteps.length -1) {
      if (currentStep >= animationSteps.length -1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, animationSteps.length]);

  useEffect(() => {
    if (animationSteps.length === 0) return;
    const step = animationSteps[currentStep];
    if (step) {
      setHighlightedNodes(new Set(step.highlightNodes));
      setCurrentOperation(step);
    }
  }, [currentStep, animationSteps]);

  // --- Event Handlers ---
  const executeOperation = (type) => {
    operationStartTime.current = performance.now();
    setQueryResult(null); // Clear previous result
    if (type === 'update') {
      const newArray = [...array];
      newArray[updateParams.idx] = updateParams.val;
      setArray(newArray); // Triggers rebuild and animation
      return;
    }
    const st = new PerformanceSegmentTree(array);
    st.steps = [];
    const result = st.queryWithSteps(0, 0, array.length - 1, queryRange.l, queryRange.r);
    st.steps.push({ message: `Query complete. Result: ${result}`, highlightNodes: [] });
    setQueryResult(result);
    setAnimationSteps(st.steps);
    setCurrentStep(0);
    setOperationType(type);
    setIsPlaying(true);
    trackOperation(type, operationStartTime.current);
  };

  const handleArrayChange = (e) => {
    let newArray = e.target.value.split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    if (newArray.length > MAX_ARRAY_SIZE) {
      newArray = newArray.slice(0, MAX_ARRAY_SIZE);
      setInputWarning(`Input limited to ${MAX_ARRAY_SIZE} elements for performance.`);
      setTimeout(() => setInputWarning(''), 3000);
    } else {
      setInputWarning('');
    }
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

  // --- Memoized Chart Data ---
  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: isDarkMode ? '#e5e7eb' : '#4b5563' } }, title: { display: false } },
    scales: { 
      y: { beginAtZero: true, ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' }, grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
      x: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' }, grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }
    },
  }), [isDarkMode]);

  const performanceChartData = useMemo(() => ({ labels: performanceMetrics.operationHistory.map((_, i) => `Op ${i + 1}`), datasets: [{ label: 'Operation Duration (ms)', data: performanceMetrics.operationHistory.map(op => op.duration), borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)', tension: 0.4 }] }), [performanceMetrics.operationHistory]);
  const memoryChartData = useMemo(() => ({ labels: performanceMetrics.memoryUsage.map((_, i) => `${i + 1}`), datasets: [{ label: 'Memory Usage (MB)', data: performanceMetrics.memoryUsage, borderColor: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.2)', tension: 0.4 }] }), [performanceMetrics.memoryUsage]);
  const complexityChartData = useMemo(() => ({ labels: Object.keys(performanceMetrics.operationHistory.reduce((acc, op) => { acc[op.type] = (acc[op.type] || 0) + 1; return acc; }, {})), datasets: [{ label: 'Operation Count', data: Object.values(performanceMetrics.operationHistory.reduce((acc, op) => { acc[op.type] = (acc[op.type] || 0) + 1; return acc; }, {})), backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b'] }] }), [performanceMetrics.operationHistory]);

  return (
    <div className="segment-tree-visualizer p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans rounded-lg shadow-md transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Interactive Segment Tree</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Use the controls to build the tree, run queries, or update values. Click 'Play' to see a step-by-step animation.
            </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="controls mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
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
            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="font-medium text-sm sm:text-base">Query Sum:</label>
                  <input type="number" value={queryRange.l} onChange={(e) => setQueryRange({...queryRange, l: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                  <span className="text-slate-500 dark:text-slate-400">to</span>
                  <input type="number" value={queryRange.r} onChange={(e) => setQueryRange({...queryRange, r: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
                  <button onClick={() => executeOperation('query')} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto">Run</button>
              </div>
              {queryResult !== null && <p className="text-center mt-2 font-bold text-lg">Result: <span className="text-green-500">{queryResult}</span></p>}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
              <label className="font-medium text-sm sm:text-base">Update Idx:</label>
              <input type="number" value={updateParams.idx} onChange={(e) => setUpdateParams({...updateParams, idx: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" min="0" max={array.length - 1} />
              <span className="text-slate-500 dark:text-slate-400">to</span>
              <input type="number" value={updateParams.val} onChange={(e) => setUpdateParams({...updateParams, val: parseInt(e.target.value) || 0})} className="px-2 py-1 border rounded-md w-full sm:w-20 text-center bg-white dark:bg-slate-700" />
              <button onClick={() => executeOperation('update')} className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full sm:w-auto">Run</button>
            </div>
          </div>
        </div>
      </div>

      <PerformanceMetricsPanel metrics={performanceMetrics} currentOperation={currentOperation} performanceChartData={performanceChartData} memoryChartData={memoryChartData} complexityChartData={complexityChartData} chartOptions={chartOptions} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="array-display">
            <h3 className="text-md sm:text-lg font-semibold mb-2">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((val, idx) => (<motion.div key={idx} className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center font-bold text-sm sm:text-base" initial={{ scale: 1 }} animate={{ scale: updateParams.idx === idx ? 1.1 : 1, backgroundColor: updateParams.idx === idx ? (isDarkMode ? '#ca8a04' : '#fef9c3') : (isDarkMode ? '#334155' : '#ffffff') }} transition={{ duration: 0.3 }}>{val}</motion.div>))}
            </div>
          </div>
          <div className="step-display">
            <h3 className="text-md sm:text-lg font-semibold mb-2">Animation Step</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 min-h-[80px] text-sm sm:text-base">
              {animationSteps[currentStep] && <p><strong>Step {currentStep + 1}:</strong> {animationSteps[currentStep].message}</p>}
            </div>
          </div>
        </div>
        <div className="tree-display">
          <h3 className="text-md sm:text-lg font-semibold mb-2">Segment Tree</h3>
          <div className="tree-container bg-white dark:bg-slate-800 p-2 rounded-lg border dark:border-slate-700"><TreeVisualization tree={tree} arraySize={array.length} highlightedNodes={highlightedNodes} isDarkMode={isDarkMode} /></div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (themeValue) => {
      if (themeValue === 'dark' || (themeValue === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const handleChange = () => {
      if (localStorage.getItem('theme') === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
  const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
  const SystemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
  
  const options = [{ name: 'light', icon: <SunIcon/> }, { name: 'dark', icon: <MoonIcon/> }, { name: 'system', icon: <SystemIcon/> }];
  
  return (
    <div className="flex items-center p-1 rounded-full bg-slate-200 dark:bg-slate-700">
      {options.map(opt => (
        <button key={opt.name} onClick={() => setTheme(opt.name)} className={`p-1.5 rounded-full capitalize text-xs ${theme === opt.name ? 'bg-white dark:bg-slate-900 text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>
          {opt.icon}
        </button>
      ))}
    </div>
  );
};

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const PrevIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>;
const NextIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 5 22 12 13 19 13 5"></polygon><polygon points="2 5 11 12 2 19 2 5"></polygon></svg>;
const ResetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>;

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

const PerformanceMetricsPanel = React.memo(({ metrics, currentOperation, performanceChartData, memoryChartData, complexityChartData, chartOptions }) => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="performance-panel mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700">
      <div className="flex border-b dark:border-slate-700 flex-wrap">
        {['overview', 'charts', 'complexity'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium capitalize text-sm sm:text-base ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{tab}</button>))}
      </div>
      <div className="p-4">
        {activeTab === 'overview' && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center sm:text-left"><MetricCard title="Total Operations" value={metrics.totalOperations} subtitle={`Last: ${currentOperation?.type || 'N/A'}`} color="blue" /><MetricCard title="Avg Render Time" value={`${metrics.averageRenderTime.toFixed(2)}ms`} subtitle={`Renders: ${metrics.renderTimes.length}`} color="green" /><MetricCard title="Peak Memory" value={`${metrics.peakMemoryUsage.toFixed(2)}MB`} subtitle={`Current: ${metrics.memoryUsage[metrics.memoryUsage.length - 1]?.toFixed(2) || 0}MB`} color="orange" /></div>)}
        {activeTab === 'charts' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-64"><h4 className="font-semibold mb-2 text-center">Operation Performance</h4><Line data={performanceChartData} options={chartOptions} /></div><div className="h-64"><h4 className="font-semibold mb-2 text-center">Memory Usage</h4><Line data={memoryChartData} options={chartOptions} /></div><div className="lg:col-span-2 h-64"><h4 className="font-semibold mb-2 text-center">Operations Distribution</h4><div className="w-full md:w-3/4 lg:w-1/2 mx-auto h-full"><Bar data={complexityChartData} options={chartOptions} /></div></div></div>)}
        {activeTab === 'complexity' && (<div className="space-y-4 text-sm"><div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600"><h4 className="font-semibold mb-2">Algorithm Complexity</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><h5 className="font-medium">Time Complexity</h5><ul className="list-disc list-inside"><li><strong>Build:</strong> O(n)</li><li><strong>Query:</strong> O(log n)</li><li><strong>Update:</strong> O(log n)</li></ul></div><div><h5 className="font-medium">Space Complexity</h5><ul className="list-disc list-inside"><li><strong>Tree Array:</strong> O(4n)</li><li><strong>Total Ops:</strong> {metrics.totalOperations}</li></ul></div></div></div>{currentOperation && (<div className="bg-yellow-50 dark:bg-yellow-400/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-400/20 text-yellow-800 dark:text-yellow-200"><h4 className="font-semibold mb-2">Current Operation Analysis</h4><div><strong>Type:</strong> {currentOperation.type}, <strong>Complexity:</strong> {currentOperation.complexity}, <strong>Op #:</strong> {currentOperation.operationCount}</div></div>)}</div>)}
      </div>
    </div>
  );
});

const MetricCard = ({ title, value, subtitle, color }) => {
  const colors = { blue: { bg: 'dark:bg-sky-900/30 bg-blue-50', text: 'dark:text-sky-300 text-blue-800', value: 'dark:text-sky-400 text-blue-600' }, green: { bg: 'dark:bg-emerald-900/30 bg-green-50', text: 'dark:text-emerald-300 text-green-800', value: 'dark:text-emerald-400 text-green-600' }, orange: { bg: 'dark:bg-amber-900/30 bg-orange-50', text: 'dark:text-amber-300 text-orange-800', value: 'dark:text-amber-400 text-orange-600' }, };
  const c = colors[color] || colors.blue;
  return (<div className={`${c.bg} p-4 rounded-lg`}><h4 className={`font-semibold ${c.text}`}>{title}</h4><div className={`text-2xl font-bold ${c.value}`}>{value}</div><div className={`text-sm ${c.text}`}>{subtitle}</div></div>);
};

const TreeVisualization = React.memo(({ tree, arraySize, highlightedNodes, isDarkMode }) => {
  const { nodes, edges, maxLevel } = useMemo(() => {
    if (!arraySize || arraySize === 0) return { nodes: [], edges: [], maxLevel: 0 };
    const calculatedNodes = [], calculatedEdges = [], visited = new Set();
    const maxLevels = Math.ceil(Math.log2(arraySize)) + 1;
    const queue = [{ index: 0, level: 0, position: 0 }];
    const getNodePosition = (level, position, totalWidth = 800) => ({ x: (position + 0.5) * (totalWidth / Math.pow(2, level)), y: level * 80 + 40 });
    while (queue.length > 0) {
      const { index, level, position } = queue.shift();
      if (index >= tree.length || level >= maxLevels || visited.has(index)) continue;
      visited.add(index);
      const pos = getNodePosition(level, position);
      calculatedNodes.push({ index, value: tree[index], x: pos.x, y: pos.y, isHighlighted: highlightedNodes.has(index), level });
      const leftChild = 2 * index + 1, rightChild = 2 * index + 2;
      if (leftChild < tree.length && leftChild < 4 * arraySize && tree[leftChild] !== undefined) {
        queue.push({ index: leftChild, level: level + 1, position: position * 2 });
        calculatedEdges.push({ from: pos, to: getNodePosition(level + 1, position * 2), isHighlighted: highlightedNodes.has(index) && highlightedNodes.has(leftChild) });
      }
      if (rightChild < tree.length && rightChild < 4 * arraySize && tree[rightChild] !== undefined) {
        queue.push({ index: rightChild, level: level + 1, position: position * 2 + 1 });
        calculatedEdges.push({ from: pos, to: getNodePosition(level + 1, position * 2 + 1), isHighlighted: highlightedNodes.has(index) && highlightedNodes.has(rightChild) });
      }
    }
    return { nodes: calculatedNodes, edges: calculatedEdges, maxLevel: maxLevels - 1 };
  }, [tree, arraySize, highlightedNodes]);

  const svgHeight = (maxLevel + 1.5) * 80;
  if (nodes.length === 0) return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Enter an array to build the tree.</div>;

  return (
    <svg width="100%" height={svgHeight} viewBox={`0 0 800 ${svgHeight}`} className="tree-svg">
      {edges.map((edge, i) => (<motion.line key={`edge-${i}`} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} stroke={edge.isHighlighted ? '#ef4444' : (isDarkMode ? '#475569' : '#cbd5e1')} strokeWidth={edge.isHighlighted ? 2.5 : 1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />))}
      {nodes.map((node) => (<g key={`node-${node.index}`} transform={`translate(${node.x}, ${node.y})`}><motion.circle r="22" fill={node.isHighlighted ? (isDarkMode ? '#ca8a04' : '#fef9c3') : (isDarkMode ? '#1e293b' : '#ffffff')} stroke={node.isHighlighted ? '#f59e0b' : (isDarkMode ? '#475569' : '#cbd5e1')} strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: node.level * 0.05 }} /><text textAnchor="middle" dy=".3em" className={`text-sm font-bold pointer-events-none ${isDarkMode ? 'fill-slate-200' : 'fill-slate-800'}`}>{node.value}</text><text textAnchor="middle" dy="-30" className={`text-xs pointer-events-none ${isDarkMode ? 'fill-slate-400' : 'fill-slate-500'}`}>idx: {node.index}</text></g>))}
    </svg>
  );
});

export default InteractiveSegmentTreeWithPerformance;
