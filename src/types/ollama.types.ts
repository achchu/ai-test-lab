/**
 * Type definitions for Ollama API based on
 *  https://github.com/ollama/ollama/blob/main/docs/api.md
 */

export interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream: boolean; // false = wait for complete response
    options?: OllamaOptions;
}

export interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: string;
    context?: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
}

/**
 * All optional fields - Ollama has sensible defaults. 
 * Change it to whatever you want and play around 
*/

export interface OllamaOptions {
    temperature?: number; // 0.0-2.0, controls randomness (default: 0.7)
    max_tokens?: number; // Maximum tokens to generate
    seed?: number; // Random seed for reproducibility
    repeat_penalty?: number; //1.0-2.0 penalize repetition (default: 1.1)
    top_p?: number; //0.0-1.0, nucleus sampling (default: 0.9)
    top_k?: number; //Limit word choices to desired number (default: 40)
}

/**
 * Simplified options for generateResponse() function
 */

export interface GenerateOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    seed?: number;
    topK?: number;
    topP?: number;
}

export interface OllamaVersionResponse {
        version: string;
}

export interface OllamaErrorResponse {
    error : string;
}
