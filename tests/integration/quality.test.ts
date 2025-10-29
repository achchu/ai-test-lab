import { generateResponse, isOllamaRunning, generateDetailedResponse } from '../../src/clients/ollama-client';
import { containsKeywords, countTokens } from '../../src/utils/test-helpers';
import { TEST_CONFIG, PERFORMANCE_THRESHOLDS } from '../../src/config/models.config';

describe('AI Response Quality Tests', () => {

    //Setup: Check Ollama is running before all tests
    beforeAll(async () => {
        const isRunning = await isOllamaRunning();
        if (!isRunning) {
            throw new Error(
                'Ollama is not running. Start it with: ollama serve'
            );
        }
    });

    test('should return non-empty response', async () => {
        const prompt = 'Say "hello" in one word.';

        const response = await generateResponse(prompt, TEST_CONFIG.DETERMINISTIC);
        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(0);
        expect(response.trim).not.toBe('');
    });

    test('should contain expected keywords for topic', async () => {
        const prompt = 'What is Typescript? Answer in one sentence.';

        const response = await generateResponse(prompt, TEST_CONFIG.DETERMINISTIC);
        expect(
            containsKeywords(response, ['Javascript', 'typed', 'type'])
        ).toBe(true);
    });

    test('should respond within acceptable time', async () => {
        const prompt = 'What is 2+2? Answer in one sentence.';

        const start = Date.now();
        await generateResponse(prompt, TEST_CONFIG.DETERMINISTIC);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME_MS);
    }, 150000);

    test('should generate resonable response length', async () => {
        const prompt = 'Explain Typescript in 2-3 sentences.';

        const response = await generateResponse(prompt, {
            ...TEST_CONFIG.DETERMINISTIC,
            maxTokens: 100,
        });

        const tokens = countTokens(response);
        expect(tokens).toBeLessThan(120);
        expect(tokens).toBeGreaterThan(10);
    });

    test('should include metadata in detailed response', async() => {
        const prompt = 'Say hello.';

        const response = await generateDetailedResponse(
            prompt, TEST_CONFIG.DETERMINISTIC );

        expect(response.response).toBeDefined();
        expect(response.model).toBeDefined();
        expect(response.total_duration).toBeGreaterThan(0);
        expect(response.eval_count).toBeGreaterThan(0);
    });

    test('should handle different prompts appropriately', async () => {
        const testCases = [
            {
                prompt: 'What is 5+3?',
                keywords: ['8', 'eight'],
                description: 'math question',
            },
            {
                prompt: 'Name a programming language.',
                keywords: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
                description: 'factual question',
            },
        ];

        for (const testCase of testCases) {
            const response = await generateResponse(
                testCase.prompt, 
                TEST_CONFIG.DETERMINISTIC
            );

            expect(response.length).toBeGreaterThan(0);
            expect(
                containsKeywords(response, testCase.keywords)
            ).toBe(true);
        }
    });
});