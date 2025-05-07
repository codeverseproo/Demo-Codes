// src/CounterPage.tsx

import React, { useState } from 'react'; // Import useState for local component state if needed (like error messages)
import { useSearchParams } from 'react-router-dom'; // *** Essential: Hook to interact with URL params ***
// This hook requires the component using it to be rendered inside a Router (via App -> BrowserRouter).

function CounterPage() {
  // useSearchParams is a hook provided by react-router-dom.
  // It gives us access to the current URL's query parameters (searchParams)
  // and a function to update them (setSearchParams), which triggers a navigation.
  // This hook relies on the Router context being available.
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Read State from URL ---
  // Get the value of the 'count' parameter from the URL query string.
  // searchParams.get('count') returns the string value or null if the parameter is not present.
  const countParam = searchParams.get('count');

  // Local state to track if the 'count' parameter from the URL was invalid.
  // We use local state for this *transient UI display* state, not the core counter value.
  const [isCountParamInvalid, setIsCountParamInvalid] = useState(false);

  // --- Parse and Validate the count from the URL ---
  let currentCount = 0; // Default value if the parameter is missing or invalid

  // Lesson Learned: Always validate input from external sources like the URL!
  const parsedCount = Number(countParam); // Attempt to convert the string to a number

  if (countParam === null || countParam === undefined) {
      // Case 1: 'count' parameter is missing from the URL
      currentCount = 0; // Use the default value
      if(isCountParamInvalid) setIsCountParamInvalid(false); // Clear any previous invalid state
  } else if (isNaN(parsedCount)) {
      // Case 2: 'count' parameter is present but is not a valid number
      currentCount = 0; // Use the default value
      // Set local state to indicate that the parameter from the URL was invalid
      if(!isCountParamInvalid) setIsCountParamInvalid(true);
  } else {
      // Case 3: 'count' parameter is present and is a valid number
      currentCount = parsedCount; // Use the valid number from the URL
      if(isCountParamInvalid) setIsCountParamInvalid(false); // Clear any previous invalid state
  }

  // --- Read the optional 'mode' parameter from the URL ---
  // Get the value of the 'mode' parameter, default to 'none' if missing.
  const mode = searchParams.get('mode') || 'none';

  // --- UI Interaction -> Update URL ---
  // These functions handle button clicks and update the URL, which in turn
  // causes the component to re-render with the new state from the URL.

  const handleIncrement = () => {
    const newCount = currentCount + 1;
    // Lesson Learned: Always create a *new* URLSearchParams object based on the current one
    // before making any modifications (.set(), .delete()). The object returned by useSearchParams is immutable!
    const newSearchParams = new URLSearchParams(searchParams);

    // Update the 'count' parameter. Only set it if the new count is not the default (0).
    if (newCount !== 0) {
       newSearchParams.set('count', newCount.toString()); // Convert number back to string for URL
    } else {
       // If the new count is 0, remove the parameter entirely to keep the URL clean
       newSearchParams.delete('count');
    }
    // Set the 'mode' parameter to 'increment'
    newSearchParams.set('mode', 'increment');

    // Update the URL using setSearchParams.
    // { replace: true } is important here for frequently changing state like counters or search inputs.
    // It replaces the current entry in the browser's history stack instead of pushing a new one,
    // preventing the user from having to click "back" through every single state change.
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleDecrement = () => {
    const newCount = currentCount - 1;
    const newSearchParams = new URLSearchParams(searchParams); // Copy again!

     // Update the 'count' parameter. Only set it if the new count is not the default (0).
     if (newCount !== 0) {
       newSearchParams.set('count', newCount.toString()); // Convert number back to string for URL
    } else {
       // If the new count is 0, remove the parameter entirely
       newSearchParams.delete('count');
    }
    // Set the 'mode' parameter to 'decrement'
    newSearchParams.set('mode', 'decrement');

    // Update the URL, replacing the current history entry.
    setSearchParams(newSearchParams, { replace: true });
  };

  // Handler to clear the 'mode' parameter from the URL
   const handleClearMode = () => {
      const newSearchParams = new URLSearchParams(searchParams); // Copy!
      newSearchParams.delete('mode'); // Remove the mode parameter
      setSearchParams(newSearchParams, { replace: true }); // Update URL
   }

  // --- UI Display ---
  return (
    <div>
      <h2>URL Counter</h2>
      {/* Display a warning message if the 'count' parameter from the URL was invalid */}
      {isCountParamInvalid && (
          <p style={{ color: 'red' }}>Warning: Invalid 'count' parameter in URL. Defaulting to 0.</p>
      )}
      {/* Display the current count, which is derived from the URL state */}
      <p>Current Count: {currentCount}</p>
      {/* Display the current mode, which is derived from the URL state */}
      <p>Current Mode: {mode}</p>

      {/* Buttons to increment/decrement and clear mode */}
      <div>
        <button onClick={handleIncrement} style={{ marginRight: '10px' }}>Increment</button>
        <button onClick={handleDecrement} style={{ marginRight: '10px' }}>Decrement</button>
         {/* Only show the Clear Mode button if the mode is not the default 'none' */}
         {mode !== 'none' && <button onClick={handleClearMode}>Clear Mode</button>}
      </div>
    </div>
  );
}

// Export the component as the default export
export default CounterPage;

