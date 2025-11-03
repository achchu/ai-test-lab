import { generateResponse } from "../../src/clients/ollama-client";
import {
    calculateSimilarity,
    calculateAverageSimilarity,
    generateMultipleResponses
} from "../../src/utils/test-helpers";
import { TEST_CONFIG } from "../../src/config/models.config";

describe('AI Response Consistency Tests', () => {

    test('should return identical responses with same seed and temp=0', async () => {
        const prompt = "What is 2+2? Answer in one sentence.";
        const options = { temperature: 0.0, seed: 42 };

        const response1 = await generateResponse(prompt, options);
        const response2 = await generateResponse(prompt, options);

        // Should be exactly identical
        expect(response1).toBe(response2);
        expect(calculateSimilarity(response1, response2)).toBe(1.0);
    });

    test('should return highly similar responses with low temperature', async () => {
        const prompt = 'Name a primary color.';

        // Generate 5 responses with low temperature
        const responses = await generateMultipleResponses(
            generateResponse,
            prompt,
            5,
            0.1
        );

        const averageSimilarity = calculateAverageSimilarity(responses);
        expect(averageSimilarity).toBeGreaterThan(0.7);
    });

    test('should return varied responses with high temperature', async () => {
        const prompt = 'Name a color.';

        // Generate 5 responses with high temperature
        const responses = await generateMultipleResponses(
            generateResponse,
            prompt,
            5,
            1.5
        );

        const averageSimilarity = calculateAverageSimilarity(responses);
        expect(averageSimilarity).toBeLessThan(0.5);
    });

    test('should demonstrate temperature affects variance', async () => {
        const prompt = 'Describe a cat in 3 words.';

        // Test with deterministic settings (temp=0.0)
        const deterministicResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            3,
            0.0
        );
        const deterministicSimilarity = calculateAverageSimilarity(deterministicResponses);

        // Test with creative settings (temp=1.5)
        const creativeResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            3,
            1.5
        );
        const creativeSimilarity = calculateAverageSimilarity(creativeResponses);
        expect(deterministicSimilarity).toBeGreaterThan(creativeSimilarity);
    });

    test('should maintain consistency across multiple parallel calls', async () => {
        const prompt = 'What is TypeScript?';
        const options = TEST_CONFIG.DETERMINISTIC;

        // Generate 3 responses in parallel
        const responses = await Promise.all([
            generateResponse(prompt, options),
            generateResponse(prompt, options),
            generateResponse(prompt, options),
        ]);

        // All should be identical
        expect(responses[0]).toBe(responses[1]);
        expect(responses[1]).toBe(responses[2]);
        expect(responses[0]).toBe(responses[2]);
    });

    test('should show different seeds produce different results', async () => {
        const prompt = 'Tell me a fun fact.';

        const response1 = await generateResponse(prompt, {
            temperature: 0.7,
            seed: 100,
        });

        const response2 = await generateResponse(prompt, {
            temperature: 0.7,
            seed: 200,
        });

        // Different seeds should produce different responses
        expect(response1).not.toBe(response2);

        // But both should be valid (non-empty)
        expect(response1.length).toBeGreaterThan(0);
        expect(response2.length).toBeGreaterThan(0);
    });

    test('should restrict variety with low top_k', async () => {
        const prompt = "Name a color";

        const restrictedResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            10,
            0.7,
            { top_k: 5}
        );

        const variedResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            10,
            0.7,
            { top_k: 50 }
        );

        const restrictedUnique = new Set(restrictedResponses).size;
        const variedUnique = new Set(variedResponses).size;

        //top_k:50 should give us more variety than top_k:5
        expect(variedUnique).toBeGreaterThanOrEqual(restrictedUnique)
    })

    test('should restrict variety with low top_p', async () => {
        const prompt = 'Describe the weather in one word';

        const restrictedResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            10,
            0/7,
            { top_p: 0.5 }
        );

        const variedResponses = await generateMultipleResponses(
            generateResponse,
            prompt,
            10,
            0.7,
            { top_p: 0.95 }
        );

        const restrictedUnique = new Set(restrictedResponses).size;
        const variedUnique = new Set(variedResponses).size;

        //top_p:0.95 should give us more variety than top_p:0.5
        expect(variedUnique).toBeGreaterThanOrEqual(restrictedUnique);

    })
});