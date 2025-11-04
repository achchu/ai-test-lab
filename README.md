# AI Test Lab

> **Back to basics: A practical framework for testing LLM-based applications**

AI testing doesn't have to be complicated. This project demonstrates how to apply **fundamental testing principles** to Large Language Models (LLMs) using familiar tools and concepts.

---

## Project Vision

As AI becomes ubiquitous, we often get overwhelmed by the complexity. This framework strips things back to basics:

- **Start simple**: Test text-based LLM responses
- **Apply existing knowledge**: Traditional testing principles work for AI too
- **Understand fundamentals**: Temperature, seeds, and how they affect behavior

**This is intentionally simplified.** Focuses on core concepts like `temperature` and `seed`, with basic exploration of advanced parameters (`top_k`, `top_p`) and security testing.

---

## What Does This Framework Test?

1. **Response Quality** - Basic functionality and performance
2. **Consistency & Reproducibility** - Temperature, seed, top_k and top_p effects
3. **Hallucination Detection** - Model uncertainty and truthfulness
4. **Security - Prompt Injection** - LLMO1 from OWASP Top 10 for LLMs

---

## 🛠️ Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** - Local LLM runtime
   ```bash
   # Install Ollama
   # macOS: Download from https://ollama.com
   # Or use: brew install ollama

   # Pull the model
   ollama pull llama3.1:8b

   # Start Ollama (if not auto-started)
   ollama serve
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/achchu/ai-test-lab.git
cd ai-test-lab

# Install dependencies
npm install

# Run tests
npm test
```

---

### Running All Tests
```bash
npm test
```

### Running Specific Test Suite
```bash
npm test -- tests/integration/quality.test.ts
npm test -- tests/integration/consistency.test.ts
npm test -- tests/integration/hallucination.test.ts
npm test -- tests/integration/security.test.ts
```

---

## Key Concepts

### Temperature
Controls randomness in AI responses:
- `0.0` = Deterministic (always the same answer)
- `0.7` = Balanced (default)
- `1.5` = Creative/varied

```typescript
// Deterministic response
const response1 = await generateResponse("What is 2+2?", { temperature: 0.0 });
const response2 = await generateResponse("What is 2+2?", { temperature: 0.0 });
// response1 ≈ response2 (very similar)

// Creative response
const creative = await generateResponse("Name a color", { temperature: 1.5 });
// Much more varied responses
```

### Seed
Makes randomness reproducible:
```typescript
// Exact same output
const r1 = await generateResponse("Hello", { temperature: 0.7, seed: 42 });
const r2 = await generateResponse("Hello", { temperature: 0.7, seed: 42 });
// r1 === r2 (identical)
```

### top_k
Limits the model to consider only the top K most likely next tokens:
- Lower values (e.g., top_k: 5) = More restrictive, less variety
- Higher values (e.g., top_k: 50) = More options, more variety
```typescript
// Restricted vocabulary
const restricted = await generateResponse("Name a color", { 
  temperature: 0.7, 
  top_k: 5 
});

// Wider vocabulary
const varied = await generateResponse("Name a color", { 
  temperature: 0.7, 
  top_k: 50 
});
```
### top_p (Nucleus Sampling)
Dynamically selects tokens based on cumulative probability: 
- Lower values (e.g., top_p: 0.5) = Only most likely tokens (50% probability mass)
- Higher values (e.g., top_p: 0.95) = Includes less likely tokens (95% probability mass)
```typescript
// Conservative sampling
const conservative = await generateResponse("Describe the weather", { 
  temperature: 0.7, 
  top_p: 0.5 
});

// More diverse sampling
const diverse = await generateResponse("Describe the weather", { 
  temperature: 0.7, 
  top_p: 0.95 
});
```
---

### Why Some Tests Fail
AI is probabilistic. Test results vary based on:
- Model version
- Randomness (even at low temperature)
- Prompt interpretation
- Inherent model vulnerabilities
