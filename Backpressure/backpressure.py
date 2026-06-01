"""
Backpressure Throttling Module

Implements volume-based throttling for AI-generated code review.
Prevents reviewer overload using backpressure patterns from distributed systems.

Tested with: Python 3.8+, GitHub Actions, GitLab CI
"""

from typing import List, Union, Literal


ThrottleDecision = Literal["ALLOW", "THROTTLE_AI_GENERATION"]

# Configurable threshold - adjust based on your team's baseline
MAX_PRS_PER_REVIEWER = 5


def check_backpressure(
    open_prs: Union[int, List[str]],
    reviewer_count: int,
    branch_name: str = "feature/default",
    hotfix_prefixes: tuple = ("hotfix/", "emergency/", "prod-fix/")
) -> ThrottleDecision:
    """
    Determine if AI generation should be throttled based on review backlog.
    
    Args:
        open_prs: Count of open PRs or list of PR identifiers
        reviewer_count: Number of available reviewers
        branch_name: Current branch name (for hotfix bypass)
        hotfix_prefixes: Tuple of branch prefixes that bypass throttle
    
    Returns:
        "ALLOW": Proceed with AI generation
        "THROTTLE_AI_GENERATION": Backlog too high, pause generation
    
    Example:
        >>> check_backpressure(4, 2)
        'ALLOW'
        >>> check_backpressure(15, 2)
        'THROTTLE_AI_GENERATION'
        >>> check_backpressure(20, 2, "hotfix/critical-bug")
        'ALLOW'  # Hotfix bypass
    """
    # Edge case: No reviewers means infinite pressure
    if reviewer_count == 0:
        return "THROTTLE_AI_GENERATION"
    
    # Emergency hotfix bypass - never block critical fixes
    if any(branch_name.startswith(prefix) for prefix in hotfix_prefixes):
        return "ALLOW"
    
    # Calculate current load
    pending_count = len(open_prs) if isinstance(open_prs, list) else open_prs
    threshold = reviewer_count * MAX_PRS_PER_REVIEWER
    
    # Apply backpressure if over threshold
    if pending_count > threshold:
        return "THROTTLE_AI_GENERATION"
    
    return "ALLOW"


def get_throttle_metrics(
    open_prs: Union[int, List[str]],
    reviewer_count: int
) -> dict:
    """
    Get detailed metrics about current review load.
    
    Returns:
        Dict with current state and recommendation
    """
    pending_count = len(open_prs) if isinstance(open_prs, list) else open_prs
    threshold = reviewer_count * MAX_PRS_PER_REVIEWER
    
    utilization = (pending_count / threshold * 100) if threshold > 0 else float('inf')
    
    return {
        "open_prs": pending_count,
        "reviewer_count": reviewer_count,
        "threshold": threshold,
        "utilization_percent": round(utilization, 1),
        "remaining_capacity": max(0, threshold - pending_count),
        "recommendation": "THROTTLE" if pending_count > threshold else "NORMAL"
    }


def suggest_mitigation(throttle_decision: ThrottleDecision, metrics: dict) -> str:
    """
    Suggest actions when throttled.
    
    Returns human-readable recommendation for team.
    """
    if throttle_decision == "ALLOW":
        return f"✅ Review capacity healthy ({metrics['utilization_percent']:.0f}% utilized)"
    
    suggestions = [
        "🚦 AI generation throttled — review backlog high",
        f"   Current: {metrics['open_prs']} PRs / {metrics['threshold']} threshold",
        "",
        "Suggested actions:",
        "  1. Pair program on existing PRs to clear backlog",
        "  2. Skip non-critical AI generation today",
        "  3. Call for additional reviewers if available",
        "  4. Consider emergency hotfix/* prefix for urgent work"
    ]
    
    return "\n".join(suggestions)


def simulate_scenarios():
    """
    Run through common scenarios to demonstrate logic.
    """
    scenarios = [
        ("Normal load", 4, 2, "feature/login"),
        ("At threshold", 10, 2, "feature/api-update"),
        ("Over threshold", 15, 2, "feature/new-module"),
        ("No reviewers", 5, 0, "feature/test"),
        ("Hotfix bypass", 20, 2, "hotfix/critical-bug"),
        ("Large team", 20, 5, "feature/big-feature"),
    ]
    
    print("Backpressure Throttling Simulation\n")
    print("=" * 70)
    
    for name, prs, reviewers, branch in scenarios:
        decision = check_backpressure(prs, reviewers, branch)
        metrics = get_throttle_metrics(prs, reviewers)
        suggestion = suggest_mitigation(decision, metrics)
        
        print(f"\nScenario: {name}")
        print(f"  PRs: {prs}, Reviewers: {reviewers}, Branch: {branch}")
        print(f"  Decision: {decision}")
        print(f"  Utilization: {metrics['utilization_percent']:.0f}%")
        print(f"  Suggestion: {suggestion.split(chr(10))[0]}")
        print("-" * 70)


if __name__ == "__main__":
    simulate_scenarios()