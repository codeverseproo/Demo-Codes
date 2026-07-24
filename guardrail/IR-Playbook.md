# AI Security Incident Response Playbook
## Guardrail Gap Framework - Complete Operations Manual

---

## PLAYBOOK OVERVIEW

**Purpose**: Step-by-step incident response for AI security incidents involving model compromise, guardrail bypass, or ML infrastructure attacks.

**Audience**: Security engineers, ML engineers, incident commanders

**Scope**: Detection through recovery (Day 0 to Month 1)

**Prerequisites**: 
- Local LLM deployed (Ollama/vLLM)
- ModelScan installed
- Defense-in-depth layers configured

---

## SECTION 1: PLAYBOOK ACTIVATION TRIGGERS

### When to Activate This Playbook

Activate immediately if ANY of the following occur:

| Trigger | Severity | Immediate Action |
|---------|----------|------------------|
| Hosted model refuses to analyze incident | 🟡 MEDIUM | Switch to local model |
| ModelScan detects malicious model | 🔴 HIGH | Isolate + scan all models |
| Unknown model file loading | 🟠 MEDIUM | Inspect with PickleTools |
| Container escape detected | 🔴 CRITICAL | Full containment |
| Credential exposure in model | 🔴 CRITICAL | Rotate all credentials |
| Autonomous agent activity in logs | 🔴 CRITICAL | Full playbook activation |

### Playbook Roles

| Role | Responsibilities | Who |
|------|------------------|-----|
| **Incident Commander** | Overall coordination, stakeholder communication | Security Lead |
| **Technical Lead** | Containment, eradication, forensics | Senior Security Engineer |
| **ML Operations** | Model inspection, verification, recovery | ML Engineer |
| **Platform Owner** | Infrastructure containment, restoration | DevOps Lead |
| **Communications Lead** | Internal/external notifications | Engineering Manager |

---

## SECTION 2: DAY 0 - DETECTION & INITIAL RESPONSE

### Phase 1: Triage (T+0 to T+15)

#### Step 1: Confirm Incident Type

```bash
# Check for model-related indicators
modelscan scan /all/models/ --quick --output quick-scan.json
cat quick-scan.json | jq '.[] | select(.risk_level == "CRITICAL")'

# Check for suspicious container activity
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" | grep -v "Up\|Exited"
docker stats --no-stream

# Check for credential exposure
grep -r "api_key\|secret\|token\|password" /models/ --include="*.pt" --include="*.json" 2>/dev/null
```

#### Decision Tree

```
INCIDENT DETECTED
       │
       ▼
┌─────────────────────┐
│ Model compromised?  │──── YES ───► PLAYBOOK A: Model Compromise
└─────────────────────┘
       │ NO
       ▼
┌─────────────────────┐
│ Container escape?   │──── YES ───► PLAYBOOK B: Container Escape
└─────────────────────┘
       │ NO
       ▼
┌─────────────────────┐
│ Guardrail blocking? │──── YES ───► PLAYBOOK C: Guardrail Lockout
└─────────────────────┘
       │ NO
       ▼
┌─────────────────────┐
│ Unknown activity?    │──── YES ───► PLAYBOOK D: Investigation
└─────────────────────┘
```

---

### Phase 2: Containment (T+15 to T+60)

#### PLAYBOOK A: Model Compromise Response

**Objective**: Isolate malicious model, prevent execution, scan environment

**Step A1: Immediate Isolation**

```bash
# Stop all model loading processes
pkill -f "torch.load\|transformers.AutoModel"

# Quarantine suspected model
mv /models/[suspect-model] /quarantine/[suspect-model]-$(date +%Y%m%d-%H%M%S)

# Block model downloads
iptables -A OUTPUT -d huggingface.co -j DROP  # Temporary
```

**Step A2: Environment Scan**

```bash
# Full model inventory
find / -name "*.pt" -o -name "*.pth" -o -name "*.bin" 2>/dev/null > model-inventory.txt

# Scan all models
cat model-inventory.txt | while read f; do
  modelscan scan "$f" --output "reports/$(echo $f | tr '/' '_').json"
done

# Aggregate critical findings
cat reports/*.json | jq '.[] | select(.risk_level == "CRITICAL" or .risk_level == "HIGH")' > critical-models.json
```

**Step A3: Credential Check**

```bash
# Check for embedded credentials
for f in $(cat model-inventory.txt); do
  strings "$f" | grep -iE "api.key|secret|token|password" && echo "FOUND IN: $f"
done
```

---

#### PLAYBOOK B: Container Escape Response

**Objective**: Contain escaped container, prevent lateral movement, preserve forensics

**Step B1: Network Isolation**

```bash
# Identify compromised container network
docker inspect [container-id] | jq '.[0].NetworkSettings.Networks'

# Isolate container network
docker network disconnect [network-name] [container-id]

# Or use iptables for finer control
iptables -A INPUT -s [container-ip] -j DROP
iptables -A OUTPUT -d [container-ip] -j DROP
```

**Step B2: Forensic Capture**

```bash
# Capture container state before killing
docker commit [container-id] forensic-$(date +%Y%m%d-%H%M%S)

# Export filesystem
docker export [container-id] > forensic-container-$(date +%Y%m%d-%H%M%S).tar

# Capture logs
docker logs [container-id] >& forensic-logs-$(date +%Y%m%d-%H%M%S).txt

# Memory dump (if available)
docker top [container-id] > forensic-processes-$(date +%Y%m%d-%H%M%S).txt
```

**Step B3: Check for Persistence**

```bash
# Check for modified host files
docker diff [container-id]

# Check for new processes on host
ps aux | grep -E "python|torch|model"

# Check network connections
netstat -tulnp | grep ESTABLISHED
```

---

#### PLAYBOOK C: Guardrail Lockout Response

**Objective**: Enable local model analysis, document incident

**Step C1: Activate Local IR Model**

```bash
# Start local model
ollama run llama3.1:70b

# Or if using vLLM
vllm serve meta-llama/Llama-3.1-70B --port 8000 &
```

**Step C2: Transfer Analysis Context**

```python
# Prompt for local model analysis
ANALYSIS_PROMPT = """
You are a security analyst helping investigate a potential AI security incident.

Analyze the following logs/output and identify:
1. The attack vector (how did they get in?)
2. Actions taken (what did they do?)
3. Data accessed (what could they see?)
4. Persistence mechanisms (how do they stay in?)
5. Recommended remediation

Please be specific and technical.

--- DATA TO ANALYZE ---
{log_data}
--- END DATA ---

Provide your analysis below:
"""
```

**Step C3: Document Guardrail Failure**

```markdown
## Guardrail Lockout Incident Report

**Date/Time**: [Date]
**Hosted Model**: [Model name, e.g., GPT-4, Claude]
**Refusal Prompt**: [What you asked]
**Refusal Response**: [Exact refusal message]
**Local Model Used**: [Model name]
**Analysis Completed**: [Yes/No]
**Key Findings**: [Findings from local analysis]
```

---

#### PLAYBOOK D: Unknown Activity Investigation

**Step D1: Data Collection**

```bash
# Collect all relevant logs
journalctl -u docker --since "24 hours ago" > docker-logs.txt
journalctl -u kubelet --since "24 hours ago" > kube-logs.txt
docker logs $(docker ps -q) 2>&1 > container-logs.txt

# Check model access logs
grep -r "load_model\|torch.load\|from_pretrained" /var/log/ 2>/dev/null > model-access-logs.txt

# Network activity
tcpdump -i any -w network-capture-$(date +%Y%m%d-%H%M%S).pcap -W 1 -G 3600 &
```

**Step D2: Local Model Analysis**

```
Ollama prompt:
"I have the following suspicious activity in my ML infrastructure. Help me understand:
1. Is this normal behavior or a potential incident?
2. What are the indicators of compromise?
3. What should I investigate next?

[Insert logs]
"
```

---

## SECTION 3: DAY 1-3 - ERADICATION

### Eradication Checklist

- [ ] **Remove malicious artifacts**
- [ ] **Rotate all credentials**
- [ ] **Patch vulnerabilities**
- [ ] **Update security tools**
- [ ] **Verify clean state**

### Credential Rotation Matrix

| Credential | Rotation Method | Verification | Owner |
|-----------|-----------------|--------------|-------|
| Cloud API keys | Regenerate in console | Test new key works | Platform |
| DB passwords | Reset in DB + update secrets | Connection test | DBA |
| Model tokens | Revoke + regenerate | New token test | MLOps |
| Service accounts | Rotate keys | Service restart | DevOps |
| SSH keys | Generate new + distribute | SSH test | Security |
| CI/CD tokens | Regenerate | Pipeline test | DevOps |

### Model Cleanup

```bash
# Remove malicious models
for model in $(cat critical-models.json | jq -r '.[].path'); do
  rm -rf "$model"
  echo "Removed: $model"
done

# Clean model cache
rm -rf ~/.cache/huggingface/
rm -rf /tmp/model-*

# Re-download verified models
huggingface-cli download --repo [verified-org]/[model] --local-dir ./models/[model]
```

---

## SECTION 4: DAY 3-7 - RECOVERY

### Recovery Timeline

| Day | Activity | Success Criteria |
|-----|----------|------------------|
| 3 | Restore non-critical services | Services up, no alerts |
| 4 | Restore production (monitored) | Baseline metrics met |
| 5 | Full operations | All services restored |
| 6-7 | Validation | Full scan clean |

### Recovery Verification

```bash
# Post-recovery scan
modelscan scan /all/models/ --output post-recovery-scan.json
cat post-recovery-scan.json | jq '.[] | select(.risk_level != "SAFE")'
# Expected: Empty output

# Service health check
curl http://localhost:8000/health
curl http://localhost:11434/api/tags

# Log review (last 24 hours)
grep -i "error\|fail\|compromise" /var/log/*.log --since="24 hours ago"
# Expected: No incidents found
```

---

## SECTION 5: WEEK 2+ - POST-INCIDENT

### Root Cause Analysis Template

```markdown
## Root Cause Analysis

**Incident ID**: [ID]
**Date**: [Date]
**Duration**: [Detection to Resolution]
**Severity**: [Level]

### Timeline
| Time | Event | Action Taken |
|------|-------|--------------|
| T+0 | [Event] | [Action] |
| T+15 | [Event] | [Action] |
| ... | ... | ... |

### Root Cause
[What caused the incident?]

### Contributing Factors
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

### Impact
- Systems affected: [List]
- Models affected: [List]
- Data exposed: [Description]
- Duration: [Time]

### What Went Well
1. [Success 1]
2. [Success 2]

### What Could Improve
1. [Gap 1]
2. [Gap 2]

### Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | [ ] |
| [Action 2] | [Name] | [Date] | [ ] |
```

---

## SECTION 6: COMMUNICATION TEMPLATES

### Internal Notification Template

```
Subject: [SEVERITY] Security Incident - [Brief Description]

Team,

We are responding to a security incident involving [type].

**Current Status**: [Investigating / Contained / Resolved]

**Impact**: [Brief impact description]

**Immediate Actions**:
- [Action 1]
- [Action 2]

**Next Update**: [Time]

Questions: [#security-incident]
```

### Executive Summary Template

```
Subject: Security Incident Summary - [Date]

Executive Summary
==================

**Incident Type**: [Type]
**Severity**: [Level]
**Duration**: [Start] to [End]
**Status**: [Resolved / Ongoing]

**Business Impact**: [Description]

**Actions Taken**:
1. [Action]
2. [Action]

**Recommendations**:
1. [Recommendation]
2. [Recommendation]

**POC**: [Name]
```

---

## SECTION 7: METRICS & REPORTING

### Incident Metrics Dashboard

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Time to Detect (TTD) | <1 hour | _____ | |
| Time to Contain (TTC) | <4 hours | _____ | |
| Time to Eradicate (TTE) | <24 hours | _____ | |
| Time to Recover (TTR) | <7 days | _____ | |
| Models Affected | 0 | _____ | |
| Credentials Rotated | 100% | _____ | |
| Services Restored | 100% | _____ | |

### Post-Incident Checklist

- [ ] All malicious artifacts removed
- [ ] All credentials rotated
- [ ] All services restored
- [ ] Full model scan completed (clean)
- [ ] Timeline documented
- [ ] Root cause analysis completed
- [ ] Lessons learned session held
- [ ] Playbook updated (if needed)
- [ ] Detection rules improved (if applicable)
- [ ] Quarterly tabletop exercise scheduled

---

## SECTION 8: APPENDIX

### A. Quick Reference Commands

```bash
# Start local model
ollama run llama3.1:70b

# Scan model
modelscan scan ./path/to/model.pt

# Inspect pickle
python -m pickletools -d model.pt

# Stop container
docker kill [id]

# Isolate network
iptables -A INPUT -s [ip] -j DROP

# Check logs
docker logs --tail 100 [id]

# Rotate credential (example)
aws iam create-access-key --user-name [user]
```

### B. ModelScan Output Reference

```json
{
  "path": "/models/suspect.pt",
  "risk_level": "CRITICAL",
  "findings": [
    {
      "type": "PICKLE_OPCODES",
      "description": "Suspicious opcodes detected",
      "severity": "HIGH",
      "location": "Bytecode offset 0x1234"
    }
  ]
}
```

### C. Escalation Matrix

| Time Elapsed | Escalate To | Trigger |
|--------------|-------------|---------|
| T+30 min | Technical Lead | No containment achieved |
| T+2 hours | Engineering Manager | Incident spreading |
| T+4 hours | Executive Sponsor | Business impact confirmed |
| T+24 hours | Legal/Compliance | Data exposure confirmed |

---

## SECTION 9: VERSION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Beyondit.blog | Initial release |

---

*Playbook Version: 1.0*
*Framework: Guardrail Gap IR Protocol*
*For: Beyondit.blog subscribers*
