"""
Complete Netflix Recommendation System Demo
This script demonstrates all the concepts from the blog post in one comprehensive example.
"""

import sys
import os
import numpy as np
import matplotlib.pyplot as plt

# Add project root directory to path for imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now import using the full module path consistently
from src.basic.data_setup import display_ratings_data, get_data_info
from src.basic.matrix_factorization import BasicMatrixFactorization
from src.advanced.matrix_factorization_with_bias import MatrixFactorizationWithBias
from src.advanced.matrix_factorization_regularized import RegularizedMatrixFactorization
from src.utils.hash_table_demo import compare_search_performance

def create_comparison_plot():
    """Create a comparison plot of all three models."""
    print("\n=== Creating Model Comparison Plot ===")
    
    # Train all three models
    models = {
        'Basic MF': BasicMatrixFactorization(num_factors=2, learning_rate=0.01, num_epochs=50),
        'MF with Bias': MatrixFactorizationWithBias(num_factors=2, learning_rate=0.01, 
                                                   learning_rate_bias=0.005, num_epochs=100),
        'Regularized MF': RegularizedMatrixFactorization(num_factors=2, learning_rate=0.01,
                                                        learning_rate_bias=0.005, 
                                                        reg_lambda=0.1, num_epochs=100)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.train(verbose=False)
        metrics = model.evaluate_model()
        results[name] = metrics
    
    # Create comparison plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    model_names = list(results.keys())
    mae_values = [results[name]['mae'] for name in model_names]
    rmse_values = [results[name]['rmse'] for name in model_names]
    
    # MAE comparison
    bars1 = ax1.bar(model_names, mae_values, color=['skyblue', 'lightgreen', 'lightcoral'])
    ax1.set_ylabel('Mean Absolute Error (MAE)')
    ax1.set_title('Model Performance Comparison - MAE')
    ax1.set_ylim(0, max(mae_values) * 1.1)
    
    # Add value labels on bars
    for bar, value in zip(bars1, mae_values):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f'{value:.3f}', ha='center', va='bottom')
    
    # RMSE comparison
    bars2 = ax2.bar(model_names, rmse_values, color=['skyblue', 'lightgreen', 'lightcoral'])
    ax2.set_ylabel('Root Mean Square Error (RMSE)')
    ax2.set_title('Model Performance Comparison - RMSE')
    ax2.set_ylim(0, max(rmse_values) * 1.1)
    
    # Add value labels on bars
    for bar, value in zip(bars2, rmse_values):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f'{value:.3f}', ha='center', va='bottom')
    
    plt.tight_layout()
    
    # Fixed path - use project root relative path
    assets_dir = os.path.join(project_root, 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    plt.savefig(os.path.join(assets_dir, 'model_comparison.png'), 
                dpi=300, bbox_inches='tight')
    plt.show()
    
    return results

def demonstrate_learning_curve():
    """Demonstrate how the model learns over time."""
    print("\n=== Demonstrating Learning Curve ===")
    
    # Fixed import - use consistent src prefix
    from src.basic.data_setup import ratings
    
    # Modified training to track error over epochs
    model = BasicMatrixFactorization(num_factors=2, learning_rate=0.01, num_epochs=100)
    
    errors = []
    epochs = []
    
    for epoch in range(model.num_epochs):
        total_absolute_error = 0
        
        for user_id, user_ratings in ratings.items():
            for movie_id, actual_rating in user_ratings.items():
                predicted_rating = model.predict_rating(user_id, movie_id)
                error = actual_rating - predicted_rating
                total_absolute_error += abs(error)
                
                # Update matrices
                model.P[user_id, :] += model.learning_rate * error * model.Q[movie_id, :]
                model.Q[movie_id, :] += model.learning_rate * error * model.P[user_id, :]
        
        errors.append(total_absolute_error)
        epochs.append(epoch + 1)
    
    # Plot learning curve
    plt.figure(figsize=(10, 6))
    plt.plot(epochs, errors, 'b-', linewidth=2, marker='o', markersize=4)
    plt.xlabel('Epoch')
    plt.ylabel('Total Absolute Error')
    plt.title('Learning Curve: How the Algorithm Learns Over Time')
    plt.grid(True, alpha=0.3)
    
    # Fixed path - use project root relative path
    assets_dir = os.path.join(project_root, 'assets')
    plt.savefig(os.path.join(assets_dir, 'learning_curve.png'), 
                dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"Initial error: {errors[0]:.4f}")
    print(f"Final error: {errors[-1]:.4f}")
    print(f"Improvement: {((errors[0] - errors[-1]) / errors[0] * 100):.1f}%")

def create_matrix_visualization():
    """Create a visualization of the matrix factorization process."""
    print("\n=== Creating Matrix Visualization ===")
    
    # Fixed import - use consistent src prefix
    from src.basic.data_setup import ratings, users, movies
    
    # Create the user-item matrix
    user_item_matrix = np.full((len(users), len(movies)), np.nan)
    
    for user_id, user_ratings in ratings.items():
        for movie_id, rating in user_ratings.items():
            user_item_matrix[user_id, movie_id] = rating
    
    # Train a model to get P and Q matrices
    model = BasicMatrixFactorization(num_factors=2, learning_rate=0.01, num_epochs=50)
    model.train(verbose=False)
    
    # Create visualization
    fig, axes = plt.subplots(1, 4, figsize=(16, 4))
    
    # Original sparse matrix
    im1 = axes[0].imshow(user_item_matrix, cmap='viridis', aspect='auto')
    axes[0].set_title('Original User-Item Matrix\n(Sparse)')
    axes[0].set_xlabel('Movies')
    axes[0].set_ylabel('Users')
    axes[0].set_xticks(range(len(movies)))
    axes[0].set_xticklabels([movies[i][:10] + '...' if len(movies[i]) > 10 else movies[i] 
                            for i in range(len(movies))], rotation=45)
    axes[0].set_yticks(range(len(users)))
    axes[0].set_yticklabels([users[i] for i in range(len(users))])
    plt.colorbar(im1, ax=axes[0])
    
    # User-Feature matrix (P)
    im2 = axes[1].imshow(model.P, cmap='coolwarm', aspect='auto')
    axes[1].set_title('User-Feature Matrix (P)\n(Dense)')
    axes[1].set_xlabel('Latent Factors')
    axes[1].set_ylabel('Users')
    axes[1].set_yticks(range(len(users)))
    axes[1].set_yticklabels([users[i] for i in range(len(users))])
    plt.colorbar(im2, ax=axes[1])
    
    # Movie-Feature matrix (Q)
    im3 = axes[2].imshow(model.Q, cmap='coolwarm', aspect='auto')
    axes[2].set_title('Movie-Feature Matrix (Q)\n(Dense)')
    axes[2].set_xlabel('Latent Factors')
    axes[2].set_ylabel('Movies')
    axes[2].set_yticks(range(len(movies)))
    axes[2].set_yticklabels([movies[i][:10] + '...' if len(movies[i]) > 10 else movies[i] 
                            for i in range(len(movies))])
    plt.colorbar(im3, ax=axes[2])
    
    # Reconstructed matrix
    reconstructed = np.dot(model.P, model.Q.T)
    im4 = axes[3].imshow(reconstructed, cmap='viridis', aspect='auto')
    axes[3].set_title('Reconstructed Matrix\n(P × Q^T)')
    axes[3].set_xlabel('Movies')
    axes[3].set_ylabel('Users')
    axes[3].set_xticks(range(len(movies)))
    axes[3].set_xticklabels([movies[i][:10] + '...' if len(movies[i]) > 10 else movies[i] 
                            for i in range(len(movies))], rotation=45)
    axes[3].set_yticks(range(len(users)))
    axes[3].set_yticklabels([users[i] for i in range(len(users))])
    plt.colorbar(im4, ax=axes[3])
    
    plt.tight_layout()
    
    # Fixed path - use project root relative path
    assets_dir = os.path.join(project_root, 'assets')
    plt.savefig(os.path.join(assets_dir, 'matrix_factorization_visualization.png'), 
                dpi=300, bbox_inches='tight')
    plt.show()

def comprehensive_recommendation_demo():
    """Run a comprehensive demonstration of all recommendation approaches."""
    print("\n" + "="*80)
    print("COMPREHENSIVE NETFLIX RECOMMENDATION SYSTEM DEMONSTRATION")
    print("="*80)
    
    # 1. Display the data
    print("\n1. DATASET OVERVIEW")
    print("-" * 40)
    display_ratings_data()
    
    info = get_data_info()
    print(f"\nDataset Statistics:")
    print(f"  Users: {info['num_users']}")
    print(f"  Movies: {info['num_movies']}")
    print(f"  Ratings: {info['num_ratings']}")
    print(f"  Sparsity: {info['sparsity']:.1%}")
    
    # 2. Model comparison
    print("\n\n2. MODEL PERFORMANCE COMPARISON")
    print("-" * 40)
    comparison_results = create_comparison_plot()
    
    print("\nPerformance Summary:")
    for model_name, metrics in comparison_results.items():
        print(f"  {model_name}:")
        print(f"    MAE: {metrics['mae']:.4f}")
        print(f"    RMSE: {metrics['rmse']:.4f}")
    
    # 3. Learning curve demonstration
    print("\n\n3. LEARNING PROCESS VISUALIZATION")
    print("-" * 40)
    demonstrate_learning_curve()
    
    # 4. Matrix visualization
    print("\n\n4. MATRIX FACTORIZATION VISUALIZATION")
    print("-" * 40)
    create_matrix_visualization()
    
    # 5. Hash table performance
    print("\n\n5. HASH TABLE PERFORMANCE DEMONSTRATION")
    print("-" * 40)
    compare_search_performance(100_000)
    
    # 6. Final recommendations
    print("\n\n6. FINAL RECOMMENDATIONS FROM BEST MODEL")
    print("-" * 40)
    
    # Use the regularized model as the "best" model
    best_model = RegularizedMatrixFactorization(
        num_factors=2, 
        learning_rate=0.01,
        learning_rate_bias=0.005,
        reg_lambda=0.1,
        num_epochs=100
    )
    best_model.train(verbose=False)
    
    # Fixed import - use consistent src prefix
    from src.basic.data_setup import users
    
    print("Personalized Recommendations:")
    for user_id in range(len(users)):
        user_name = users[user_id]
        recommendations = best_model.get_recommendations(user_id, num_recommendations=2)
        
        print(f"\n  {user_name}:")
        for movie_id, predicted_rating, movie_title in recommendations:
            print(f"    • {movie_title}: {predicted_rating:.2f} ⭐")
    
    print("\n" + "="*80)
    print("DEMONSTRATION COMPLETE!")
    print("You've seen how Netflix's recommendation engine works from the ground up.")
    print("From basic matrix factorization to advanced regularization techniques,")
    print("and the crucial role of hash tables in making it all lightning-fast!")
    print("="*80)

if __name__ == "__main__":
    # Create assets directory if it doesn't exist - Fixed for cross-platform compatibility
    assets_dir = os.path.join(project_root, 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    
    # Run the comprehensive demo
    comprehensive_recommendation_demo()
