// AI Provider Configuration
const aiProviders = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    apiKeyName: 'OPENAI_API_KEY',
    description: 'OpenAI models for text generation and completion'
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-instant-1', 'claude-2', 'claude-3-opus'],
    apiKeyName: 'ANTHROPIC_API_KEY',
    description: 'Anthropic Claude models for natural language tasks'
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro-exp'],
    apiKeyName: 'GEMINI_API_KEY',
    description: 'Google Gemini models for advanced AI capabilities'
  }
};

// AI Provider Service
class AIProviderService {
  constructor() {
    this.providers = aiProviders;
    this.defaultProvider = 'gemini';
    this.defaultModel = 'gemini-2.0-flash';
  }

  // Get available providers
  getProviders() {
    return this.providers;
  }

  // Get provider details
  getProvider(providerId) {
    return this.providers[providerId];
  }

  // Generate PRD content using selected provider
  async generatePRDContent(requirement, providerId, modelId, apiKey) {
    try {
      const provider = providerId || this.defaultProvider;
      const prompt = this.createPrompt(requirement);
      
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, modelId, apiKey);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt, modelId, apiKey);
        case 'gemini':
          return await this.generateWithGemini(prompt, modelId, apiKey);
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating PRD with ${providerId}:`, error);
      return this.getFallbackContent(requirement);
    }
  }
  
  // Generic content generation method for any prompt
  async generateContent(prompt, providerId, modelId, apiKey) {
    try {
      const provider = providerId || this.defaultProvider;
      
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, modelId, apiKey);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt, modelId, apiKey);
        case 'gemini':
          return await this.generateWithGemini(prompt, modelId, apiKey);
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating content with ${providerId}:`, error);
      return { testCases: [] };
    }
  }

  // Generate with OpenAI
  async generateWithOpenAI(prompt, modelId, apiKey) {
    const { Configuration, OpenAIApi } = require('openai');
    
    const configuration = new Configuration({
      apiKey: apiKey || process.env[this.providers.openai.apiKeyName],
    });
    
    const openai = new OpenAIApi(configuration);
    const model = modelId || this.defaultModel;
    
    // Call OpenAI API
    const response = await openai.createCompletion({
      model: model,
      prompt: prompt,
      max_tokens: 2500,
      temperature: 0.7,
    });
    
    // Parse response
    return JSON.parse(response.data.choices[0].text.trim());
  }

  // Generate with Anthropic
  async generateWithAnthropic(prompt, modelId, apiKey) {
    // This would use Anthropic's API client
    // For now, we'll return a mock implementation
    console.log('Using Anthropic API with model:', modelId);
    
    // In a real implementation, this would call Anthropic's API
    return this.getFallbackContent();
  }

  // Generate with Gemini
  async generateWithGemini(prompt, modelId, apiKey) {
    try {
      const axios = require('axios');
      
      const apiKeyToUse = apiKey || process.env[this.providers.gemini.apiKeyName];
      
      const model = modelId || 'gemini-2.0-flash';
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKeyToUse}`;
      
      const requestData = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };
      
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = response.data.candidates[0].content.parts[0].text;
      
      const jsonStartIndex = responseText.indexOf('{');
      const jsonEndIndex = responseText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex);
        return JSON.parse(jsonStr);
      }
      
      console.warn('No JSON found in Gemini response, returning raw text');
      return responseText;
    } catch (error) {
      console.error('Error generating content with Gemini:', error.message);
      return this.getFallbackContent();
    }
  }

  // Create prompt for AI
  createPrompt(requirement) {
    return `
    Generate a comprehensive Product Requirements Document (PRD) for the following requirement:
    
    Title: ${requirement.title}
    Description: ${requirement.description}
    Type: ${requirement.bucket.name}
    Team: ${requirement.squad.name}
    
    Please include the following sections:
    
    1. Overview: A brief summary of the requirement and its purpose.
    
    2. User Stories: 3-5 user stories in the format "As a [user type], I want to [action] so that [benefit]".
    
    3. UI Design: Detailed description of the user interface, including layout, components, and interactions.
    
    4. Backend Logic: Technical implementation details, focusing on React rendering and data flow.
    
    5. Solution Delta: How this requirement changes or enhances the existing product.
    
    6. Diagrams: Two Mermaid diagrams:
       a. A sequence diagram showing the interaction flow
       b. A component diagram showing the architecture
    
    7. Delta Prototypes: Provide detailed descriptions for UI flow prototypes that visualize:
       a. The current state of the relevant screens
       b. The proposed changes to these screens
       c. The user flow between screens
       d. Field-wise API linkages showing which UI elements connect to which API endpoints
       e. Corner cases and how they're handled in the UI
    
    Format the response as a JSON object with the following structure:
    {
      "overview": "string",
      "userStories": ["string", "string", ...],
      "uiDesign": "string",
      "backendLogic": "string",
      "diagrams": ["string", "string"],
      "solutionDelta": "string",
      "deltaPrototypes": {
        "currentState": "string",
        "proposedChanges": "string",
        "userFlow": "string",
        "apiLinkages": "string",
        "cornerCases": "string"
      }
    }
    `;
  }

  // Fallback content if AI generation fails
  getFallbackContent(requirement) {
    if (!requirement) {
      return {
        testCases: [
          {
            title: "Basic Functionality Test",
            description: "Verify that the basic functionality works as expected.",
            preconditions: ["User is logged in", "User has appropriate permissions"],
            steps: [
              {
                stepNumber: 1,
                action: "Navigate to the feature",
                expectedResult: "Feature is accessible"
              },
              {
                stepNumber: 2,
                action: "Perform basic operation",
                expectedResult: "Operation completes successfully"
              }
            ]
          }
        ]
      };
    }
    
    return {
      overview: `This PRD covers the implementation of ${requirement.title}.`,
      userStories: [
        `As a user, I want to use ${requirement.title} so that I can improve my workflow.`,
        `As an administrator, I want to configure ${requirement.title} so that it meets our organization's needs.`
      ],
      uiDesign: "The UI will consist of a main component with appropriate controls and feedback mechanisms.",
      backendLogic: "The implementation will use React components with proper state management and API integration.",
      diagrams: [
        "sequenceDiagram\n    participant User\n    participant UI\n    participant API\n    User->>UI: Interacts with feature\n    UI->>API: Sends request\n    API->>UI: Returns response\n    UI->>User: Updates display",
        "graph TD\n    A[Main Component] --> B[Sub Component 1]\n    A --> C[Sub Component 2]\n    B --> D[API Service]\n    C --> D"
      ],
      solutionDelta: "This feature will enhance the existing product by adding new capabilities that address user needs.",
      deltaPrototypes: {
        currentState: "The current system does not have this functionality.",
        proposedChanges: "The proposed changes add a new interface for this feature.",
        userFlow: "User navigates to the feature, interacts with controls, and receives feedback.",
        apiLinkages: "The UI components connect to backend APIs for data retrieval and updates.",
        cornerCases: "Error states and edge cases are handled with appropriate feedback to the user."
      }
    };
  }
}

module.exports = new AIProviderService();
