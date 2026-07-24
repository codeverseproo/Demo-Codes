# AI Security Incident Response Checklist
## The Guardrail Gap Implementation Guide

---

## 📋 PRE-INCIDENT PREPARATION

### Week 1: Deploy Local IR Capability

#### Day 1-2: Install Local LLM

```bash
# Option A: Ollama (Recommended for teams <50)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:70b
ollama run llama3.1:70b

# Verify installation
ollama list
# Expected: llama3.1:70b displayed

# Option B: vLLM Server (For production teams)
pip install vllm
vllm serve meta-llama/Llama-3.1-70B --port 8000

# Verify endpoint
curl http://localhost:8000/health
```

**✅ Checkpoint**: Can query local model without internet?

---

#### Day 3: Install Model Security Tools

```bash
# Install ModelScan
pip install modelscan

# Test on sample model
modelscan scan ./test-models/ --output test-report.json

# Verify output
cat test-report.json
# Expected: JSON report with scan results
```

**✅ Checkpoint**: ModelScan runs without errors?

---

#### Day 4-5: Configure Defense-in-Depth

```bash
# Layer 1: Source Verification
huggingface-cli login
huggingface-cli download --repo [your-org]/[model] --local-dir ./verified-models/

# Layer 2: Static Analysis (already installed ModelScan)

# Layer 3: Runtime Sandbox
# Docker with gVisor
docker run --runtime=runsc -d --name safe-inference your-image

# Layer 4: Network Isolation
# Block outbound during inference
iptables -A OUTPUT -p tcp --dport 443 -j DROP  # During critical inference
```

**✅ Checkpoint**: All 4 layers configured?

---

### Week 2: Validate IR Capability

#### Tabletop Exercise Template

| Scenario | Action | Expected Result | Actual | Status |
|----------|--------|-----------------|--------|--------|
| 1. Hosted model refuses | Switch to local model | Analysis completed | | [ ] |
| 2. Malicious model detected | ModelScan blocks load | Threat reported | | [ ] |
| 3. Unknown model file | PickleTools inspection | Opcodes visible | | [ ] |
| 4. Credential rotation | Rotate all keys | Access revoked | | [ ] |
| 5. Full containment | Isolate + scan | Environment clean | | [ ] |

---

## 🚨 INCIDENT RESPONSE CHECKLIST

### Immediate Actions (First 60 Minutes)

#### T+0 to T+15: Detection & Assessment

- [ ] **Identify incident type**
  - Model compromise: `modelscan scan /models/ --output incident-report.json`
  - Infrastructure breach: Check Docker/K8s logs
  - Data exfiltration: Review network logs

- [ ] **Assign severity level**
  - 🔴 CRITICAL: Production systems compromised
  - 🟠 HIGH: Models or credentials exposed
  - 🟡 MEDIUM: Suspicious activity detected
  - 🟢 LOW: Anomaly needs investigation

- [ ] **Notify stakeholders**
  - Security team lead
  - Engineering manager
  - Legal/Compliance (if data involved)

---

#### T+15 to T+30: Containment

- [ ] **Isolate affected systems**

```bash
# Stop compromised containers
docker ps | grep [identifier] | awk '{print $1}' | xargs docker stop

# Kill compromised pods
kubectl get pods --namespace [namespace] | grep [identifier] | awk '{print $1}' | xargs kubectl delete pod --grace-period=0

# Isolate network segment
iptables -A INPUT -s [compromised-ip] -j DROP
iptables -A OUTPUT -d [compromised-ip] -j DROP
```

- [ ] **Preserve evidence**

```bash
# Capture container state
docker commit [container-id] forensic-snapshot

# Export logs
docker logs [container-id] > incident-log-$(date +%Y%m%d-%H%M%S).txt

# Dump memory (if needed)
docker export [container-id] > forensic-container-$(date +%Y%m%d-%H%M%S).tar
```

- [ ] **Document timeline**
  - Detection time: ________
  - Initial response: ________
  - Containment achieved: ________

---

#### T+30 to T+60: Analysis with Local Model

- [ ] **Launch local IR model**

```bash
# Start Ollama
ollama run llama3.1:70b

# Or connect to vLLM server
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.1", "messages": [{"role": "user", "content": "Analyze these logs for attack patterns..."}]}'
```

- [ ] **Analyze logs**

Prompt template:
```
Analyze the following security logs. Identify:
1. Attack vector and initial access point
2. Actions taken by attacker
3. Data potentially accessed or exfiltrated
4. Persistence mechanisms
5. Recommended remediation steps

[Insert logs here]
```

- [ ] **Scan all models**

```bash
# Full model inventory scan
find /models -name "*.pt" -o -name "*.pth" -o -name "*.bin" | \
  while read f; do modelscan scan "$f" --output "report-$(basename $f).json"; done

# Aggregate results
cat report-*.json | jq '.[] | select(.risk_level == "HIGH" or .risk_level == "CRITICAL")' > critical-findings.json
```

---

### Day 1: Eradication

- [ ] **Remove malicious artifacts**

```bash
# Remove compromised models
rm -rf /models/[compromised-model-path]

# Clean container images
docker rmi [compromised-image]

# Clear caches
docker system prune -a --volumes
```

- [ ] **Rotate credentials**

| Credential Type | Action | New Location |
|-----------------|--------|--------------|
| Cloud API keys | Regenerate | [Your secret manager] |
| Database passwords | Reset | [Your secret manager] |
| Service tokens | Revoke + Regenerate | [Your secret manager] |
| SSH keys | Rotate | [Your access system] |

- [ ] **Patch vulnerabilities**
  - Update trust_remote_code policies
  - Patch container runtime
  - Update security tools

---

### Days 2-7: Recovery

- [ ] **Validate clean environment**

```bash
# Rescan all models
modelscan scan /all/models/ --output post-incident-scan.json

# Check for persistence
# Review cron jobs, systemd services, startup scripts

# Verify network isolation removed (if restored)
iptables -L | grep DROP
```

- [ ] **Gradual restoration**
  - [ ] Day 2: Restore non-critical services
  - [ ] Day 3-4: Restore production (with monitoring)
  - [ ] Day 5-7: Full operations

- [ ] **Monitoring intensification**
  - 15-minute log reviews (first 48 hours)
  - Hourly model access audits
  - Daily security standup

---

### Week 2+: Post-Incident

- [ ] **Root cause analysis**
  - Affected systems: ________
  - Attack vector: ________
  - Why detection was delayed: ________
  - What prevented worse impact: ________

- [ ] **Documentation**
  - [ ] Incident report complete
  - [ ] Timeline documented
  - [ ] Lessons learned session held
  - [ ] Playbook updated

- [ ] **Long-term improvements**
  - [ ] New detection rules deployed
  - [ ] IR team trained on Guardrail Gap
  - [ ] Quarterly tabletop scheduled

---

## 🔧 TOOL COMMANDS REFERENCE

### ModelScan Commands

```bash
# Basic scan
modelscan scan ./path/to/models/

# Verbose output
modelscan scan ./models/ -v

# JSON output
modelscan scan ./models/ --output report.json

# Scan specific file types
modelscan scan ./models/ --include "*.pt,*.pth,*.bin"

# Skip certain checks
modelscan scan ./models/ --skip "pickle_opcodes"
```

---

### Ollama IR Commands

```bash
# List available models
ollama list

# Run specific model
ollama run llama3.1:70b

# Run with system prompt
ollama run llama3.1:70b --system "You are a security analyst. Help identify threats."

# API endpoint
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Analyze these logs for attack patterns..."
}'
```

---

### Docker Security Commands

```bash
# List running containers
docker ps

# Inspect container
docker inspect [container-id]

# View container logs
docker logs --tail 1000 [container-id]

# Copy files from container
docker cp [container-id]:/path/to/file ./local-copy

# Kill container immediately
docker kill [container-id]

# Remove container
docker rm -f [container-id]

# Check for exposed Docker API
curl http://localhost:2375/containers/json 2>/dev/null && echo "EXPOSED"
```

---

## 📊 METRICS TO TRACK

| Metric | Before | During | After | Target |
|--------|--------|--------|-------|--------|
| Detection Time | N/A | ______ | N/A | <1 hour |
| Containment Time | N/A | ______ | N/A | <4 hours |
| Models Compromised | 0 | ______ | 0 | 0 |
| Credentials Rotated | N/A | ______ | 100% | 100% |
| Services Restored | N/A | N/A | ______ | 100% |
| Time to Full Recovery | N/A | N/A | ______ | <7 days |

---

## 📞 EMERGENCY CONTACTS

| Role | Name | Contact | Escalation Time |
|------|------|---------|-----------------|
| IR Team Lead | ________ | ________ | Immediate |
| Security Engineer | ________ | ________ | <15 min |
| Platform Lead | ________ | ________ | <30 min |
| Engineering Manager | ________ | ________ | <1 hour |
| Legal/Compliance | ________ | ________ | <2 hours |
| Executive Sponsor | ________ | ________ | <4 hours |

---

## 📝 NOTES SECTION

**Incident ID**: ________

**Date Detected**: ________

**Date Contained**: ________

**Date Resolved**: ________

**Key Learnings**:
1. ________
2. ________
3. ________

**Actions for Prevention**:
1. ________
2. ________
3. ________

---

*Checklist Version: 1.0*
*Framework: Guardrail Gap IR Protocol*
*Last Updated: July 2026*
