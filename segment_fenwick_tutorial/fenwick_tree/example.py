from fenwick_tree import FenwickTree

# Let's test it out!
arr = [1, 3, 5, 7, 9, 11]
ft = FenwickTree(arr)

print(f"Original array: {arr}")
print(f"Prefix sum up to index 5 (0-indexed): {ft.query(5)}")  # Should be 1+3+5+7+9+11 = 36
print(f"Sum of range (index 1 to 3): {ft.range_query(1, 3)}")  # Should be 3+5+7 = 15

# Now, let's update a value. Remember, we update with the *difference*.
old_val_at_2 = arr[2] # Old value at index 2 was 5
new_val_at_2 = 10
change = new_val_at_2 - old_val_at_2 # The difference is 10 - 5 = 5
arr[2] = new_val_at_2 # Update the original array for consistency
ft.update(2, change) # Apply the change to the Fenwick Tree

print(f"\nAfter updating index 2 to 10:")
print(f"Prefix sum up to index 5 (0-indexed): {ft.query(5)}")  # Should be 36 + 5 = 41
print(f"Sum of range (index 1 to 3): {ft.range_query(1, 3)}")  # Should be 3 + 10 + 7 = 20

# Basic assertions for testing
assert ft.query(5) == 41, "Test Case 1 Failed: Prefix sum after update is incorrect"
assert ft.range_query(1, 3) == 20, "Test Case 2 Failed: Range sum after update is incorrect"

print("\nAll Fenwick Tree tests passed!")


