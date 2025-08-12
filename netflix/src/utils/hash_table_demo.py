"""
Hash Table Performance Demonstration
This module demonstrates the performance benefits of hash tables vs. linear search.
"""

import time
import random
import matplotlib.pyplot as plt
import numpy as np

def compare_search_performance(size=1_000_000):
    """
    Compare the performance of list search vs dictionary lookup.
    
    Args:
        size (int): Size of the data structure to test
        
    Returns:
        dict: Performance comparison results
    """
    print(f"\n--- Performance Comparison with {size:,} items ---")
    
    # Create large list and dictionary
    large_list = list(range(size))
    large_dict = {i: f"Value_{i}" for i in range(size)}
    
    # Choose random items to search for
    search_item_list = random.choice(large_list)
    search_key_dict = random.choice(list(large_dict.keys()))
    
    # Test list search performance
    print(f"\n--- List Search Performance ---")
    start_time = time.time()
    found_list = search_item_list in large_list
    end_time = time.time()
    list_time = end_time - start_time
    
    print(f"Searching for {search_item_list} in a list of {len(large_list):,} items:")
    print(f"Found: {found_list}, Time taken: {list_time:.6f} seconds")
    
    # Test dictionary lookup performance
    print(f"\n--- Dictionary (Hash Table) Lookup Performance ---")
    start_time = time.time()
    found_dict = search_key_dict in large_dict
    end_time = time.time()
    dict_time = end_time - start_time
    
    print(f"Looking up key {search_key_dict} in a dictionary of {len(large_dict):,} items:")
    print(f"Found: {found_dict}, Time taken: {dict_time:.6f} seconds")
    
    # Calculate speedup
    if dict_time > 0:
        speedup = list_time / dict_time
        print(f"\nSpeedup: {speedup:.0f}x faster with hash table!")
    else:
        print(f"\nHash table lookup was too fast to measure accurately!")
    
    print("-" * 50)
    
    return {
        'size': size,
        'list_time': list_time,
        'dict_time': dict_time,
        'speedup': speedup if dict_time > 0 else float('inf')
    }

def benchmark_scaling_performance():
    """
    Benchmark how performance scales with data size.
    
    Returns:
        dict: Scaling performance results
    """
    print("\n=== Scaling Performance Benchmark ===")
    
    sizes = [1000, 10000, 100000, 1000000]
    list_times = []
    dict_times = []
    
    for size in sizes:
        print(f"\nTesting with {size:,} items...")
        
        # Create data structures
        test_list = list(range(size))
        test_dict = {i: f"Value_{i}" for i in range(size)}
        
        # Test multiple searches and average the time
        num_searches = 10
        search_items = random.sample(test_list, num_searches)
        
        # Time list searches
        start_time = time.time()
        for item in search_items:
            _ = item in test_list
        end_time = time.time()
        avg_list_time = (end_time - start_time) / num_searches
        list_times.append(avg_list_time)
        
        # Time dictionary lookups
        start_time = time.time()
        for item in search_items:
            _ = item in test_dict
        end_time = time.time()
        avg_dict_time = (end_time - start_time) / num_searches
        dict_times.append(avg_dict_time)
        
        print(f"  List search: {avg_list_time:.6f}s")
        print(f"  Dict lookup: {avg_dict_time:.6f}s")
        print(f"  Speedup: {avg_list_time/avg_dict_time:.0f}x" if avg_dict_time > 0 else "  Speedup: ∞")
    
    return {
        'sizes': sizes,
        'list_times': list_times,
        'dict_times': dict_times
    }

def plot_performance_comparison(benchmark_results):
    """
    Plot the performance comparison results.
    
    Args:
        benchmark_results (dict): Results from benchmark_scaling_performance
    """
    sizes = benchmark_results['sizes']
    list_times = benchmark_results['list_times']
    dict_times = benchmark_results['dict_times']
    
    plt.figure(figsize=(12, 8))
    
    # Plot 1: Absolute times
    plt.subplot(2, 2, 1)
    plt.loglog(sizes, list_times, 'o-', label='List Search', linewidth=2, markersize=8)
    plt.loglog(sizes, dict_times, 's-', label='Dictionary Lookup', linewidth=2, markersize=8)
    plt.xlabel('Data Size')
    plt.ylabel('Time (seconds)')
    plt.title('Search Performance vs Data Size')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot 2: Speedup
    plt.subplot(2, 2, 2)
    speedups = [list_time/dict_time if dict_time > 0 else 0 
                for list_time, dict_time in zip(list_times, dict_times)]
    plt.semilogx(sizes, speedups, 'ro-', linewidth=2, markersize=8)
    plt.xlabel('Data Size')
    plt.ylabel('Speedup Factor')
    plt.title('Hash Table Speedup vs Data Size')
    plt.grid(True, alpha=0.3)
    
    # Plot 3: Time Complexity Illustration
    plt.subplot(2, 2, 3)
    theoretical_linear = [size / sizes[0] * list_times[0] for size in sizes]
    theoretical_constant = [dict_times[0]] * len(sizes)
    
    plt.loglog(sizes, theoretical_linear, '--', label='O(n) - Linear Search', alpha=0.7)
    plt.loglog(sizes, theoretical_constant, '--', label='O(1) - Hash Table', alpha=0.7)
    plt.loglog(sizes, list_times, 'o', label='Actual List Search', markersize=8)
    plt.loglog(sizes, dict_times, 's', label='Actual Dict Lookup', markersize=8)
    plt.xlabel('Data Size')
    plt.ylabel('Time (seconds)')
    plt.title('Theoretical vs Actual Performance')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot 4: Netflix Scale Illustration
    plt.subplot(2, 2, 4)
    netflix_users = 230_000_000  # Netflix's approximate user base
    netflix_titles = 15_000      # Netflix's approximate title count
    
    # Estimate times for Netflix scale
    netflix_list_time = netflix_titles / sizes[-1] * list_times[-1]
    netflix_dict_time = dict_times[-1]  # Constant time
    
    operations = ['User Lookup', 'Title Lookup', 'Recommendation\nGeneration']
    list_times_netflix = [netflix_list_time, netflix_list_time, netflix_list_time * 10]
    dict_times_netflix = [netflix_dict_time, netflix_dict_time, netflix_dict_time * 10]
    
    x = np.arange(len(operations))
    width = 0.35
    
    plt.bar(x - width/2, list_times_netflix, width, label='Without Hash Tables', alpha=0.8)
    plt.bar(x + width/2, dict_times_netflix, width, label='With Hash Tables', alpha=0.8)
    plt.xlabel('Operation Type')
    plt.ylabel('Time (seconds)')
    plt.title('Netflix Scale: Hash Table Impact')
    plt.xticks(x, operations)
    plt.legend()
    plt.yscale('log')
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/netflix-recommendation-blog/assets/hash_table_performance.png', 
                dpi=300, bbox_inches='tight')
    plt.show()

def demonstrate_hash_table_use_cases():
    """Demonstrate various hash table use cases in recommendation systems."""
    print("\n=== Hash Table Use Cases in Recommendation Systems ===")
    
    # 1. User Profile Caching
    print("\n1. User Profile Caching:")
    user_profiles = {
        'user_123': {
            'preferences': ['action', 'sci-fi'],
            'watch_history': ['movie_1', 'movie_5', 'movie_12'],
            'ratings': {'movie_1': 5, 'movie_5': 4}
        },
        'user_456': {
            'preferences': ['comedy', 'romance'],
            'watch_history': ['movie_2', 'movie_8'],
            'ratings': {'movie_2': 3, 'movie_8': 5}
        }
    }
    
    # Instant user lookup
    start_time = time.time()
    user_profile = user_profiles.get('user_123')
    lookup_time = time.time() - start_time
    print(f"  User profile lookup: {lookup_time:.8f} seconds")
    print(f"  Profile: {user_profile}")
    
    # 2. Movie Metadata Storage
    print("\n2. Movie Metadata Storage:")
    movie_metadata = {
        'movie_1': {
            'title': 'The Action Hero',
            'genre': ['action', 'adventure'],
            'rating': 4.2,
            'duration': 120
        },
        'movie_2': {
            'title': 'Romantic Comedy',
            'genre': ['comedy', 'romance'],
            'rating': 3.8,
            'duration': 95
        }
    }
    
    start_time = time.time()
    movie_info = movie_metadata.get('movie_1')
    lookup_time = time.time() - start_time
    print(f"  Movie metadata lookup: {lookup_time:.8f} seconds")
    print(f"  Movie info: {movie_info}")
    
    # 3. Recommendation Caching
    print("\n3. Pre-computed Recommendation Caching:")
    recommendation_cache = {
        'user_123': [
            {'movie_id': 'movie_3', 'score': 4.5},
            {'movie_id': 'movie_7', 'score': 4.2},
            {'movie_id': 'movie_11', 'score': 4.0}
        ],
        'user_456': [
            {'movie_id': 'movie_4', 'score': 4.3},
            {'movie_id': 'movie_9', 'score': 4.1}
        ]
    }
    
    start_time = time.time()
    recommendations = recommendation_cache.get('user_123', [])
    lookup_time = time.time() - start_time
    print(f"  Recommendation lookup: {lookup_time:.8f} seconds")
    print(f"  Recommendations: {recommendations}")

def main():
    """Main demonstration function."""
    print("=" * 60)
    print("HASH TABLE PERFORMANCE DEMONSTRATION")
    print("The Unsung Hero of Netflix's Millisecond Recommendations")
    print("=" * 60)
    
    # Basic performance comparison
    compare_search_performance(1_000_000)
    
    # Scaling benchmark
    benchmark_results = benchmark_scaling_performance()
    
    # Create performance plots
    plot_performance_comparison(benchmark_results)
    
    # Demonstrate use cases
    demonstrate_hash_table_use_cases()
    
    print("\n" + "=" * 60)
    print("CONCLUSION:")
    print("Hash tables provide O(1) average lookup time, making them essential")
    print("for Netflix's real-time recommendation system serving 230M+ users.")
    print("Without hash tables, Netflix's recommendations would be too slow!")
    print("=" * 60)

if __name__ == "__main__":
    main()

