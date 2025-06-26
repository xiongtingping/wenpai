import { AIApiResponse, ApiStatus } from './contentAdapter';

// API Keys
const API_KEYS = {
  gemini: 'AIzaSyAfIvb9M2skofMuq2pu0Rcit-G1eOi9FjY'
};

// API Configuration
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// API Status monitoring
let currentApiStatus: ApiStatus = {
  available: true,
  lastChecked: new Date()
};

/**
 * Get the current API status
 * @returns Current API status
 */
export function getApiStatus(): ApiStatus {
  return {...currentApiStatus};
}

/**
 * Check if the Gemini API is available
 * Updates the currentApiStatus
 */
export async function checkApiAvailability(): Promise<boolean> {
  const startTime = Date.now();
  try {
    // Constructed URL with API key
    const apiUrl = `${GEMINI_API_URL}?key=${API_KEYS.gemini}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for check
    
    // Simple test content
    const testContent = {
      contents: [
        {
          parts: [
            {
              text: "Hello, are you available?"
            }
          ]
        }
      ]
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContent),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      currentApiStatus = {
        available: true,
        lastChecked: new Date(),
        responseTime
      };
      return true;
    } else {
      const errorData = await response.json();
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: errorData?.error?.message || `API error: ${response.status}`,
        responseTime
      };
      return false;
    }
  } catch (error) {
    currentApiStatus = {
      available: false,
      lastChecked: new Date(),
      errorMessage: (error instanceof Error) ? error.message : 'Unknown error checking API availability',
      responseTime: Date.now() - startTime
    };
    return false;
  }
}

/**
 * Call the Gemini API with retry logic and timeout
 * @param systemPrompt The system context/instructions 
 * @param userPrompt The user prompt
 * @param platformId The platform ID for context (used for fallback)
 * @returns Generated content with source information
 */
export async function callGeminiAPI(
  systemPrompt: string, 
  userPrompt: string, 
  platformId: string
): Promise<AIApiResponse> {
  // Construct the API URL with API key
  const apiUrl = `${GEMINI_API_URL}?key=${API_KEYS.gemini}`;
  
  // Prepare the request body according to Gemini API format
  // Gemini does not have dedicated system/user roles like OpenAI
  // So we combine both into the prompt with clear separation
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };
  
  // Add logging to troubleshoot API calls
  console.log(`Making Gemini API request for platform: ${platformId}`);
  
  // Retry loop implementation
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini API call attempt ${attempt + 1}/${MAX_RETRIES + 1} for ${platformId}`);
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      try {
        console.log('Sending request to Gemini API...');
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout since request completed
        clearTimeout(timeoutId);
        
        console.log(`Gemini API response status: ${response.status}`);
        
        // Log the response headers for debugging
        const headers = {};
        response.headers.forEach((value, name) => {
          headers[name] = value;
        });
        console.log('Gemini Response headers:', headers);
        
        // Handle non-200 responses
        if (!response.ok) {
          // Get response body for more error details
          let responseBody: any;
          try {
            responseBody = await response.json();
            console.error('Error response body:', JSON.stringify(responseBody));
          } catch (parseError) {
            console.error('Failed to parse error response body:', parseError);
          }
          
          const errorMessage = responseBody?.error?.message || `API error: ${response.status}`;
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: errorMessage
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: ${errorMessage}`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          console.error(`Gemini API error after ${attempt + 1} attempts:`, errorMessage);
          
          // Fall back to simulation when all retries fail
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: errorMessage
          };
        }
        
        // Update API status to available
        currentApiStatus = {
          available: true,
          lastChecked: new Date()
        };
        
        // Process successful response
        console.log('Processing successful Gemini API response');
        const data = await response.json();
        
        // Extract content from Gemini API response format
        // The response format is different from OpenAI
        const content = data.candidates && 
                        data.candidates[0] && 
                        data.candidates[0].content && 
                        data.candidates[0].content.parts &&
                        data.candidates[0].content.parts[0] &&
                        data.candidates[0].content.parts[0].text || "";
        
        return {
          content: content,
          source: "ai" // Indicate this content came from the AI
        };
      } catch (fetchError) {
        // Clear timeout to avoid memory leaks
        clearTimeout(timeoutId);
        
        console.error('Fetch error:', fetchError);
        
        // Handle AbortController timeout
        if (fetchError.name === 'AbortError') {
          console.error('Gemini API call timed out after', API_TIMEOUT, 'ms');
          
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue; // Try again
          }
          
          // Fall back to simulation after all retries
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: "API 请求超时，已使用模拟内容"
          };
        }
        
        // Re-throw other fetch errors
        throw fetchError;
      }
    } catch (error) {
      console.error(`Gemini API call error on attempt ${attempt + 1}:`, error);
      
      // Update API status
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      
      // For the last attempt, fall back to simulation
      if (attempt >= MAX_RETRIES) {
        return {
          content: generateSimulatedAIResponse(userPrompt, platformId),
          source: "simulation",
          error: error instanceof Error ? error.message : "API 调用失败"
        };
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the return in the final attempt, but TypeScript requires it
  return {
    content: generateSimulatedAIResponse(userPrompt, platformId),
    source: "simulation",
    error: "所有 API 重试尝试失败，已使用模拟内容"
  };
}

/**
 * Generate a simulated AI response for testing when API is unavailable
 * This is only for development/testing purposes and should be removed in production
 * @param prompt The user prompt
 * @param platformId The platform ID
 * @returns Simulated AI response
 */
function generateSimulatedAIResponse(prompt: string, platformId: string): string {
  // Extract the original content from the prompt
  const contentMatch = prompt.match(/Original content: ([\s\S]+?)(?=Platform requirements:|$)/);
  const originalContent = contentMatch ? contentMatch[1].trim() : "Sample content";
  
  return `[模拟 Gemini 响应] 为平台 ${platformId} 生成的内容：\n\n${originalContent}\n\n注意：这是模拟内容，因为无法连接到 Gemini API。`;
}