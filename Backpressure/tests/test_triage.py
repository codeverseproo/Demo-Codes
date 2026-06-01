"""
Unit tests for PR Triage module.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from triage import triage_pr, get_review_requirements


def test_green_small_pr():
    """Small PR with no sensitive files → GREEN"""
    assert triage_pr(['src/utils.py'], 30) == "GREEN"
    assert triage_pr(['tests/test_user.py', 'src/models.py'], 45) == "GREEN"
    print("✓ test_green_small_pr passed")


def test_yellow_large_pr():
    """Large PR → YELLOW"""
    assert triage_pr(['api/users.py'], 100) == "YELLOW"
    print("✓ test_yellow_large_pr passed")


def test_red_auth_files():
    """Auth files → RED"""
    assert triage_pr(['auth/oauth.py'], 20) == "RED"
    assert triage_pr(['services/authentication.py'], 30) == "RED"
    print("✓ test_red_auth_files passed")


def test_red_payment_files():
    """Payment files → RED"""
    assert triage_pr(['payment/stripe.py'], 25) == "RED"
    print("✓ test_red_payment_files passed")


def test_red_infra_files():
    """Infrastructure files → RED"""
    assert triage_pr(['infra/deployment.yml'], 10) == "RED"
    assert triage_pr(['infrastructure/terraform/main.tf'], 40) == "RED"
    print("✓ test_red_infra_files passed")


def test_review_requirements():
    """Review requirements match risk levels"""
    green_req = get_review_requirements("GREEN")
    assert green_req['reviewer_count'] == 1
    
    red_req = get_review_requirements("RED")
    assert red_req['reviewer_count'] == 2
    print("✓ test_review_requirements passed")


if __name__ == "__main__":
    test_green_small_pr()
    test_yellow_large_pr()
    test_red_auth_files()
    test_red_payment_files()
    test_red_infra_files()
    test_review_requirements()
    print("\nAll 6 triage tests passed!")