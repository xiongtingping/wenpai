// API Proxy to handle secure communication with OpenAI and Google Gemini APIs
// This prevents CORS issues and secures API keys

// Define API endpoints for the proxy
export const API_ENDPOINTS = {
  OPENAI: '/api/proxy/openai',
  GEMINI: '/api/proxy/gemini',
  CHECK_OPENAI: '/api/status/openai',
  CHECK_GEMINI: '/api/status/gemini'
};

/**
 * Interface for proxy response
 */
export interface ProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Make a call to the OpenAI API through our backend proxy
 * @param messages Array of messages to send to OpenAI
 * @param model The model to use (defaults to gpt-3.5-turbo-0125)
 * @returns Promise with response data
 */
export async function callOpenAIProxy(
  messages: unknown[],
  model: string = 'gpt-3.5-turbo-0125'
): Promise<ProxyResponse> {
  try {
    console.log('Sending request to OpenAI proxy');
    
    const response = await fetch(API_ENDPOINTS.OPENAI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        temperature: 0.7
      })
    });

    console.log(`OpenAI proxy response status: ${response.status}`);

    // Check if we have a JSON response before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI proxy:', textBody.substring(0, 500));
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI proxy error:', data);
      return {
        success: false,
        error: data.error || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error calling OpenAI proxy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling OpenAI API proxy'
    };
  }
}

/**
 * Make a call to the Google Gemini API through our backend proxy
 * @param prompt The prompt to send to Gemini
 * @returns Promise with response data
 */
export async function callGeminiProxy(prompt: string): Promise<ProxyResponse> {
  try {
    console.log('Sending request to Gemini proxy');
    
    const response = await fetch(API_ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt
      })
    });

    console.log(`Gemini proxy response status: ${response.status}`);

    // Check if we have a JSON response before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini proxy:', textBody.substring(0, 500));
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini proxy error:', data);
      return {
        success: false,
        error: data.error || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error calling Gemini proxy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling Gemini API proxy'
    };
  }
}

/**
 * Check if OpenAI API is available through our backend proxy
 * @returns Promise with API status
 */
export async function checkOpenAIAvailability(): Promise<ProxyResponse> {
  try {
    console.log('Checking OpenAI API availability');
    
    const response = await fetch(API_ENDPOINTS.CHECK_OPENAI);

    console.log(`OpenAI check response status: ${response.status}`);

    // Check if we have a JSON response before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI check:', textBody.substring(0, 500));
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI check error:', data);
      return {
        success: false,
        error: data.error || `API status check error: ${response.status}`
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error checking OpenAI API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking OpenAI API availability'
    };
  }
}

/**
 * Check if Google Gemini API is available through our backend proxy
 * @returns Promise with API status
 */
export async function checkGeminiAvailability(): Promise<ProxyResponse> {
  try {
    console.log('Checking Gemini API availability');
    
    const response = await fetch(API_ENDPOINTS.CHECK_GEMINI);

    console.log(`Gemini check response status: ${response.status}`);

    // Check if we have a JSON response before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini check:', textBody.substring(0, 500));
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini check error:', data);
      return {
        success: false,
        error: data.error || `API status check error: ${response.status}`
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error checking Gemini API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking Gemini API availability'
    };
  }
}