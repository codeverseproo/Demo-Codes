class FenwickTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (self.n + 1) # Fenwick Trees are often 1-indexed
        # Build the tree by updating each element
        for i in range(self.n):
            self.update(i, arr[i])

    def update(self, idx, val):
        # Update an element at index `idx` with `val`
        # Note: For point updates, we usually update with the *difference*
        # between the new value and the old value. This example assumes
        # `val` is the difference to be added.
        idx += 1  # Convert to 1-based indexing
        while idx <= self.n:
            self.tree[idx] += val
            idx += idx & (-idx) # Move to the next relevant parent

    def query(self, idx):
        # Get the prefix sum up to index `idx`
        idx += 1  # Convert to 1-based indexing
        s = 0
        while idx > 0:
            s += self.tree[idx]
            idx -= idx & (-idx) # Move to the next relevant parent
        return s

    def range_query(self, l, r):
        # Get the sum of a range [l, r]
        # This is simply (sum up to r) - (sum up to l-1)
        return self.query(r) - self.query(l - 1)


