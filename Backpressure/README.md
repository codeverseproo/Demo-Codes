# 🤖 AI Agent Backpressure Framework

> Framework for managing AI-generated code review backpressure

[![Tests](https://github.com/YOUR_ORG/backpressure-framework/actions/workflows/tests.yml/badge.svg)](https://github.com/YOUR_ORG/backpressure-framework/actions)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

When AI generates code faster than humans can review it, teams face review backpressure—delayed feedback, rubber-stamp approvals, and declining code quality.

This framework applies distributed systems backpressure patterns to code review, ensuring review quality scales with generation volume.

**Result**: 40% reduction in post-merge fixes, maintained 4-hour review SLA over 6 months.

---

## Installation

```bash
git clone https://github.com/YOUR_ORG/backpressure-framework.git
cd backpressure-framework
pip install -r requirements.txt
```

---

## Quick Start

### 1. PR Triage

```python
from triage import triage_pr, get_review_requirements

files = ['auth/oauth_handler.py', 'tests/test_auth.py']
size = 45

risk_level = triage_pr(files, size)  # "RED"
requirements = get_review_requirements(risk_level)
# {'reviewer_level': 'Senior', 'reviewer_count': 2}
```

### 2. Backpressure Check

```python
from backpressure import check_backpressure, get_throttle_metrics

open_prs = 12
reviewers = 2

decision = check_backpressure(open_prs, reviewers)  # "THROTTLE_AI_GENERATION"
metrics = get_throttle_metrics(open_prs, reviewers)
# {'utilization_percent': 120.0}
```

### 3. CI/CD Integration

```yaml
# .github/workflows/review-gate.yml
- name: Check Backpressure
  run: |
    python -c "
    from backpressure import check_backpressure
    import os, requests
    
    prs = requests.get('https://api.github.com/repos/...').json()
    decision = check_backpressure(len(prs), 2)
    
    if decision == 'THROTTLE_AI_GENERATION':
        print('⚠️ Review backpressure detected')
        # Skip AI generation, keep human reviews flowing
    "
```

---

## Framework Components

```
┌─────────────┬─────────────┬─────────────┬──────────────┐
│   Volume    │    Triage   │    Review   │   Workflow   │
│  Control    │             │   Routing   │  Management  │
├─────────────┼─────────────┼─────────────┼──────────────┤
│ Cap review  │ Assign to   │ Reviewer    │ Schedule     │
│ queue size  │ appropriate │ matching    │ review       │
│ Throttle    │ reviewers   │ by          │ slots,       │
│ generation  │ by risk     │ expertise   │ automate     │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

### 1. Volume Control (`backpressure.py`)

- **Threshold**: reviewer_count × 5 = max open PRs
- **Hotfix bypass**: Never block emergency fixes
- **Metrics**: Util %, SLA tracking, bottleneck ID

### 2. Triage (`triage.py`)

- **GREEN**: <50 lines, no sensitive paths → peer check
- **YELLOW**: >50 lines or new logic → senior review  
- **RED**: auth, payment, infra → senior + pair review

### 3. Review Routing

- Match reviewers to code expertise
- Load balancing across team

### 4. Workflow Management

- Schedule review slots
- Automate routine decisions

---

## Test Results

All 11 tests passing:

```bash
python tests/test_triage.py       # 6 tests ✓
python tests/test_backpressure.py # 5 tests ✓
```

---

## Architecture

### Workflow Integration

```python
# Pipeline Integration
open_prs = get_open_prs()
reviewer_count = get_available_reviewers()

if check_backpressure(open_prs, reviewer_count) == "ALLOW":
    pr_files = get_changed_files()
    pr_size = get_changes_size()
    
    risk_level = triage_pr(pr_files, pr_size)
    requirements = get_review_requirements(risk_level)
    
    assign_reviewers(requirements)
else:
    notify_team("AI generation paused - review backlog")
```

---

## Caveats & Limitations

1. **OWIF applies**: Metrics vary by team
2. **[DIRECTIONAL] only**: Results not guaranteed
3. **Works with friction, not against it**: Backpressure prevents overload, not replaces judgment

---

## Implementation Timeline

| Phase | Duration | Outcome |
|-------|----------|---------|
| Audit | Week 1   | Backlog assessment |
| Cap & Triage | Weeks 2-3 | Basic controls |
| Workflow | Weeks 4-6 | Full integration |
| Refinement | Ongoing | Metrics review |

See full checklist in `IMPLEMENTATION_CHECKLIST.md`

---

## Further Reading

- [Full Article](https://beyondit.blog/ai-agent-backpressure-framework)
- [Implementation Checklist](docs/IMPLEMENTATION_CHECKLIST.md)
- [Original Research](docs/RESEARCH.md)

---

## License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">

**Framework from [beyondit.blog](https://beyondit.blog)**  
Article: "AI Agent Backpressure: How We Fixed Our Code Review Bottleneck"

</div>