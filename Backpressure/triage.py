"""
PR Triage Classification Module

Classifies pull requests by risk level for appropriate review routing.
Part of the AI Agent Backpressure framework.

Tested with: Python 3.8+, GitHub Actions, GitLab CI
"""

import fnmatch
from typing import List, Literal


RiskLevel = Literal["GREEN", "YELLOW", "RED"]


def triage_pr(pr_files: List[str], pr_size: int) -> RiskLevel:
    """
    Classify a PR into GREEN, YELLOW, or RED risk levels.
    
    Args:
        pr_files: List of file paths changed in the PR
        pr_size: Total lines changed (additions + deletions)
    
    Returns:
        "GREEN": Low risk (<50 lines, no sensitive paths)
        "YELLOW": Medium risk (>50 lines or new logic)
        "RED": High risk (auth, payment, infrastructure)
    
    Example:
        >>> triage_pr(['src/utils.py'], 30)
        'GREEN'
        >>> triage_pr(['auth/oauth.py'], 20)
        'RED'
    """
    # High-risk path patterns that always require senior + pair review
    high_risk_patterns = [
        'auth/*',       # Direct auth/ directory
        '*auth*',       # Any path containing 'auth'
        'payment/*',    # Direct payment/ directory
        '*payment*',    # Any path containing 'payment'
        'infra/*',      # Direct infra/ directory
        '*infra*',      # Any path containing 'infra'
        'security*'     # Files starting with security
    ]
    
    # Check for high-risk paths
    for file in pr_files:
        for pattern in high_risk_patterns:
            if fnmatch.fnmatch(file, pattern):
                return "RED"
    
    # Small, clean PRs can use lighter review
    if pr_size < 50:
        return "GREEN"
    
    # Everything else needs senior review
    return "YELLOW"


def get_review_requirements(risk_level: RiskLevel) -> dict:
    """
    Get detailed review requirements for a risk level.
    
    Args:
        risk_level: GREEN, YELLOW, or RED
    
    Returns:
        Dict with reviewer level, count, and checklist requirements
    """
    requirements = {
        "GREEN": {
            "reviewer_level": "Any",
            "reviewer_count": 1,
            "checklist_required": False,
            "time_target_minutes": 10,
            "description": "Peer check or auto-approve"
        },
        "YELLOW": {
            "reviewer_level": "Senior",
            "reviewer_count": 1,
            "checklist_required": True,
            "time_target_minutes": 20,
            "description": "Senior review required"
        },
        "RED": {
            "reviewer_level": "Senior",
            "reviewer_count": 2,  # Pair review
            "checklist_required": True,
            "time_target_minutes": 30,
            "description": "Senior + pair review required"
        }
    }
    
    return requirements.get(risk_level, requirements["YELLOW"])


def explain_classification(pr_files: List[str], pr_size: int, risk_level: RiskLevel) -> str:
    """
    Generate human-readable explanation for classification.
    
    Useful for PR comments or notifications.
    """
    if risk_level == "RED":
        high_risk_found = [f for f in pr_files if any(
            x in f.lower() for x in ['auth', 'payment', 'infra', 'security']
        )]
        return f"RED: High-risk paths detected ({', '.join(high_risk_found[:2])}). Requires senior + pair review."
    
    if risk_level == "GREEN":
        return f"GREEN: Small PR ({pr_size} lines), no sensitive paths. Peer check sufficient."
    
    return f"YELLOW: {pr_size} lines with new logic. Senior review required."


if __name__ == "__main__":
    # Demo usage
    test_cases = [
        (['src/utils.py', 'tests/test_utils.py'], 30),
        (['api/users.py', 'models/user.py'], 120),
        (['auth/oauth_handler.py'], 25),
        (['infra/deployment.yml'], 10),
        (['payment/stripe_integration.py', 'tests/test_payment.py'], 80),
    ]
    
    print("PR Triage Classification Demo\n")
    print("=" * 60)
    
    for files, size in test_cases:
        risk = triage_pr(files, size)
        req = get_review_requirements(risk)
        explanation = explain_classification(files, size, risk)
        
        print(f"\nFiles: {files}")
        print(f"Size: {size} lines")
        print(f"Risk: {risk}")
        print(f"Requirements: {req['description']}")
        print(f"Explanation: {explanation}")
        print("-" * 60)