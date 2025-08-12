"""
Basic Matrix Factorization Implementation
This module implements the core matrix factorization algorithm using SGD.
"""

import numpy as np
from data_setup import ratings, users, movies

class BasicMatrixFactorization:
    """
    A basic implementation of Matrix Factorization for recommendation systems.
    """
    
    def __init__(self, num_factors=2, learning_rate=0.01, num_epochs=50):
        """
        Initialize the Matrix Factorization model.
        
        Args:
            num_factors (int): Number of latent factors
            learning_rate (float): Learning rate for SGD
            num_epochs (int): Number of training epochs
        """
        self.num_factors = num_factors
        self.learning_rate = learning_rate
        self.num_epochs = num_epochs
        self.num_users = len(users)
        self.num_movies = len(movies)
        
        # Initialize matrices
        self.P = np.random.rand(self.num_users, self.num_factors)
        self.Q = np.random.rand(self.num_movies, self.num_factors)
        
    def predict_rating(self, user_id, movie_id):
        """
        Predict rating for a user-movie pair.
        
        Args:
            user_id (int): User ID
            movie_id (int): Movie ID
            
        Returns:
            float: Predicted rating
        """
        return np.dot(self.P[user_id, :], self.Q[movie_id, :])
    
    def train(self, verbose=True):
        """
        Train the matrix factorization model using SGD.
        
        Args:
            verbose (bool): Whether to print training progress
        """
        if verbose:
            print("\n--- Starting Training (Teaching the Algorithm) ---")
        
        for epoch in range(self.num_epochs):
            total_absolute_error = 0
            
            for user_id, user_ratings in ratings.items():
                for movie_id, actual_rating in user_ratings.items():
                    # Predict rating
                    predicted_rating = self.predict_rating(user_id, movie_id)
                    
                    # Calculate error
                    error = actual_rating - predicted_rating
                    total_absolute_error += abs(error)
                    
                    # Update matrices using gradient descent
                    self.P[user_id, :] += self.learning_rate * error * self.Q[movie_id, :]
                    self.Q[movie_id, :] += self.learning_rate * error * self.P[user_id, :]
            
            if verbose and (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch + 1}/{self.num_epochs}, Total Absolute Error: {total_absolute_error:.4f}")
        
        if verbose:
            print("\n--- Training Complete! Our Algorithm Has Learned! ---")
            print(f"\nRefined User-Feature Matrix (P):\n{self.P}")
            print(f"\nRefined Movie-Feature Matrix (Q):\n{self.Q}")
            print("--------------------------")
    
    def get_recommendations(self, user_id, num_recommendations=3):
        """
        Get movie recommendations for a user.
        
        Args:
            user_id (int): User ID
            num_recommendations (int): Number of recommendations to return
            
        Returns:
            list: List of (movie_id, predicted_rating, movie_title) tuples
        """
        user_ratings = ratings.get(user_id, {})
        recommendations = []
        
        for movie_id in range(self.num_movies):
            if movie_id not in user_ratings:  # Only recommend unwatched movies
                predicted_rating = self.predict_rating(user_id, movie_id)
                movie_title = movies[movie_id]
                recommendations.append((movie_id, predicted_rating, movie_title))
        
        # Sort by predicted rating (descending)
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return recommendations[:num_recommendations]
    
    def evaluate_model(self):
        """
        Evaluate the model on the training data.
        
        Returns:
            dict: Evaluation metrics
        """
        total_error = 0
        total_squared_error = 0
        num_ratings = 0
        
        for user_id, user_ratings in ratings.items():
            for movie_id, actual_rating in user_ratings.items():
                predicted_rating = self.predict_rating(user_id, movie_id)
                error = actual_rating - predicted_rating
                
                total_error += abs(error)
                total_squared_error += error ** 2
                num_ratings += 1
        
        mae = total_error / num_ratings
        rmse = np.sqrt(total_squared_error / num_ratings)
        
        return {
            'mae': mae,
            'rmse': rmse,
            'num_ratings': num_ratings
        }

def demo_basic_matrix_factorization():
    """Demonstrate the basic matrix factorization implementation."""
    print("=== Basic Matrix Factorization Demo ===")
    
    # Create and train model
    model = BasicMatrixFactorization(num_factors=2, learning_rate=0.01, num_epochs=50)
    model.train()
    
    # Evaluate model
    metrics = model.evaluate_model()
    print(f"\nModel Performance:")
    print(f"Mean Absolute Error (MAE): {metrics['mae']:.4f}")
    print(f"Root Mean Square Error (RMSE): {metrics['rmse']:.4f}")
    
    # Get recommendations for each user
    print("\n=== Recommendations for Each User ===")
    for user_id in range(len(users)):
        user_name = users[user_id]
        recommendations = model.get_recommendations(user_id)
        
        print(f"\nRecommendations for {user_name}:")
        for movie_id, predicted_rating, movie_title in recommendations:
            print(f"  - {movie_title}: {predicted_rating:.2f} stars")

if __name__ == "__main__":
    demo_basic_matrix_factorization()

