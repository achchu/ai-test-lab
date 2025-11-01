import fetch from 'node-fetch';
import { OllamaGenerateRequest, OllamaGenerateResponse, OllamaErrorResponse, GenerateOptions, OllamaOptions } from '../types/ollama.types';
import { OLLAMA_BASE_URL, OLLAMA_ENDPOINTS, MODELS, DEFAULT_OPTIONS } from '../config/models.config';

/**
 * Maps API with Ollama API structure
 */

function mapOptions(options: GenerateOptions): OllamaOptions {
    const ollamaOptions: OllamaOptions = {};

    if(options.temperature !== undefined){
        ollamaOptions.temperature = options.temperature;
    }

    if(options.maxTokens !== undefined) {
        ollamaOptions.max_tokens = options.maxTokens;
    }

    if(options.seed !== undefined) {
        ollamaOptions.seed = options.seed;
    }

    if(options.topK !== undefined) {
        ollamaOptions.top_k = options.topK;
    }

    if(options.topP !== undefined) {
        ollamaOptions.top_p = options.topP;
    }

    return ollamaOptions;
}

/**
 * Generating a response from Ollama
 * @param prompt - The question/instruction given to the model
 * @param options - Optional generation settings
 * @returns AI models text response
 * @throws Error if Ollama is not running or request fails
 */

export async function generateResponse(
    prompt: string,
    options?: GenerateOptions
): Promise<string> {
    const finalOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    const model = options?.model || MODELS.PRIMARY;
    const ollamaOptions = mapOptions(finalOptions);

    const requestBody: OllamaGenerateRequest = {
        model: model,
        prompt: prompt,
        stream: false,
        options: ollamaOptions,
    };
    
    try {
        const url = `${OLLAMA_BASE_URL}${OLLAMA_ENDPOINTS.GENERATE}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if(!response.ok) {
            let errorMessage = `Ollama API error (${response.status})`;

            try {
                const errorData = await response.json() as OllamaErrorResponse;
                errorMessage = errorData.error || errorMessage;

                if(errorMessage.includes('model') && errorMessage.includes('not found')){
                    errorMessage += `\n\nPull the model with: ollama pull ${model}`;
                }
            } catch {
            }
            throw new Error(errorMessage)
        }
        
        const data = await response.json() as OllamaGenerateResponse;
        if(!data.response){
            throw new Error('Ollama returned empty response');
        }
        
        return data.response;
    } catch (error) {
        if(error instanceof Error) {
            if(error.message.includes('ECONNREFUSED')) {
                throw new Error(
                    'Cannot connect to Ollama. Make sure it is running.\n' +
                    'Start Ollama with: ollama serve'
                );
            }
            throw error;
        }
        throw new Error('Unknown error occurred');
    }
}

/**
 * Health check on Ollama service is running and accessible
 * @returns true if Ollama responds, false otherwise
 */

export async function isOllamaRunning(): Promise<boolean> {
    try {
        const url = `${OLLAMA_BASE_URL}${OLLAMA_ENDPOINTS.VERSION}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Generate response with ful metadata(we can use this for performance/advanced testing)
 * @param prompt - The question/instruction for the AI
 * @param options - Optional generation settings
 * @returns Full Ollama response including timing data, token counts etc
 */

export async function generateDetailedResponse(
    prompt:string,
    options?: GenerateOptions
): Promise<OllamaGenerateResponse> {
    const finalOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    const model = options?.model || MODELS.PRIMARY;
    const ollamaOptions = mapOptions(finalOptions);

    const requestBody: OllamaGenerateRequest = {
        model: model,
        prompt: prompt,
        stream: false,
        options: ollamaOptions,
    };

    try {
        const url = `${OLLAMA_BASE_URL}${OLLAMA_ENDPOINTS.GENERATE}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if(!response.ok) {
            let errorMessage = `Ollama API error (${response.status})`;

            try {
                const errorData = await response.json() as OllamaErrorResponse;
                errorMessage = errorData.error || errorMessage;

                if(errorMessage.includes('model') && errorMessage.includes('not found')) {
                    errorMessage += `\n\nPull the model with: ollama pull ${model}`;
                }
            } catch {}
            throw new Error(errorMessage)
        }
        
        const data = await response.json() as OllamaGenerateResponse;

        if(!data.response) {
            throw new Error('Ollama returned empty response');
        }
        return data;
    } catch (error) {
        if (error instanceof Error){
            if (error.message.includes('ECONNREFUSED')){
                throw new Error(
                    'Cannot connect to Ollama. Make sure it is running.\n' +
                    'Start Ollama with: ollama serve'
                );
            }
            throw error;
        }
        throw new Error('Unknown error occurred');
    }
}
    
