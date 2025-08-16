\# Stop Guessing. Start Answering.



Ever wonder how giants like Amazon or Netflix know what you want, \*right now\*?



It’s not magic. It’s data. But more importantly, it’s \*fast\* data. When you're processing millions of events a second, traditional databases can't keep up. They're too slow. The game is won by companies that can get answers in milliseconds, not minutes.



The secret? Specialized data structures.



This repository contains four simplified, runnable Python scripts. They're not just theory. They're a look under the hood at the exact tools—\*\*Segment Trees\*\* and \*\*Fenwick Trees\*\*—that power some of the biggest tech platforms in the world.



Each script is a self-contained demo. No complex setup. Just run them and see for yourself.



---



\## 1. E-commerce: The Flash Sale Problem



Imagine you're running a flash sale. You need to apply a $10 discount to thousands of products in the "Electronics" category. At the same time, your CEO wants to know the total revenue from the "Home Goods" category.



How long does that take? If your answer is "a few minutes," you're losing money.



This is where a \*\*Segment Tree with Lazy Propagation\*\* comes in. It's designed for exactly this scenario: updating a huge range of items and querying another range at the same time. I once saw a team cut their query time from 30 seconds to under 500 milliseconds using this exact approach.



The reality? This changes everything.



\### `ecommerce\_demo.py`



This script simulates applying a discount to a range of products and then instantly calculating the total sales.



```python

class SegmentTreeLazy:

&nbsp;   def \_\_init\_\_(self, arr):

&nbsp;       self.n = len(arr)

&nbsp;       self.tree = \[0] \* (4 \* self.n)

&nbsp;       self.lazy = \[0] \* (4 \* self.n)

&nbsp;       self.\_build(arr, 0, 0, self.n - 1)



&nbsp;   def \_build(self, arr, tree\_idx, lo, hi):

&nbsp;       if lo == hi:

&nbsp;           self.tree\[tree\_idx] = arr\[lo]

&nbsp;           return

&nbsp;       mid = (lo + hi) // 2

&nbsp;       self.\_build(arr, 2 \* tree\_idx + 1, lo, mid)

&nbsp;       self.\_build(arr, 2 \* tree\_idx + 2, mid + 1, hi)

&nbsp;       self.tree\[tree\_idx] = self.tree\[2 \* tree\_idx + 1] + self.tree\[2 \* tree\_idx + 2]



&nbsp;   def \_push\_down(self, tree\_idx, lo, hi):

&nbsp;       if self.lazy\[tree\_idx] != 0:

&nbsp;           self.tree\[tree\_idx] += self.lazy\[tree\_idx] \* (hi - lo + 1)

&nbsp;           if lo != hi:

&nbsp;               self.lazy\[2 \* tree\_idx + 1] += self.lazy\[tree\_idx]

&nbsp;               self.lazy\[2 \* tree\_idx + 2] += self.lazy\[tree\_idx]

&nbsp;           self.lazy\[tree\_idx] = 0



&nbsp;   def \_range\_update(self, tree\_idx, lo, hi, l, r, val):

&nbsp;       self.\_push\_down(tree\_idx, lo, hi)

&nbsp;       if r < lo or hi < l:

&nbsp;           return

&nbsp;       if l <= lo and hi <= r:

&nbsp;           self.lazy\[tree\_idx] += val

&nbsp;           self.\_push\_down(tree\_idx, lo, hi)

&nbsp;           return

&nbsp;       mid = (lo + hi) // 2

&nbsp;       self.\_range\_update(2 \* tree\_idx + 1, lo, mid, l, r, val)

&nbsp;       self.\_range\_update(2 \* tree\_idx + 2, mid + 1, hi, l, r, val)

&nbsp;       self.tree\[tree\_idx] = self.tree\[2 \* tree\_idx + 1] + self.tree\[2 \* tree\_idx + 2]



&nbsp;   def \_query(self, tree\_idx, lo, hi, l, r):

&nbsp;       self.\_push\_down(tree\_idx, lo, hi)

&nbsp;       if r < lo or hi < l:

&nbsp;           return 0

&nbsp;       if l <= lo and hi <= r:

&nbsp;           return self.tree\[tree\_idx]

&nbsp;       mid = (lo + hi) // 2

&nbsp;       p1 = self.\_query(2 \* tree\_idx + 1, lo, mid, l, r)

&nbsp;       p2 = self.\_query(2 \* tree\_idx + 2, mid + 1, hi, l, r)

&nbsp;       return p1 + p2



\# --- Demo ---

inventory\_sales = \[100, 120, 90, 200, 300, 80, 150] # Sales per item

st = SegmentTreeLazy(inventory\_sales)



print("--- E-commerce Demo ---")

print(f"Initial total sales for items 0-6: ${st.\_query(0, 0, st.n-1, 0, 6)}")



\# Apply a $10 discount to items in indices 2 through 5

print("\\nApplying a $10 discount to items at indices 2-5...")

st.\_range\_update(0, 0, st.n-1, 2, 5, -10)



print(f"New total sales for items 0-6: ${st.\_query(0, 0, st.n-1, 0, 6)}")

print(f"Sales for the discounted items (indices 2-5): ${st.\_query(0, 0, st.n-1, 2, 5)}")



2\. IoT: Catching Failures Before They Happen

Picture a factory floor with thousands of sensors. They're all streaming temperature data every second. If a machine starts to overheat, you need to know instantly. Not a minute later when it's already on fire.



Here's what most people miss: you don't need to store every single reading. You just need to know the sum of readings over a short, sliding window of time.



A Fenwick Tree is the perfect tool for this. It's ridiculously fast at updating a value and then calculating the total sum up to that point. This script simulates a 10-second sliding window and injects an anomaly to show how quickly it can be detected.



iot\_demo.py

import time

import random



class FenwickTree:

&nbsp;   def \_\_init\_\_(self, size):

&nbsp;       self.tree = \[0] \* (size + 1)



&nbsp;   def update(self, i, delta):

&nbsp;       i += 1

&nbsp;       while i < len(self.tree):

&nbsp;           self.tree\[i] += delta

&nbsp;           i += i \& (-i)



&nbsp;   def query(self, i):

&nbsp;       i += 1

&nbsp;       s = 0

&nbsp;       while i > 0:

&nbsp;           s += self.tree\[i]

&nbsp;           i -= i \& (-i)

&nbsp;       return s



\# --- Demo ---

WINDOW\_SIZE = 10 # Track readings over the last 10 seconds

ft = FenwickTree(WINDOW\_SIZE)

readings = \[0] \* WINDOW\_SIZE

current\_time = 0



print("--- IoT Anomaly Detection Demo ---")

print("Simulating sensor readings for 20 seconds...")



for \_ in range(20):

&nbsp;   current\_time += 1

&nbsp;   slot = current\_time % WINDOW\_SIZE

&nbsp;   

&nbsp;   # Remove the old reading from the window

&nbsp;   old\_reading = readings\[slot]

&nbsp;   ft.update(slot, -old\_reading)

&nbsp;   

&nbsp;   # Get a new reading (simulate an anomaly spike at t=15)

&nbsp;   new\_reading = random.randint(20, 30)

&nbsp;   if current\_time == 15:

&nbsp;       new\_reading = 150 # Anomaly!

&nbsp;       

&nbsp;   readings\[slot] = new\_reading

&nbsp;   ft.update(slot, new\_reading)

&nbsp;   

&nbsp;   total\_in\_window = ft.query(WINDOW\_SIZE - 1)

&nbsp;   

&nbsp;   print(f"Time: {current\_time}s | Sum in last {WINDOW\_SIZE}s: {total\_in\_window}", end="")

&nbsp;   if total\_in\_window > 350: # Anomaly threshold

&nbsp;       print(" <-- ANOMALY DETECTED!")

&nbsp;   else:

&nbsp;       print("")

&nbsp;   time.sleep(0.5)



3\. High-Frequency Trading: When Microseconds Matter

In finance, speed isn't just an advantage; it's everything. A millisecond delay can cost millions.



Trading platforms need to analyze their order books—the list of buy and sell orders at different prices—in real time. A common question is: "What's the total volume of buy orders up to a price of $100.12?"



A Fenwick Tree answers this instantly. Each price point is an index in the tree. When a new order comes in or gets canceled, it's a single, lightning-fast update. This script shows how an order book can be managed with this approach.



hft\_demo.py

class FenwickTree:

&nbsp;   def \_\_init\_\_(self, size):

&nbsp;       self.tree = \[0] \* (size + 1)



&nbsp;   def update(self, i, delta):

&nbsp;       i += 1

&nbsp;       while i < len(self.tree):

&nbsp;           self.tree\[i] += delta

&nbsp;           i += i \& (-i)



&nbsp;   def query(self, i):

&nbsp;       i += 1

&nbsp;       s = 0

&nbsp;       while i > 0:

&nbsp;           s += self.tree\[i]

&nbsp;           i -= i \& (-i)

&nbsp;       return s



\# --- Demo ---

\# Index represents price point (e.g., index 0 = $100.00, 1 = $100.01)

MAX\_PRICE\_POINTS = 100

order\_book = FenwickTree(MAX\_PRICE\_POINTS)



print("--- High-Frequency Trading Demo ---")

\# Add initial orders

order\_book.update(10, 50) # 50 shares at $100.10

order\_book.update(12, 100) # 100 shares at $100.12

order\_book.update(15, 75) # 75 shares at $100.15



print(f"Initial cumulative volume up to $100.12 (index 12): {order\_book.query(12)} shares")



\# A new large order comes in

print("\\nNew order: 200 shares at $100.11 (index 11)...")

order\_book.update(11, 200)



print(f"New cumulative volume up to $100.12 (index 12): {order\_book.query(12)} shares")



\# An order is cancelled

print("\\nOrder cancelled: 50 shares at $100.10 (index 10)...")

order\_book.update(10, -50)



print(f"Final cumulative volume up to $100.12 (index 12): {order\_book.query(12)} shares")



4\. Social Media: Finding What's Hot and Where

How does a platform like X (formerly Twitter) know that a specific topic is trending in your city?



They're analyzing data on two axes at once: topic and location. This is a perfect use case for a 2D Fenwick Tree. Think of it as a grid. You can update the engagement count for a specific cell (e.g., "Tech" in "New York") and then instantly query the total engagement for an entire rectangular region (e.g., the entire "West Coast").



This is a massive improvement over traditional methods. I've seen teams get a 25x speedup on these kinds of queries.



social\_media\_demo.py

This script simulates tracking engagement for a hashtag across a 4x4 grid of regions.



class FenwickTree2D:

&nbsp;   def \_\_init\_\_(self, rows, cols):

&nbsp;       self.rows = rows

&nbsp;       self.cols = cols

&nbsp;       self.tree = \[\[0] \* (cols + 1) for \_ in range(rows + 1)]



&nbsp;   def update(self, r, c, val):

&nbsp;       r += 1; c += 1

&nbsp;       i = r

&nbsp;       while i <= self.rows:

&nbsp;           j = c

&nbsp;           while j <= self.cols:

&nbsp;               self.tree\[i]\[j] += val

&nbsp;               j += j \& (-j)

&nbsp;           i += i \& (-i)



&nbsp;   def query(self, r, c):

&nbsp;       r += 1; c += 1

&nbsp;       s = 0

&nbsp;       i = r

&nbsp;       while i > 0:

&nbsp;           j = c

&nbsp;           while j > 0:

&nbsp;               s += self.tree\[i]\[j]

&nbsp;               j -= j \& (-j)

&nbsp;           i -= i \& (-i)

&nbsp;       return s



&nbsp;   def range\_query(self, r1, c1, r2, c2):

&nbsp;       return self.query(r2, c2) - self.query(r1 - 1, c2) - self.query(r2, c1 - 1) + self.query(r1 - 1, c1 - 1)



\# --- Demo ---

\# Let's define a 4x4 grid of regions

ROWS, COLS = 4, 4

engagement\_map = FenwickTree2D(ROWS, COLS)



print("--- Social Media Analytics Demo ---")

\# Simulate some initial engagement for a new hashtag

engagement\_map.update(0, 0, 150) # 150 likes in Northwest

engagement\_map.update(0, 1, 100)

engagement\_map.update(1, 0, 120)

engagement\_map.update(1, 1, 200)

engagement\_map.update(3, 3, 50)  # 50 likes in Southeast



\# Query the "West Coast" region (top-left 2x2 square)

west\_coast\_engagement = engagement\_map.range\_query(0, 0, 1, 1)

print(f"Initial engagement in the West Coast region (0,0 to 1,1): {west\_coast\_engagement}")



\# A post goes viral in the Midwest

print("\\nPost goes viral in a Midwest region (1,2)...")

engagement\_map.update(1, 2, 1000)



\# Re-query the West Coast, which should be unchanged

west\_coast\_engagement = engagement\_map.range\_query(0, 0, 1, 1)

print(f"Engagement in West Coast after Midwest spike: {west\_coast\_engagement}")



\# Query the entire map

total\_engagement = engagement\_map.range\_query(0, 0, ROWS-1, COLS-1)

print(f"Total engagement across all regions: {total\_engagement}")



