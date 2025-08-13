import time
import random
from collections import deque

# Assuming SegmentTree and FenwickTree are available in the parent directory
# For a real application, these would be properly packaged or imported from a library
import sys
sys.path.append('../segment_tree')
sys.path.append('../fenwick_tree')

from segment_tree import SegmentTree
from fenwick_tree import FenwickTree

class WebsiteTrafficMonitor:
    def __init__(self, window_size=60): # Monitor traffic for the last 60 seconds
        self.window_size = window_size
        self.traffic_data = [0] * window_size # Each index represents a second
        self.segment_tree = SegmentTree(self.traffic_data)
        self.fenwick_tree = FenwickTree(self.traffic_data)
        self.current_second = 0

    def record_traffic(self, page_views):
        # Simulate traffic for the current second
        # Update the traffic data and both trees
        old_value = self.traffic_data[self.current_second]
        self.traffic_data[self.current_second] = page_views

        # Update Segment Tree
        self.segment_tree.update(self.current_second, page_views)

        # Update Fenwick Tree (with difference)
        change = page_views - old_value
        self.fenwick_tree.update(self.current_second, change)

        print(f"[{time.strftime('%H:%M:%S')}] Recorded {page_views} views for second {self.current_second}")

        # Move to the next second, wrapping around the window
        self.current_second = (self.current_second + 1) % self.window_size

    def get_total_traffic_last_minute(self):
        # Using Segment Tree for range sum over the entire window
        return self.segment_tree.query(0, self.window_size - 1)

    def get_traffic_in_last_n_seconds(self, n):
        if n > self.window_size:
            print("Warning: n is greater than window_size. Returning total traffic.")
            return self.get_total_traffic_last_minute()

        # This is a bit tricky with a circular buffer and fixed-size trees.
        # For simplicity, let's assume we want the sum of the last 'n' *recorded* values.
        # A more robust solution would involve managing the window explicitly.
        # Here, we'll use Fenwick Tree for prefix sums and calculate the range.

        # If current_second is 0, it means the last recorded second was window_size - 1
        # We need to sum from (current_second - n) % window_size to (current_second - 1) % window_size
        # This requires careful handling of wrap-around. Let's simplify for this example
        # and just query the last 'n' elements as if they were contiguous.
        # For a true sliding window, a deque or more complex FT/ST logic is needed.

        # Let's use the Segment Tree for a simpler range query for the last 'n' seconds
        # assuming the data is logically contiguous for the last 'n' updates.
        # This is a simplification for demonstration purposes.
        start_idx = (self.current_second - n + self.window_size) % self.window_size
        end_idx = (self.current_second - 1 + self.window_size) % self.window_size

        if start_idx <= end_idx:
            return self.segment_tree.query(start_idx, end_idx)
        else:
            # Wrapped around, sum two parts
            sum1 = self.segment_tree.query(start_idx, self.window_size - 1)
            sum2 = self.segment_tree.query(0, end_idx)
            return sum1 + sum2


# --- Simulation --- #
if __name__ == "__main__":
    monitor = WebsiteTrafficMonitor(window_size=10) # Monitor last 10 seconds

    print("\n--- Simulating Website Traffic ---")
    for i in range(20): # Simulate 20 seconds of traffic
        views = random.randint(50, 200)
        monitor.record_traffic(views)
        time.sleep(0.5) # Simulate real-time updates

        if i % 5 == 0 and i > 0:
            total_traffic = monitor.get_total_traffic_last_minute()
            print(f"Total traffic in last {monitor.window_size} seconds: {total_traffic}")
            traffic_last_3_sec = monitor.get_traffic_in_last_n_seconds(3)
            print(f"Traffic in last 3 recorded seconds: {traffic_last_3_sec}")
            print("----------------------------------")

    print("\n--- Final Report ---")
    print(f"Total traffic in last {monitor.window_size} seconds: {monitor.get_total_traffic_last_minute()}")
    print(f"Traffic in last 5 recorded seconds: {monitor.get_traffic_in_last_n_seconds(5)}")

    # Demonstrate a specific update and query
    print("\n--- Manual Update and Query ---")
    monitor.record_traffic(300) # Record a high traffic spike
    print(f"Total traffic in last {monitor.window_size} seconds: {monitor.get_total_traffic_last_minute()}")


