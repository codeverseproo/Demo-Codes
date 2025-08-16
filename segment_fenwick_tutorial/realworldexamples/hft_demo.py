class FenwickTree:
    def __init__(self, size):
        self.tree = [0] * (size + 1)

    def update(self, i, delta):
        i += 1
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & (-i)

    def query(self, i):
        i += 1
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)
        return s

# --- Demo ---
# Index represents price point (e.g., index 0 = $100.00, 1 = $100.01)
MAX_PRICE_POINTS = 100
order_book = FenwickTree(MAX_PRICE_POINTS)

print("--- High-Frequency Trading Demo ---")
# Add initial orders
order_book.update(10, 50) # 50 shares at $100.10
order_book.update(12, 100) # 100 shares at $100.12
order_book.update(15, 75) # 75 shares at $100.15

print(f"Initial cumulative volume up to $100.12 (index 12): {order_book.query(12)} shares")

# A new large order comes in
print("\nNew order: 200 shares at $100.11 (index 11)...")
order_book.update(11, 200)

print(f"New cumulative volume up to $100.12 (index 12): {order_book.query(12)} shares")

# An order is cancelled
print("\nOrder cancelled: 50 shares at $100.10 (index 10)...")
order_book.update(10, -50)

print(f"Final cumulative volume up to $100.12 (index 12): {order_book.query(12)} shares")
