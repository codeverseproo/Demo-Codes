"""
Backpressure Throttling Module

Implements volume-based throttling for AI-generated code review.
Prevents reviewer overload.
"""

from typing import List, Union, Literal

ThrottleDecision = Literal["ALLOW", "THROTTLE_AI_GENERATION"]
MAX_PRS_PER_REVIEWER = 5


def check_backpressure(
    open_prs: Union[int, List[str]],
    reviewer_count: int,
    branch_name: str = "feature/default",
    hotfix_prefixes: tuple = ("hotfix/", "emergency/")
) -> ThrottleDecision:
    """
    Determine if AI generation should be throttled.
    
    ALLOW: Proceed with generation
    THROTTLE_AI_GENERATION: Backlog too high
    """
    if reviewer_count == 0:
        return "THROTTLE_AI_GENERATION"
    
    if any(branch_name.startswith(p) for p in hotfix_prefixes):
        return "ALLOW"
    
    pending = len(open_prs) if isinstance(open_prs, list) else open_prs
    if pending > reviewer_count * MAX_PRS_PER_REVIEWER:
        return "THROTTLE_AI_GENERATION"
    
    return "ALLOW"


def get_throttle_metrics(open_prs, reviewer_count: int) -> dict:
    """Get detailed metrics about current review load."""
    pending = len(open_prs) if isinstance(open_prs, list) else open_prs
    threshold = reviewer_count * MAX_PRS_PER_REVIEWER
    utilization = (pending / threshold * 100) if threshold > 0 else float('inf')
    
    return {
        "open_prs": pending,
        "reviewer_count": reviewer_count,
        "threshold": threshold,
        "utilization_percent": round(utilization, 1),
        "recommendation": "THROTTLE" if pending > threshold else "NORMAL"
    }


if __name__ == "__main__":
    # Demo
    scenarios = [
        (4, 2, "feature/login"),
        (15, 2, "feature/test"),
        (20, 2, "hotfix/critical")
    ]
    
    for prs, reviewers, branch in scenarios:
        decision = check_backpressure(prs, reviewers, branch)
        metrics = get_throttle_metrics(prs, reviewers)
        print(f"{prs} PRs, {reviewers} reviewers ({branch}) → {decision} ({metrics['utilization_percent']:.0f}%)")