"""
Basic Data Setup for Netflix Recommendation System
This module contains the foundational data structures and initialization code.
"""

import numpy as np

# Our simplified user-movie rating data: {user_id: {movie_id: rating}}
ratings = {
    0: {0: 5, 1: 3, 2: 4, 3: 1},  # Alice
    1: {0: 4, 1: 2, 2: 5, 3: 2},  # Bob
    2: {0: 1, 1: 4, 2: 2, 3: 5},  # Charlie
    3: {0: 2, 1: 5, 2: 1, 3: 4},  # David
    4: {0: 3, 1: 1, 2: 3, 3: 2},  # Eve
}

movies = {
    0: "The Action Hero",
    1: "Romantic Comedy",
    2: "Sci-Fi Epic",
    3: "Drama Thriller",
}

users = {
    0: "Alice",
    1: "Bob",
    2: "Charlie",
    3: "David",
    4: "Eve",
}

def display_ratings_data():
    """Display the sample ratings data in a readable format."""
    print("--- Our Sample Ratings Data ---")
    for user_id, user_ratings in ratings.items():
        user_name = users[user_id]
        print(f"User {user_name} (ID: {user_id}):")
        for movie_id, rating in user_ratings.items():
            movie_title = movies[movie_id]
            print(f"  - {movie_title}: {rating} stars")
    print("-------------------------------")

def initialize_matrices(num_factors=2):
    """
    Initialize User-Feature (P) and Movie-Feature (Q) matrices with random values.
    
    Args:
        num_factors (int): Number of latent factors to discover
        
    Returns:
        tuple: (P, Q) matrices
    """
    num_users = len(ratings)
    num_movies = len(movies)
    
    # Initialize matrices with random values
    P = np.random.rand(num_users, num_factors)  # User-Feature Matrix
    Q = np.random.rand(num_movies, num_factors)  # Movie-Feature Matrix
    
    print(f"\n--- Initialized Matrices (Our Blank Slate) ---")
    print(f"User-Feature Matrix (P) shape: {P.shape}\n{P}")
    print(f"\nMovie-Feature Matrix (Q) shape: {Q.shape}\n{Q}")
    print("--------------------------")
    
    return P, Q

def get_data_info():
    """Return basic information about the dataset."""
    return {
        'num_users': len(users),
        'num_movies': len(movies),
        'num_ratings': sum(len(user_ratings) for user_ratings in ratings.values()),
        'sparsity': 1 - (sum(len(user_ratings) for user_ratings in ratings.values()) / (len(users) * len(movies)))
    }

if __name__ == "__main__":
    # Demo the data setup
    display_ratings_data()
    P, Q = initialize_matrices()
    
    info = get_data_info()
    print(f"\nDataset Info:")
    print(f"Users: {info['num_users']}")
    print(f"Movies: {info['num_movies']}")
    print(f"Ratings: {info['num_ratings']}")
    print(f"Sparsity: {info['sparsity']:.2%}")

