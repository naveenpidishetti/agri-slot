/**
 * Featherless.ai API Integration Service
 * Powered by Featherless.ai Serverless LLM Inference
 */

const FEATHERLESS_API_KEY = process.env.FEATHERLESS_API_KEY || '';
const FEATHERLESS_BASE_URL = process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1';
const CANDIDATE_MODELS = [
  process.env.FEATHERLESS_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2',
  'Qwen/Qwen2.5-7B-Instruct',
  'google/gemma-2-9b-it',
  'meta-llama/Meta-Llama-3.1-8B-Instruct'
];

export class FeatherlessAIService {
  /**
   * Send a chat completion request to Featherless.ai API with auto model fallback
   */
  static async generateChatCompletion({ systemPrompt, userMessage, temperature = 0.6, maxTokens = 600 }) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch(`${FEATHERLESS_BASE_URL}/chat/completions`, {
          method: 'POST',
          signal: AbortSignal.timeout(6000),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FEATHERLESS_API_KEY}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: systemPrompt || 'You are KisanAI Mitra, an expert agricultural and mandi procurement AI assistant for Indian farmers. Answer helpfully, accurately, and concisely in the requested language.'
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
            temperature,
            max_tokens: maxTokens
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return data.choices[0].message.content.trim();
          }
        }
      } catch (error) {
        // try next candidate model
      }
    }
    return null;
  }

  /**
   * Diagnose crop disease via Featherless.ai
   */
  static async diagnoseCropDiseaseWithAI({ cropType, plantPart, symptomsHint, language = 'en' }) {
    const systemPrompt = `You are a Senior Plant Pathologist and Agricultural Scientist at ICAR / KVK.
Analyze crop diseases and return practical, actionable solutions for Indian farmers.
Language requested: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Keep response focused on:
1. Disease Name
2. Causes & Symptoms
3. Organic/Biological Remedy (Neem oil, Trichoderma, etc.)
4. Chemical Fungicide/Pesticide Treatment with precise dosage per liter of water
5. Prevention Advice.`;

    const userPrompt = `Crop: ${cropType || 'Paddy/Cotton/Chilli'}
Affected Plant Part: ${plantPart || 'Leaves'}
Observed Symptoms: ${symptomsHint || 'Yellowing, brown spots, leaf curling, or pest marks'}

Please provide diagnosis and treatment plan in ${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}.`;

    const result = await this.generateChatCompletion({
      systemPrompt,
      userMessage: userPrompt,
      temperature: 0.4,
      maxTokens: 500
    });

    return result;
  }
}
