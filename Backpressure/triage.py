"""
PR Triage Classification Module

Classifies pull requests by risk level for appropriate review routing.
Part of the AI Agent Backpressure framework.
"""

import fnmatch
from typing import List, Literal

RiskLevel = Literal["GREEN", "YELLOW", "RED"]


def triage_pr(pr_files: List[str], pr_size: int) -> RiskLevel:
    """
    Classify a PR into GREEN, YELLOW, or RED risk levels.
    
    GREEN: <50 lines, no sensitive paths (peer check)
    YELLOW: >50 lines or new logic (senior review)
    RED: auth, payment, infrastructure (pair review)
    """
    high_risk_patterns = ['auth/*', '*auth*', 'payment/*', '*payment*', 
                          'infra/*', '*infra*', 'security*']
    
    for file in pr_files:
        for pattern in high_risk_patterns:
            if fnmatch.fnmatch(file, pattern):
                return "RED"
    
    if pr_size < 50:
        return "GREEN"
    
    return "YELLOW"


def get_review_requirements(risk_level: RiskLevel) -> dict:
    """Get detailed review requirements for a risk level."""
    return {
        "GREEN": {"reviewer_level": "Any", "reviewer_count": 1, 
                  "time_target_minutes": 10},
        "YELLOW": {"reviewer_level": "Senior", "reviewer_count": 1, 
                   "time_target_minutes": 20},
        "RED": {"reviewer_level": "Senior", "reviewer_count": 2, 
                "time_target_minutes": 30}
    }.get(risk_level, {"reviewer_level": "Senior", "reviewer_count": 1})


if __name__ == "__main__":
    # Demo
    tests = [
        (['src/utils.py'], 30),
        (['auth/oauth.py'], 20),
        (['api/users.py', 'models/user.py'], 120)
    ]
    
    for files, size in tests:
        risk = triage_pr(files, size)
        req = get_review_requirements(risk)
        print(f"{files} ({size} lines) → {risk}: {req}")