class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n) # We need about 4*n space for the tree
        self._build(arr, 0, 0, self.n - 1)

    def _build(self, arr, tree_idx, lo, hi):
        # If we're at a single element, store its value
        if lo == hi:
            self.tree[tree_idx] = arr[lo]
            return

        mid = (lo + hi) // 2
        # Build left and right children
        self._build(arr, 2 * tree_idx + 1, lo, mid)
        self._build(arr, 2 * tree_idx + 2, mid + 1, hi)
        # Combine results from children
        self.tree[tree_idx] = self.tree[2 * tree_idx + 1] + self.tree[2 * tree_idx + 2]

    def update(self, idx, val):
        # Update a single element in the original array and propagate changes up the tree
        self._update(0, 0, self.n - 1, idx, val)

    def _update(self, tree_idx, lo, hi, idx, val):
        if lo == hi:
            self.tree[tree_idx] = val
            return

        mid = (lo + hi) // 2
        if lo <= idx <= mid:
            self._update(2 * tree_idx + 1, lo, mid, idx, val)
        else:
            self._update(2 * tree_idx + 2, mid + 1, hi, idx, val)
        self.tree[tree_idx] = self.tree[2 * tree_idx + 1] + self.tree[2 * tree_idx + 2]

    def query(self, l, r):
        # Query the sum of a range [l, r]
        return self._query(0, 0, self.n - 1, l, r)

    def _query(self, tree_idx, lo, hi, l, r):
        # If the current segment is completely outside the query range
        if r < lo or hi < l:
            return 0 # Return identity for sum (0)
        # If the current segment is completely inside the query range
        if l <= lo and hi <= r:
            return self.tree[tree_idx]

        mid = (lo + hi) // 2
        # Recursively query left and right children and combine results
        p1 = self._query(2 * tree_idx + 1, lo, mid, l, r)
        p2 = self._query(2 * tree_idx + 2, mid + 1, hi, l, r)
        return p1 + p2


