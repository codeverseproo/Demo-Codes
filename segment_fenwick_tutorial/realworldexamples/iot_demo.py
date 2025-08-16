import time
import random

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
WINDOW_SIZE = 10 # Track readings over the last 10 seconds
ft = FenwickTree(WINDOW_SIZE)
readings = [0] * WINDOW_SIZE
current_time = 0

print("--- IoT Anomaly Detection Demo ---")
print("Simulating sensor readings for 20 seconds...")

for _ in range(20):
    current_time += 1
    slot = current_time % WINDOW_SIZE
    
    # Remove the old reading from the window
    old_reading = readings[slot]
    ft.update(slot, -old_reading)
    
    # Get a new reading (simulate an anomaly spike at t=15)
    new_reading = random.randint(20, 30)
    if current_time == 15:
        new_reading = 150 # Anomaly!
        
    readings[slot] = new_reading
    ft.update(slot, new_reading)
    
    total_in_window = ft.query(WINDOW_SIZE - 1)
    
    print(f"Time: {current_time}s | Sum in last {WINDOW_SIZE}s: {total_in_window}", end="")
    if total_in_window > 500: # Anomaly threshold
        print(" <-- ANOMALY DETECTED!")
    else:
        print("")
    time.sleep(0.5)
