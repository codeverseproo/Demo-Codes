"""
Regularized Matrix Factorization Implementation
This module implements matrix factorization with bias terms and regularization.
"""

import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)



import numpy as np

from src.basic.data_setup import ratings, users, movies

class RegularizedMatrixFactorization:
    """
    Matrix Factorization with bias terms and regularization to prevent overfitting.
    """
    
    def __init__(self, num_factors=2, learning_rate=0.01, learning_rate_bias=0.005, 
                 reg_lambda=0.1, num_epochs=100):
        """
        Initialize the Regularized Matrix Factorization model.
        
        Args:
            num_factors (int): Number of latent factors
            learning_rate (float): Learning rate for matrix updates
            learning_rate_bias (float): Learning rate for bias updates
            reg_lambda (float): Regularization strength
            num_epochs (int): Number of training epochs
        """
        self.num_factors = num_factors
        self.learning_rate = learning_rate
        self.learning_rate_bias = learning_rate_bias
        self.reg_lambda = reg_lambda
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
        Train the regularized matrix factorization model using SGD.
        
        Args:
            verbose (bool): Whether to print training progress
        """
        if verbose:
            print("\n--- Starting Training with Bias Terms and Regularization (The Final Polish!) ---")
        
        for epoch in range(self.num_epochs):
            total_absolute_error = 0
            
            for user_id, user_ratings in ratings.items():
                for movie_id, actual_rating in user_ratings.items():
                    # Predict rating with bias terms
                    predicted_rating = self.predict_rating(user_id, movie_id)
                    
                    # Calculate error
                    error = actual_rating - predicted_rating
                    total_absolute_error += abs(error)
                    
                    # Update matrices and biases with regularization
                    self.P[user_id, :] += self.learning_rate * (
                        error * self.Q[movie_id, :] - self.reg_lambda * self.P[user_id, :]
                    )
                    self.Q[movie_id, :] += self.learning_rate * (
                        error * self.P[user_id, :] - self.reg_lambda * self.Q[movie_id, :]
                    )
                    self.user_biases[user_id] += self.learning_rate_bias * (
                        error - self.reg_lambda * self.user_biases[user_id]
                    )
                    self.movie_biases[movie_id] += self.learning_rate_bias * (
                        error - self.reg_lambda * self.movie_biases[movie_id]
                    )
            
            if verbose and (epoch + 1) % 20 == 0:
                print(f"Epoch {epoch + 1}/{self.num_epochs}, Total Absolute Error (with biases & reg): {total_absolute_error:.4f}")
        
        if verbose:
            print("\n--- Training with Bias Terms and Regularization Complete! ---")
            print(f"\nGlobal Mean: {self.global_mean:.2f}")
            print(f"Regularization Lambda: {self.reg_lambda}")
            print(f"\nRefined User-Feature Matrix (P) with Biases & Reg:\n{self.P}")
            print(f"\nRefined Movie-Feature Matrix (Q) with Biases & Reg:\n{self.Q}")
            print(f"\nUser Biases (Regularized):\n{self.user_biases}")
            print(f"\nMovie Biases (Regularized):\n{self.movie_biases}")
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
    
    def calculate_regularization_loss(self):
        """
        Calculate the regularization loss component.
        
        Returns:
            float: Regularization loss
        """
        reg_loss = (
            self.reg_lambda * (
                np.sum(self.P ** 2) + 
                np.sum(self.Q ** 2) + 
                np.sum(self.user_biases ** 2) + 
                np.sum(self.movie_biases ** 2)
            )
        )
        return reg_loss
    
    def get_model_complexity(self):
        """
        Get information about model complexity and regularization effects.
        
        Returns:
            dict: Model complexity metrics
        """
        return {
            'num_parameters': (
                self.P.size + self.Q.size + 
                self.user_biases.size + self.movie_biases.size
            ),
            'p_matrix_norm': np.linalg.norm(self.P),
            'q_matrix_norm': np.linalg.norm(self.Q),
            'user_bias_norm': np.linalg.norm(self.user_biases),
            'movie_bias_norm': np.linalg.norm(self.movie_biases),
            'regularization_loss': self.calculate_regularization_loss()
        }

def compare_regularization_effects():
    """Compare models with different regularization strengths."""
    print("=== Comparing Regularization Effects ===")
    
    reg_values = [0.0, 0.01, 0.1, 0.5]
    results = []
    
    for reg_lambda in reg_values:
        print(f"\nTraining with regularization lambda = {reg_lambda}")
        model = RegularizedMatrixFactorization(
            num_factors=2, 
            learning_rate=0.01,
            learning_rate_bias=0.005,
            reg_lambda=reg_lambda,
            num_epochs=100
        )
        model.train(verbose=False)
        
        metrics = model.evaluate_model()
        complexity = model.get_model_complexity()
        
        results.append({
            'reg_lambda': reg_lambda,
            'mae': metrics['mae'],
            'rmse': metrics['rmse'],
            'regularization_loss': complexity['regularization_loss'],
            'total_norm': (complexity['p_matrix_norm'] + 
                          complexity['q_matrix_norm'] + 
                          complexity['user_bias_norm'] + 
                          complexity['movie_bias_norm'])
        })
    
    # Display comparison
    print(f"\n{'Lambda':<8} {'MAE':<8} {'RMSE':<8} {'Reg Loss':<12} {'Total Norm':<12}")
    print("-" * 50)
    for result in results:
        print(f"{result['reg_lambda']:<8} {result['mae']:<8.4f} {result['rmse']:<8.4f} "
              f"{result['regularization_loss']:<12.4f} {result['total_norm']:<12.4f}")

def demo_regularized_matrix_factorization():
    """Demonstrate the regularized matrix factorization implementation."""
    print("=== Regularized Matrix Factorization Demo ===")
    
    # Create and train model
    model = RegularizedMatrixFactorization(
        num_factors=2, 
        learning_rate=0.01,
        learning_rate_bias=0.005,
        reg_lambda=0.1,
        num_epochs=100
    )
    model.train()
    
    # Evaluate model
    metrics = model.evaluate_model()
    complexity = model.get_model_complexity()
    
    print(f"\nModel Performance:")
    print(f"Mean Absolute Error (MAE): {metrics['mae']:.4f}")
    print(f"Root Mean Square Error (RMSE): {metrics['rmse']:.4f}")
    print(f"Regularization Loss: {complexity['regularization_loss']:.4f}")
    print(f"Total Parameters: {complexity['num_parameters']}")
    
    # Get recommendations for each user
    print("\n=== Recommendations for Each User ===")
    for user_id in range(len(users)):
        user_name = users[user_id]
        recommendations = model.get_recommendations(user_id)
        
        print(f"\nRecommendations for {user_name}:")
        for movie_id, predicted_rating, movie_title in recommendations:
            print(f"  - {movie_title}: {predicted_rating:.2f} stars")
    
    # Compare regularization effects
    print("\n" + "="*60)
    compare_regularization_effects()

if __name__ == "__main__":
    demo_regularized_matrix_factorization()

