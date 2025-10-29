/**
 * Configuration for Ollama models and API settings
 */

export const OLLAMA_BASE_URL = 'http://localhost:11434';

export const OLLAMA_ENDPOINTS = {
    GENERATE: '/api/generate',
    VERSION: '/api/version',
    TAGS: '/api/tags',
} as const;

export const MODELS = {
    PRIMARY: 'llama3.1:8b',
    SECONDARY: 'llama3.2',
} as const;

export const DEFAULT_OPTIONS = {
    temperature: 0.7,
    maxTokens: 500
} as const;

export const TEST_CONFIG = {
    // For deterministic/reproducible tests
    DETERMINISTIC: {
        temperature: 0.0,
        seed: 42,
    },

    // For consistency testing (low randomness)
    LOW_VARIANCE: {
        temperature: 0.3,
    },

    // For creative/hallucination testing (high randomness)
    HIGH_VARIANCE: {
        temperature: 1.5,
    },

    API_TIMEOUT: 30000,
    MAX_RETRIES: 3,
} as const;

export const PERFORMANCE_THRESHOLDS = {
    MAX_RESPONSE_TIME_MS: 10000,
    MIN_TOKENS_PER_SECOND: 10,
} as const;