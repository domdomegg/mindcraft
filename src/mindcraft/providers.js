// Metadata for the API-providers setup panel: maps each provider (the `api`
// prefix used in profiles, see src/models/*.js) to its env-var key name and a
// short list of suggested models. Suggested models are just defaults for the
// dropdown — any model string the provider accepts will work.
//
// Order matters: the first entry is the wizard's default selection, matching
// upstream's default (OpenAI / andy.json uses gpt-4o-mini).

export const PROVIDERS = [
    { api: 'openai',      label: 'OpenAI',           key: 'OPENAI_API_KEY',     models: ['gpt-4o-mini', 'gpt-4o', 'o1-mini'] },
    { api: 'anthropic',   label: 'Anthropic',        key: 'ANTHROPIC_API_KEY',  models: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-3-5-haiku-latest'] },
    { api: 'google',      label: 'Google Gemini',    key: 'GEMINI_API_KEY',     models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
    { api: 'xai',         label: 'xAI (Grok)',       key: 'XAI_API_KEY',        models: ['grok-beta'] },
    { api: 'deepseek',    label: 'DeepSeek',         key: 'DEEPSEEK_API_KEY',   models: ['deepseek-chat', 'deepseek-reasoner'] },
    { api: 'mistral',     label: 'Mistral',          key: 'MISTRAL_API_KEY',    models: ['mistral-large-latest', 'mistral-small-latest'] },
    { api: 'groq',        label: 'Groq',             key: 'GROQCLOUD_API_KEY',  models: ['groq/llama-3.1-70b-versatile', 'groq/mixtral-8x7b-32768'] },
    { api: 'qwen',        label: 'Qwen',             key: 'QWEN_API_KEY',       models: ['qwen-max', 'qwen-plus'] },
    { api: 'replicate',   label: 'Replicate',        key: 'REPLICATE_API_KEY',  models: ['replicate/meta/meta-llama-3-70b-instruct'] },
    { api: 'openrouter',  label: 'OpenRouter',       key: 'OPENROUTER_API_KEY', models: ['openrouter/anthropic/claude-sonnet-4-6', 'openrouter/openai/gpt-4o'] },
    { api: 'huggingface', label: 'Hugging Face',     key: 'HUGGINGFACE_API_KEY',models: ['huggingface/meta-llama/Meta-Llama-3-70B-Instruct'] },
    { api: 'novita',      label: 'Novita',           key: 'NOVITA_API_KEY',     models: ['novita/meta-llama/llama-3.1-70b-instruct'] },
    { api: 'hyperbolic',  label: 'Hyperbolic',       key: 'HYPERBOLIC_API_KEY', models: ['hyperbolic/meta-llama/Meta-Llama-3.1-70B-Instruct'] },
    { api: 'cerebras',    label: 'Cerebras',         key: 'CEREBRAS_API_KEY',   models: ['cerebras/llama3.1-70b'] },
    { api: 'mercury',     label: 'Mercury',          key: 'MERCURY_API_KEY',    models: ['mercury/mercury-coder-small'] },
    { api: 'glhf',        label: 'glhf.chat',        key: 'GHLF_API_KEY',       models: ['glhf/hf:meta-llama/Meta-Llama-3.1-70B-Instruct'] },
    { api: 'azure',       label: 'Azure OpenAI',     key: 'OPENAI_API_KEY',     models: ['azure/gpt-4o'] },
    { api: 'ollama',      label: 'Ollama (local)',   key: null,                 models: ['ollama/sweaterdog/andy-4', 'ollama/llama3'] },
    { api: 'lmstudio',    label: 'LM Studio (local)',key: null,                 models: ['lmstudio/default'] },
    { api: 'vllm',        label: 'vLLM (local)',     key: null,                 models: ['vllm/default'] },
];

export function configuredProviders(keys) {
    const have = new Set(Object.entries(keys).filter(([, v]) => v).map(([k]) => k));
    return PROVIDERS.map(p => ({
        ...p,
        configured: p.key === null || have.has(p.key) || !!process.env[p.key],
    }));
}
