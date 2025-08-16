class SegmentTreeLazy:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(arr, 0, 0, self.n - 1)

    def _build(self, arr, tree_idx, lo, hi):
        if lo == hi:
            self.tree[tree_idx] = arr[lo]
            return
        mid = (lo + hi) // 2
        self._build(arr, 2 * tree_idx + 1, lo, mid)
        self._build(arr, 2 * tree_idx + 2, mid + 1, hi)
        self.tree[tree_idx] = self.tree[2 * tree_idx + 1] + self.tree[2 * tree_idx + 2]

    def _push_down(self, tree_idx, lo, hi):
        if self.lazy[tree_idx] != 0:
            self.tree[tree_idx] += self.lazy[tree_idx] * (hi - lo + 1)
            if lo != hi:
                self.lazy[2 * tree_idx + 1] += self.lazy[tree_idx]
                self.lazy[2 * tree_idx + 2] += self.lazy[tree_idx]
            self.lazy[tree_idx] = 0

    def _range_update(self, tree_idx, lo, hi, l, r, val):
        self._push_down(tree_idx, lo, hi)
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            self.lazy[tree_idx] += val
            self._push_down(tree_idx, lo, hi)
            return
        mid = (lo + hi) // 2
        self._range_update(2 * tree_idx + 1, lo, mid, l, r, val)
        self._range_update(2 * tree_idx + 2, mid + 1, hi, l, r, val)
        self.tree[tree_idx] = self.tree[2 * tree_idx + 1] + self.tree[2 * tree_idx + 2]

    def _query(self, tree_idx, lo, hi, l, r):
        self._push_down(tree_idx, lo, hi)
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return self.tree[tree_idx]
        mid = (lo + hi) // 2
        p1 = self._query(2 * tree_idx + 1, lo, mid, l, r)
        p2 = self._query(2 * tree_idx + 2, mid + 1, hi, l, r)
        return p1 + p2

# --- Demo ---
inventory_sales = [100, 120, 90, 200, 300, 80, 150] # Sales per item
st = SegmentTreeLazy(inventory_sales)

print("--- E-commerce Demo ---")
print(f"Initial total sales for items 0-6: ${st._query(0, 0, st.n-1, 0, 6)}")

# Apply a $10 discount to items in indices 2 through 5
print("\nApplying a $10 discount to items at indices 2-5...")
st._range_update(0, 0, st.n-1, 2, 5, -10)

print(f"New total sales for items 0-6: ${st._query(0, 0, st.n-1, 0, 6)}")
print(f"Sales for the discounted items (indices 2-5): ${st._query(0, 0, st.n-1, 2, 5)}")
