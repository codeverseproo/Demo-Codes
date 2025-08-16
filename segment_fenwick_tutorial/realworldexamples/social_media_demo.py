class FenwickTree2D:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.tree = [[0] * (cols + 1) for _ in range(rows + 1)]

    def update(self, r, c, val):
        r += 1; c += 1
        i = r
        while i <= self.rows:
            j = c
            while j <= self.cols:
                self.tree[i][j] += val
                j += j & (-j)
            i += i & (-i)

    def query(self, r, c):
        r += 1; c += 1
        s = 0
        i = r
        while i > 0:
            j = c
            while j > 0:
                s += self.tree[i][j]
                j -= j & (-j)
            i -= i & (-i)
        return s

    def range_query(self, r1, c1, r2, c2):
        return self.query(r2, c2) - self.query(r1 - 1, c2) - self.query(r2, c1 - 1) + self.query(r1 - 1, c1 - 1)

# --- Demo ---
# Let's define a 4x4 grid of regions
ROWS, COLS = 4, 4
engagement_map = FenwickTree2D(ROWS, COLS)

print("--- Social Media Analytics Demo ---")
# Simulate some initial engagement for a new hashtag
engagement_map.update(0, 0, 150) # 150 likes in Northwest
engagement_map.update(0, 1, 100)
engagement_map.update(1, 0, 120)
engagement_map.update(1, 1, 200)
engagement_map.update(3, 3, 50)  # 50 likes in Southeast

# Query the "West Coast" region (top-left 2x2 square)
west_coast_engagement = engagement_map.range_query(0, 0, 1, 1)
print(f"Initial engagement in the West Coast region (0,0 to 1,1): {west_coast_engagement}")

# A post goes viral in the Midwest
print("\nPost goes viral in a Midwest region (1,2)...")
engagement_map.update(1, 2, 1000)

# Re-query the West Coast, which should be unchanged
west_coast_engagement = engagement_map.range_query(0, 0, 1, 1)
print(f"Engagement in West Coast after Midwest spike: {west_coast_engagement}")

# Query the entire map
total_engagement = engagement_map.range_query(0, 0, ROWS-1, COLS-1)
print(f"Total engagement across all regions: {total_engagement}")