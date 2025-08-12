"""
Advanced Matrix Factorization with Bias Terms
This module implements matrix factorization with user and item bias terms.
"""

import os
import sys
import numpy as np


project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

from src.basic.data_setup import ratings, users, movies

class MatrixFactorizationWithBias:
    """
    Matrix Factorization with bias terms for improved accuracy.
    """
    
    def __init__(self, num_factors=2, learning_rate=0.01, learning_rate_bias=0.005, num_epochs=100):
        """
        Initialize the Matrix Factorization model with bias terms.
        
        Args:
            num_factors (int): Number of latent factors
            learning_rate (float): Learning rate for matrix updates
            learning_rate_bias (float): Learning rate for bias updates
            num_epochs (int): Number of training epochs
        """
        self.num_factors = num_factors
        self.learning_rate = learning_rate
        self.learning_rate_bias = learning_rate_bias
        self.num_epochs = num_epochs
        self.num_users = len(users)
        self.num_movies = len(movies)
        
        # Calculate global mean
        self.global_mean = np.mean([rating for user_ratings in ratings.values() 
                                   for rating in user_ratings.values()])
        
        # Initialize matrices and biases
        self.P = np.random.rand(self.num_users, self.num_factors)
        self.Q = np.random.rand(self.num_movies, self.num_factors)
        self.user_biases = np.zeros(self.num_users)
        self.movie_biases = np.zeros(self.num_movies)
        
    def predict_rating(self, user_id, movie_id):
        """
        Predict rating for a user-movie pair including bias terms.
        
        Args:
            user_id (int): User ID
            movie_id (int): Movie ID
            
        Returns:
            float: Predicted rating
        """
        return (self.global_mean + 
                self.user_biases[user_id] + 
                self.movie_biases[movie_id] + 
                np.dot(self.P[user_id, :], self.Q[movie_id, :]))
    
    def train(self, verbose=True):
        """
        Train the matrix factorization model with bias terms using SGD.
        
        Args:
            verbose (bool): Whether to print training progress
        """
        if verbose:
            print("\n--- Starting Training with Bias Terms (Getting Even Smarter!) ---")
        
        for epoch in range(self.num_epochs):
            total_absolute_error = 0
            
            for user_id, user_ratings in ratings.items():
                for movie_id, actual_rating in user_ratings.items():
                    # Predict rating with bias terms
                    predicted_rating = self.predict_rating(user_id, movie_id)
                    
                    # Calculate error
                    error = actual_rating - predicted_rating
                    total_absolute_error += abs(error)
                    
                    # Update matrices and biases using gradient descent
                    self.P[user_id, :] += self.learning_rate * error * self.Q[movie_id, :]
                    self.Q[movie_id, :] += self.learning_rate * error * self.P[user_id, :]
                    self.user_biases[user_id] += self.learning_rate_bias * error
                    self.movie_biases[movie_id] += self.learning_rate_bias * error
            
            if verbose and (epoch + 1) % 20 == 0:
                print(f"Epoch {epoch + 1}/{self.num_epochs}, Total Absolute Error (with biases): {total_absolute_error:.4f}")
        
        if verbose:
            print("\n--- Training with Bias Terms Complete! ---")
            print(f"\nGlobal Mean: {self.global_mean:.2f}")
            print(f"\nRefined User-Feature Matrix (P) with Biases:\n{self.P}")
            print(f"\nRefined Movie-Feature Matrix (Q) with Biases:\n{self.Q}")
            print(f"\nUser Biases:\n{self.user_biases}")
            print(f"\nMovie Biases:\n{self.movie_biases}")
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
    
    def analyze_biases(self):
        """
        Analyze the learned bias terms.
        
        Returns:
            dict: Bias analysis
        """
        analysis = {
            'user_bias_analysis': {},
            'movie_bias_analysis': {}
        }
        
        # Analyze user biases
        for user_id, bias in enumerate(self.user_biases):
            user_name = users[user_id]
            if bias > 0:
                tendency = "rates higher than average"
            elif bias < 0:
                tendency = "rates lower than average"
            else:
                tendency = "rates at average"
            
            analysis['user_bias_analysis'][user_name] = {
                'bias': bias,
                'tendency': tendency
            }
        
        # Analyze movie biases
        for movie_id, bias in enumerate(self.movie_biases):
            movie_title = movies[movie_id]
            if bias > 0:
                appeal = "more popular than average"
            elif bias < 0:
                appeal = "less popular than average"
            else:
                appeal = "average popularity"
            
            analysis['movie_bias_analysis'][movie_title] = {
                'bias': bias,
                'appeal': appeal
            }
        
        return analysis

def demo_matrix_factorization_with_bias():
    """Demonstrate the matrix factorization with bias implementation."""
    print("=== Matrix Factorization with Bias Demo ===")
    
    # Create and train model
    model = MatrixFactorizationWithBias(num_factors=2, learning_rate=0.01, 
                                       learning_rate_bias=0.005, num_epochs=100)
    model.train()
    
    # Evaluate model
    metrics = model.evaluate_model()
    print(f"\nModel Performance:")
    print(f"Mean Absolute Error (MAE): {metrics['mae']:.4f}")
    print(f"Root Mean Square Error (RMSE): {metrics['rmse']:.4f}")
    
    # Analyze biases
    bias_analysis = model.analyze_biases()
    print(f"\n=== Bias Analysis ===")
    print(f"\nUser Bias Analysis:")
    for user_name, info in bias_analysis['user_bias_analysis'].items():
        print(f"  {user_name}: {info['bias']:.3f} ({info['tendency']})")
    
    print(f"\nMovie Bias Analysis:")
    for movie_title, info in bias_analysis['movie_bias_analysis'].items():
        print(f"  {movie_title}: {info['bias']:.3f} ({info['appeal']})")
    
    # Get recommendations for each user
    print("\n=== Recommendations for Each User ===")
    for user_id in range(len(users)):
        user_name = users[user_id]
        recommendations = model.get_recommendations(user_id)
        
        print(f"\nRecommendations for {user_name}:")
        for movie_id, predicted_rating, movie_title in recommendations:
            print(f"  - {movie_title}: {predicted_rating:.2f} stars")

if __name__ == "__main__":
    demo_matrix_factorization_with_bias()

