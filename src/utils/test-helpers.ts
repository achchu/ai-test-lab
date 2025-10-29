/**
 * Helpers to check if text contains specific keywords
 * @param text - The text to search in
 * @param keywords - Array of keywords to look for
 * @param requireAll - If true, all keywords must be present. Otherwise any keyword is enough
 * @returns true if keywords are found based on requirement
 */

export function containsKeywords(
    text: string,
    keywords: string[],
    requireAll: boolean = false
): boolean {
    const lowerText = text.toLowerCase();

    if(requireAll) {
        return keywords.every(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
    } else {
        return keywords.some(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
    }
}

/**
 * Calculate the similarity between two texts(0.0 to 1.0)
 * @param text1 - First text
 * @param text2 - Second text
 * @returns Similarity score between 0.0 (completely different) and 1.0(identical)
 */

export function calculateSimilarity(text1: string, text2: string): number {
    //Normalise texts: lowercase and split into words
    const words1 = text1.toLowerCase().match(/\b\w+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b\w+\b/g) || [];

    if(words1.length === 0 && words2.length === 0) {
        return 1.0;
    }

    if(words1.length === 0 || words2.length === 0) {
        return 0.0;
    }

    // Create sets of unique words
    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Find the intersection (shared words)
    const intersection = new Set(
        [...set1].filter(word => set2.has(word))
    );

    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

/**
 * Detects if text expresses uncertainty
 * Looks for common uncertainty phrases like "don't know", "not sure", etc
 * @param text - The text to analyse
 * @returns true if uncertainty phrases are detected
 */

export function detectUncertainty(text: string): boolean {
    const lowerText = text.toLowerCase();

    //List of uncertainty phrases
    const uncertaintyPhrases = [
        "don't know",
        "do not know",
        "i don't know",
        "not sure",
        "i'm not sure",
        "i am not sure",
        "uncertain",
        "unclear",
        "cannot say",
        "can't say",
        "cannot tell",
        "can't tell",
        "cannot answer",
        "can't answer",
        "don't have information",
        "do not have information",
        "no information",
        "not available",
        "unable to",
        "i'm unable",
        "i am unable",
        "i cannot provide",
        "i can't provide",
        "beyond my knowledge",
        "outside my knowledge",
        "i don't have access",
        "no way to know",
        "impossible to say",
        "difficult to say",
    ];
    return uncertaintyPhrases.some(phrase => lowerText.includes(phrase));
}

/**
 * Measure the execution time of the async function
 * @param fn - Async function to measure
 * @returns Object with result and duration in milliseconds
 */

export async function measureResponseTime<T>(
    fn: () => Promise<T>
 ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    const duration = endTime - startTime;

    return { result, duration };
}

/**
 * Estimate token count from text (rough approximation)
 * For simplicity using the rule: ~1.3 tokens per word
 * @param text - The text to count tokens for
 * @returns Estimated number of tokens
 */

export function countTokens(text: string): number {
    const words = text.trim().split(/\s+/);
    const validWords = words.filter(word => word.length > 0);
    const estimatedTokens = Math.ceil(validWords.length * 1.3);

    return estimatedTokens;
}

/**
 * Calculate average similarity across multiple text responses
 * Compares all pairs and returns the average similarity score
 * @param responses - Array of text responses to compare
 * @returns Average similarity score (0.0 to 1.0), or 1.0 if less than 2 responses
 */
export function calculateAverageSimilarity(responses: string[]): number {
    // Edge case: need at least 2 responses to compare
    if (responses.length < 2) {
        return 1.0;
    }

    let totalSimilarity = 0;
    let comparisons = 0;

    // Compare all pairs
    for (let i = 0; i < responses.length; i++) {
        for (let j = i + 1; j < responses.length; j++) {
            totalSimilarity += calculateSimilarity(responses[i], responses[j]);
            comparisons++;
        }
    }

    return totalSimilarity / comparisons;
}

/**
 * Generate multiple model responses
 * Each response uses a different seed (0, 1, 2, ..., count-1)
 *
 * @param generateFn - Function that generates a response
 * @param prompt - The prompt to be sent to the model
 * @param count - Number of responses to generate
 * @param temperature - Temperature setting for generation
 * @returns Array of generated responses
 */
export async function generateMultipleResponses<T>(
    generateFn: (prompt: string, options: any) => Promise<T>,
    prompt: string,
    count: number,
    temperature: number
): Promise<T[]> {
    const responses: T[] = [];

    for (let i = 0; i < count; i++) {
        const response = await generateFn(prompt, {
            temperature,
            seed: i,
        });
        responses.push(response);
    }

    return responses;
}