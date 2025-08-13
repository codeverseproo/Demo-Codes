# Fenwick Trees (Binary Indexed Trees): Fast Prefix Sums and Point Updates

Welcome to the Fenwick Tree section! Here, you'll find a concise and efficient implementation of a Fenwick Tree (also known as a Binary Indexed Tree, or BIT) in Python. This data structure is a true gem for specific types of problems, especially when you need lightning-fast prefix sums and individual element updates.

## What is a Fenwick Tree?

Imagine you have a list of numbers, and you frequently need to answer two types of questions:
1.  "What's the sum of all numbers from the beginning of the list up to a certain point?" (Prefix Sum)
2.  "I need to change the value of a single number in the list." (Point Update)

A naive approach would be slow for large lists. A Fenwick Tree uses a clever trick with binary numbers to handle both these operations incredibly fast. It's like a specialized ladder where each rung helps you quickly jump to specific points to gather or update information.

## Why Use It?

*   **Super Efficient Prefix Sums:** Get the sum of elements from the start of your data up to any given point in `O(log N)` time.
*   **Fast Point Updates:** Change a single value in your original data, and the tree updates its internal structure quickly, also in `O(log N)` time.
*   **Memory Friendly:** Compared to Segment Trees, Fenwick Trees often use less memory, making them very compact.
*   **Specialized Power:** While Segment Trees are more general for range queries, Fenwick Trees truly shine when your primary operations are prefix sums and point updates.

## How It Works (The Core Idea)

The magic of the Fenwick Tree lies in how it uses the binary representation of indices. Each node in the tree doesn't store the sum of a contiguous range like a Segment Tree. Instead, it stores a sum of a specific range that ends at its index, determined by its rightmost set bit. This allows for efficient traversal up and down the tree to perform updates and queries.

The key operation `idx += idx & (-idx)` (for updates) and `idx -= idx & (-idx)` (for queries) is what makes it so efficient. This little binary trick helps the tree navigate its internal structure to quickly find the relevant nodes.

## Files in This Directory

*   `fenwick_tree.py`: Contains the `FenwickTree` class implementation.
*   `example.py`: A simple script demonstrating how to use the `FenwickTree` for building, querying prefix sums, and handling updates.

## Getting Started with the Code

To run the example and see the Fenwick Tree in action, navigate to this directory in your terminal and execute:

```bash
python3 example.py
```

You'll see the original array's prefix sums and range sums, and then how they change after an update. Remember, for updates, you typically pass the *difference* between the new value and the old value to the `update` method.

## Code Structure (fenwick_tree.py)

*   `__init__(self, arr)`: Initializes the Fenwick Tree with an array. It builds the tree by performing point updates for each element.
*   `update(self, idx, val)`: Updates the value at a specific index `idx` by adding `val` to it. This propagates the change through the tree.
*   `query(self, idx)`: Returns the prefix sum (sum of elements from index 0 up to `idx`).
*   `range_query(self, l, r)`: Returns the sum of elements within a specific range `[l, r]` by leveraging prefix sums.

Dive into the code, experiment with it, and discover the elegance and efficiency of Fenwick Trees!

