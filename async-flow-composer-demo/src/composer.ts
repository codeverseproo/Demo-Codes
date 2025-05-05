// src/composer.ts
// Enhanced simplified TaskFlowComposer focusing on basic dependency execution and clearer logging.

import { GraphDefinition, TaskDefinition, TaskState, TaskExecutionResult, TaskFunction } from './types';
import { availableTasks } from './tasks'; // Our map of task names to functions

export class TaskFlowComposer {
    private graph: GraphDefinition;
    private taskStates: Map<string, TaskState>;
    private taskResults: Map<string, TaskExecutionResult>;
    private dependencyCounts: Map<string, number>; // How many dependencies each task is waiting for
    private dependentTasks: Map<string, string[]>; // Map: task -> list of tasks that depend ON IT
    private runnableTasks: string[]; // Queue of tasks ready to be scheduled
    private initialInputs: any; // Store initial inputs

    // A way to resolve the main promise when the flow is complete
    private resolveFlow!: (results: Map<string, TaskExecutionResult>) => void;
    private rejectFlow!: (error: Error) => void;


    // Constructor: Initializes state and dependency maps.
    constructor(graph: GraphDefinition) {
        console.log('Initializing Enhanced Simplified TaskFlow Composer...');
        this.graph = graph;
        this.taskStates = new Map();
        this.taskResults = new Map();
        this.dependencyCounts = new Map();
        this.dependentTasks = new Map();
        this.runnableTasks = [];
        this.initialInputs = {};

        // Build internal state and dependency maps from the graph definition
        for (const taskDef of graph.tasks) {
            // Basic validation: Ensure task names are unique
            if (this.taskStates.has(taskDef.name)) {
                 throw new Error(`Graph validation failed: Duplicate task name "${taskDef.name}"`);
            }

            // Initialize state and results
            this.taskStates.set(taskDef.name, TaskState.Pending);
            this.taskResults.set(taskDef.name, { state: TaskState.Pending }); // Simplified result

            // Calculate how many dependencies each task is waiting for
            this.dependencyCounts.set(taskDef.name, taskDef.dependencies?.length || 0);

            // Build the reverse map: task -> list of tasks that depend ON IT
            if (taskDef.dependencies) {
                for (const depName of taskDef.dependencies) {
                    // Basic validation: check if the dependency task exists
                    if (!graph.tasks.find(t => t.name === depName)) {
                        throw new Error(`Graph validation failed: Task "${taskDef.name}" depends on non-existent task "${depName}"`);
                    }
                    if (!this.dependentTasks.has(depName)) {
                        this.dependentTasks.set(depName, []);
                    }
                    // Add the current task to the list of dependents for its dependency
                    this.dependentTasks.get(depName)!.push(taskDef.name);
                }
            }

            // If a task has no dependencies, it's ready to run immediately
            if ((taskDef.dependencies?.length || 0) === 0) {
                this.runnableTasks.push(taskDef.name);
            }
        }

         console.log(`Composer initialized with ${this.graph.tasks.length} tasks. Initial runnable: [${this.runnableTasks.join(', ')}]`);
    }

    // The main execution method.
    // Takes initial inputs and runs the flow.
    async execute(initialInputs: any = {}): Promise<Map<string, TaskExecutionResult>> {
        console.log('Starting enhanced simplified flow execution...');
        this.initialInputs = initialInputs; // Store initial inputs

        return new Promise(async (resolve, reject) => {
            this.resolveFlow = resolve;
            this.rejectFlow = reject;

            // Start the execution loop.
            // In this simplified version, we'll just process the runnable queue
            // sequentially for clarity, not concurrently.
            await this.processQueue();
        });
    }

    // Helper method to process tasks from the runnable queue sequentially.
    private async processQueue(): Promise<void> {
        // Keep processing as long as there are tasks ready
        while (this.runnableTasks.length > 0) {
            const taskName = this.runnableTasks.shift(); // Get the next task

            if (!taskName) continue; // Should not happen if length > 0

            // Double check state - ensure it's still pending
            if (this.taskStates.get(taskName) !== TaskState.Pending) {
                 console.log(`Task ${taskName} state changed while in queue (${this.taskStates.get(taskName)}). Skipping.`);
                continue;
            }

            console.log(`\n--- Scheduling task: ${taskName} ---`); // Clearer log for task start
            this.taskStates.set(taskName, TaskState.Running);

            const taskDef = this.graph.tasks.find(t => t.name === taskName)!;
            // Look up the actual task function by name
            const taskFn = availableTasks[taskDef.task as keyof typeof availableTasks] as TaskFunction;

            if (!taskFn) {
                 console.error(`Composer Error: Task function "${taskDef.task}" not found for node "${taskName}"!`);
                 // In this simplified version, we'll mark as skipped if function is missing
                 this.handleTaskCompletion(taskName, { state: TaskState.Skipped, output: new Error(`Task function "${taskDef.task}" not found`) });
                 continue; // Move to the next task in the queue
            }

            try {
                // --- Enhancement: Log inputs being passed ---
                console.log(`   Passing inputs to ${taskName}:`, JSON.stringify(this.initialInputs)); // Use JSON.stringify for clarity
                // Execute the task, passing initial inputs.
                const output = await taskFn(this.initialInputs); // Pass initial inputs directly
                // If successful, call completion handler
                this.handleTaskCompletion(taskName, { state: TaskState.Completed, output });
            } catch (error: any) {
                 console.error(`Task Error: Task "${taskName}" failed:`, error?.message); // Clearer error log
                 // In this simplified version, any task failure marks it as Failed
                 // and its dependents will be skipped. No retries or specific handlers.
                 this.handleTaskCompletion(taskName, { state: TaskState.Failed, output: error }); // Use TaskState.Failed
            }
             // After completing one task, the loop continues to pick the next runnable.
        }

        // After the loop finishes, check if the whole flow is done.
        this.checkCompletion(); // Corrected method call
    }


    // Helper method to handle task completion (success or failure).
    private handleTaskCompletion(taskName: string, result: TaskExecutionResult): void {
        console.log(`--- Task ${taskName} finished with state: ${result.state} ---`); // Clearer log for task end

        // Update state and results
        this.taskStates.set(taskName, result.state);
        this.taskResults.set(taskName, result);

        // If successful, notify dependents so they can check if they are ready
        if (result.state === TaskState.Completed) {
            this.scheduleDependents(taskName);
        } else if (result.state === TaskState.Failed) { // Corrected TaskState.Failed reference
             // If a task failed, mark its dependents as skipped in this simplified model.
             console.log(`Task ${taskName} failed. Checking dependents to mark as Skipped...`); // Added log
            const dependents = this.dependentTasks.get(taskName) || [];
            for(const depName of dependents) {
                 if (this.taskStates.get(depName) === TaskState.Pending) {
                    console.log(`-> Task ${depName} depends on failed task ${taskName}. Marking as Skipped.`);
                     this.handleTaskCompletion(depName, { state: TaskState.Skipped }); // Mark dependent as skipped
                 }
            }
        } else if (result.state === TaskState.Skipped) { // Added logging for skipped tasks
             console.log(`Task ${taskName} was skipped. Checking dependents to mark as Skipped...`);
             const dependents = this.dependentTasks.get(taskName) || [];
             for(const depName of dependents) {
                  if (this.taskStates.get(depName) === TaskState.Pending) {
                     console.log(`-> Task ${depName} depends on skipped task ${taskName}. Marking as Skipped.`);
                      this.handleTaskCompletion(depName, { state: TaskState.Skipped }); // Mark dependent as skipped
                  }
             }
        }


        // After handling completion/failure and propagation, check if the whole flow is done.
        // The processQueue loop will continue if there are still runnable tasks.
        this.checkCompletion(); // Corrected method call
    }

    // Helper method: Notify Dependents and Schedule.
    // Called when a task completes successfully. Decrements dependency counts for tasks that depend on it.
    private scheduleDependents(completedTaskName: string): void {
        const dependents = this.dependentTasks.get(completedTaskName) || [];
        console.log(`Task ${completedTaskName} completed. Checking dependents: [${dependents.join(', ')}]`);

        for (const depName of dependents) {
            const currentDepState = this.taskStates.get(depName);

            // We only care about dependents that are still waiting
            if (currentDepState === TaskState.Pending) {
                 // Decrement the count of dependencies this dependent task is waiting for
                 const remaining = (this.dependencyCounts.get(depName) || 0) - 1;
                 this.dependencyCounts.set(depName, remaining);
                 console.log(`- Dependency count for ${depName} is now ${remaining} (after ${completedTaskName})`);

                 // Check if ALL dependencies for this task are now met (count is zero)
                 const dependenciesMet = remaining === 0;

                 // Crucially, check if ALL dependencies finished SUCCESSFULLY
                 const depTaskDef = this.graph.tasks.find(t => t.name === depName)!;
                 const allDependenciesSuccessful = depTaskDef.dependencies!
                     .every(dep => this.taskStates.get(dep) === TaskState.Completed);


                // If dependencies are met AND all were successful, add to runnable queue
                if (dependenciesMet && allDependenciesSuccessful) {
                     console.log(`-> Dependencies met successfully for ${depName}. Adding to runnable queue.`);
                    this.runnableTasks.push(depName);
                    // The processQueue loop will pick this up next.
                } else if (dependenciesMet && !allDependenciesSuccessful) {
                     // Dependencies are met, but one or more dependencies failed/skipped.
                     // This task cannot run successfully in this simplified model.
                     console.log(`-> Dependencies met for ${depName}, but a dependency failed or skipped. Marking ${depName} as Skipped.`);
                     this.handleTaskCompletion(depName, { state: TaskState.Skipped, output: new Error('One or more dependencies failed or were skipped') });
                }
                 // If not dependenciesMet, it's still waiting for other dependencies. Do nothing yet.
            } else {
                 console.log(`- Dependent ${depName} is not Pending (is ${currentDepState}). Ignoring.`);
            }
        }
    }

     // Note: Input gathering logic is removed in this simplified version.
     // Tasks directly access properties from the initialInputs object passed to execute().

     // This method checks if the entire flow is finished (all tasks in a final state).
     private checkCompletion(): void {
         const totalTasks = this.graph.tasks.length;
         let completedOrFinal = 0;
         for (const state of this.taskStates.values()) {
             if (state === TaskState.Completed || state === TaskState.Failed || state === TaskState.Skipped) {
                 completedOrFinal++;
             }
         }

         if (completedOrFinal === totalTasks) {
             console.log('All tasks reached a final state. Flow finished.');
             this.resolveFlow(this.taskResults); // Resolve the main execute promise
         }
     }
}

