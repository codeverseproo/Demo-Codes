// stateClone.ts

// Let's define our transformation function. Its job:
// Take *any* value (our Current State)
// Figure out what kind of state it is
// Return a *new* value (the Next State) that's a clone.

function deepClone(currentState: any): any {
    // Console logs are our window into the state!
    // console.log(`[DEBUG] Processing state of type: ${typeof currentState}`, currentState);

    // Step 1: The Base States.
    // When are we done transforming? When the state is simple:
    // null, undefined, numbers, strings, booleans, symbols, bigints.
    // These aren't complex structures containing other states.
    // The "transformation" here is just returning the value itself.
    if (currentState === null || typeof currentState !== 'object') {
        // Yep, this state is simple. We're done with this branch.
        // console.log(`[DEBUG] -> Base case reached. Returning:`, currentState);
        return currentState;
    }

    // Okay, if we're here, 'currentState' is an object, but not null.
    // What kind of complex state is it? Array? Object? Something else?

    // Step 2: Transforming the Array State.
    // If the Current State is an Array...
    if (Array.isArray(currentState)) {
        // console.log(`[DEBUG] -> State is an Array (${currentState.length} elements). Mapping transformation...`);
        // The transformation for an Array state:
        // 1. Create a brand new, empty array.
        // 2. For *each element* inside the original array state,
        //    apply our *same deepClone transformation function*.
        //    Each element *is* a 'next state' we need to process recursively.
        // 3. Collect the results into our new array.
        return currentState.map(elementState => deepClone(elementState));
        // See? We're applying the RULE (deepClone) to the CONTENTS (elementState).
        // Not thinking about layers, just applying the rule to the inner states.
    }

    // Step 3: Transforming the Object State.
    // If it wasn't null or an array, maybe it's a plain object?
    if (typeof currentState === 'object') { // Already ruled out null above
        // console.log(`[DEBUG] -> State is a plain Object (${Object.keys(currentState).length} keys). Applying transformation to values...`);

        // The transformation for an Object state:
        // 1. Create a brand new, empty object.
        // 2. For *each key* in the original object state, get the *value*.
        //    Apply our *same deepClone transformation function* to that value.
        //    That value *is* the 'next state' for this key.
        // 3. Assign the transformed value to the corresponding key in our new object.
        const clonedObject: any = {}; // Start building the new state
        for (const key in currentState) {
            // Important: Only clone properties directly on the object, not inherited ones.
            if (Object.prototype.hasOwnProperty.call(currentState, key)) {
                 // Apply the deepClone transformation to the value state for this key.
                const valueState = currentState[key];
                // console.log(`[DEBUG]   -> Cloning value for key: "${key}". Current value state:`, valueState);
                clonedObject[key] = deepClone(valueState);
                // console.log(`[DEBUG]   <- Finished cloning value for key: "${key}". Result:`, clonedObject[key]);
            }
        }
        return clonedObject; // Return the newly built object state.
        // Still just applying the rule to the states *inside* the current object state.
    }

     // Step 4: Handling Other Complex Object Types (A Gotcha!)
     // Okay, what if it's an object, but not a plain object or array?
     // Like a Date, RegExp, Map, Set, or a custom class instance?
     // Our simple rule above (create a new plain object, copy keys) won't clone these correctly!
     // This is a common recursive gotcha if you only think about 'object' broadly.
     // A robust deep clone needs specific transformation rules for these states.
     // For *this* example, we'll just return the reference, highlighting the need for more specific state rules.
     console.warn(`[DEBUG] Warning: Encountered unhandled object state type (${currentState.constructor?.name || typeof currentState}). Returning original reference.`);
     return currentState; // This won't be a deep clone for these types!
}

// Let's put our State Transformation Function to work!
const originalConfig = {
    app: "MySweetApp",
    version: 2.1,
    settings: {
        theme: "dark",
        notifications: [ // Array state inside object state!
            { type: "email", enabled: true }, // Object state inside array state!
            { type: "sms", enabled: false }
        ],
        features: { // Object state inside object state!
            beta: false
        }
    },
    users: null, // Base state!
    launchDate: new Date('2023-01-01'), // Example of a state we didn't handle well yet!
    circularRef: undefined // Another base state!
};

console.log("--- Starting Clone Process ---");
console.log("Initial State:", originalConfig);
console.log("------------------------------\n");

const clonedConfig = deepClone(originalConfig);

console.log("\n--- Clone Process Complete ---\n");
console.log("Final Cloned State:", clonedConfig);
console.log("------------------------------\n");

// Let's do some checks. Are the top level and nested parts actually *new* states (different references)?
console.log("Are originalConfig and clonedConfig the same object?", originalConfig === clonedConfig); // Should be false
console.log("Are originalConfig.settings and clonedConfig.settings the same object?", originalConfig.settings === clonedConfig.settings); // Should be false
console.log("Are originalConfig.settings.notifications and clonedConfig.settings.notifications the same array?", originalConfig.settings.notifications === clonedConfig.settings.notifications); // Should be false
console.log("Are the first notification objects the same?", originalConfig.settings.notifications[0] === clonedConfig.settings.notifications[0]); // Should be false
console.log("Is the Date object cloned?", originalConfig.launchDate === clonedConfig.launchDate); // Should be true (due to our unhandled state) - This is a bug/limitation!
