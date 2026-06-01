"""
Unit tests for Backpressure module.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backpressure import check_backpressure, get_throttle_metrics


def test_allow_normal_load():
    """Normal load → ALLOW"""
    assert check_backpressure(4, 2) == "ALLOW"
    assert check_backpressure(10, 2) == "ALLOW"  # at threshold
    print("✓ test_allow_normal_load passed")


def test_throttle_high_load():
    """High load → THROTTLE"""
    assert check_backpressure(15, 2) == "THROTTLE_AI_GENERATION"
    assert check_backpressure(20, 3) == "THROTTLE_AI_GENERATION"
    print("✓ test_throttle_high_load passed")


def test_hotfix_bypass():
    """Hotfix branches bypass throttle"""
    assert check_backpressure(20, 2, "hotfix/critical-bug") == "ALLOW"
    assert check_backpressure(30, 2, "emergency/security-fix") == "ALLOW"
    print("✓ test_hotfix_bypass passed")


def test_no_reviewers():
    """No reviewers → THROTTLE"""
    assert check_backpressure(5, 0) == "THROTTLE_AI_GENERATION"
    print("✓ test_no_reviewers passed")


def test_empty_prs():
    """No open PRs → ALLOW"""
    assert check_backpressure(0, 2) == "ALLOW"
    print("✓ test_empty_prs passed")


if __name__ == "__main__":
    test_allow_normal_load()
    test_throttle_high_load()
    test_hotfix_bypass()
    test_no_reviewers()
    test_empty_prs()
    print("\nAll 5 backpressure tests passed!")