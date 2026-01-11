
export const OLLAMA_API_BASE = 'http://localhost:11434';

export interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
}

export const fetchInstalledModels = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${OLLAMA_API_BASE}/api/tags`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        return data.models.map((m: any) => m.name);
    } catch (error) {
        console.error('Ollama connection error:', error);
        throw error;
    }
};

export const checkOllamaStatus = async (): Promise<boolean> => {
    try {
        const response = await fetch(OLLAMA_API_BASE);
        return response.ok;
    } catch {
        return false;
    }
};
