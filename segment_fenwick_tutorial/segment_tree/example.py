from segment_tree import SegmentTree

# Let's test it out!
arr = [1, 3, 5, 7, 9, 11]
st = SegmentTree(arr)

print(f"Original array: {arr}")
print(f"Sum of range (index 0 to 5): {st.query(0, 5)}")  # Should be 36
print(f"Sum of range (index 1 to 3): {st.query(1, 3)}")  # Should be 3 + 5 + 7 = 15

# Now, let's update a value
st.update(2, 10) # Change the value at index 2 (which was 5) to 10
print(f"\nAfter updating index 2 to 10:")
print(f"Sum of range (index 0 to 5): {st.query(0, 5)}")  # Should be 36 - 5 + 10 = 41
print(f"Sum of range (index 1 to 3): {st.query(1, 3)}")  # Should be 3 + 10 + 7 = 20

# Basic assertions for testing
assert st.query(0, 5) == 41, "Test Case 1 Failed: Sum after update is incorrect"
assert st.query(1, 3) == 20, "Test Case 2 Failed: Range sum after update is incorrect"

print("\nAll Segment Tree tests passed!")


