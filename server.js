// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Load environment variables from .env file
dotenv.config();

// For ES Modules, __dirname needs to be derived
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Server.js: Starting up...');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
console.log('Server.js: Middleware configured.');

// API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Proxy configuration
const PROXY_URL = process.env.PROXY_URL; // 例如: http://127.0.0.1:7890
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : null;

if (PROXY_URL) {
  console.log(`Proxy configured: ${PROXY_URL}`);
} else {
  console.log('No proxy configured');
}

// Validate API keys
if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables');
}

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables');
}

if (!DEEPSEEK_API_KEY) {
  console.warn('Warning: DEEPSEEK_API_KEY is not set in environment variables');
}

// API routes
console.log('Server.js: Defining API routes...');

// OpenAI proxy route
app.post('/api/proxy/openai', async (req, res) => {
  console.log('Server.js: Received POST request for /api/proxy/openai');
  try {
    const { messages, model, temperature } = req.body;
    
    if (!OPENAI_API_KEY) {
      console.error('Server.js: OpenAI API Key not configured!');
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key is not configured on the server' 
      });
    }
    
    console.log('OpenAI API Request initiated.');
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo-0125',
        messages,
        temperature: temperature || 0.7
      })
    };

    // Add proxy if configured
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', fetchOptions);
    
    console.log('OpenAI response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI API:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.error?.message || `API error: ${response.status}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in OpenAI proxy:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error calling OpenAI API' 
    });
  }
});

// Google Gemini API proxy endpoint
app.post('/api/proxy/gemini', async (req, res) => {
  console.log('Server.js: Received POST request for /api/proxy/gemini');
  try {
    const { prompt } = req.body;
    
    if (!GEMINI_API_KEY) {
      console.error('Server.js: Gemini API Key not configured!');
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key is not configured on the server' 
      });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Gemini API Request to URL initiated.');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
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
      })
    });
    
    console.log('Gemini response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini API:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.error?.message || `API error: ${response.status}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in Gemini proxy:', error);
    if (error.cause) {
      console.error('Cause of error in Gemini proxy:', error.cause);
    }
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error calling Gemini API'
    });
  }
});

// OpenAI API status check endpoint
app.get('/api/status/openai', async (req, res) => {
  console.log('Server.js: Received GET request for /api/status/openai');
  try {
    if (!OPENAI_API_KEY) {
      console.error('Server.js: OpenAI API Key not configured for status check!');
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: 'OpenAI API key is not configured on the server' 
      });
    }

    const startTime = Date.now();
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textBody = await response.text();
        console.error('Non-JSON response from OpenAI status check:', textBody.substring(0, 500));
        return res.status(500).json({ 
          success: false, 
          available: false,
          error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
          responseTime
        });
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('OpenAI status check error:', data);
        return res.status(response.status).json({ 
          success: false, 
          available: false,
          error: data.error?.message || `API error: ${response.status}`,
          responseTime
        });
      }

      res.json({ 
        success: true, 
        available: true,
        responseTime,
        models: data.data.length
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error checking OpenAI API status:', error);
      
      let errorMessage = error.message || 'Unknown error checking API availability';
      
      // 处理超时错误
      if (error.name === 'AbortError') {
        errorMessage = 'API请求超时，请检查网络连接';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = '网络连接超时，请检查网络设置';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = '无法解析API域名，请检查DNS设置';
      }
      
      res.status(500).json({ 
        success: false, 
        available: false,
        error: errorMessage,
        responseTime: Date.now() - startTime
      });
    }
  } catch (error) {
    console.error('Error checking OpenAI API status:', error);
    res.status(500).json({ 
      success: false, 
      available: false,
      error: error.message || 'Unknown error checking API availability' 
    });
  }
});

// Google Gemini API status check endpoint
app.get('/api/status/gemini', async (req, res) => {
  console.log('Server.js: Received GET request for /api/status/gemini');
  try {
    if (!GEMINI_API_KEY) {
      console.error('Server.js: Gemini API Key not configured for status check!');
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: 'Gemini API key is not configured on the server' 
      });
    }

    const startTime = Date.now();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const testContent = {
      contents: [
        {
          parts: [
            {
              text: "Hello, are you available?"
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 10,
      }
    };
    
    console.log('Making Gemini status check to API.');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContent)
    });

    const responseTime = Date.now() - startTime;
    console.log('Gemini status check response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini status check:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
        responseTime
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini status check error:', data);
      return res.status(response.status).json({ 
        success: false, 
        available: false,
        error: data.error?.message || `API error: ${response.status}`,
        responseTime
      });
    }

    res.json({ 
      success: true, 
      available: true,
      responseTime
    });
  } catch (error) {
    console.error('Error checking Gemini API status:', error);
    res.status(500).json({ 
      success: false, 
      available: false,
      error: error.message || 'Unknown error checking API availability' 
    });
  }
});

// DeepSeek API proxy endpoint
app.post('/api/proxy/deepseek', async (req, res) => {
  console.log('Server.js: Received POST request for /api/proxy/deepseek');
  try {
    const { messages, model, temperature } = req.body;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('Server.js: DeepSeek API Key not configured!');
      return res.status(500).json({ 
        success: false, 
        error: 'DeepSeek API key is not configured on the server' 
      });
    }
    
    console.log('DeepSeek API Request initiated.');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature: temperature || 0.7
      })
    });
    
    console.log('DeepSeek response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from DeepSeek API:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.error?.message || `API error: ${response.status}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in DeepSeek proxy:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error calling DeepSeek API' 
    });
  }
});

// DeepSeek API status check endpoint
app.get('/api/status/deepseek', async (req, res) => {
  console.log('Server.js: Received GET request for /api/status/deepseek');
  try {
    if (!DEEPSEEK_API_KEY) {
      console.error('Server.js: DeepSeek API Key not configured for status check!');
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: 'DeepSeek API key is not configured on the server' 
      });
    }

    const startTime = Date.now();
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textBody = await response.text();
        console.error('Non-JSON response from DeepSeek status check:', textBody.substring(0, 500));
        return res.status(500).json({ 
          success: false, 
          available: false,
          error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
          responseTime
        });
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('DeepSeek status check error:', data);
        return res.status(response.status).json({ 
          success: false, 
          available: false,
          error: data.error?.message || `API error: ${response.status}`,
          responseTime
        });
      }

      res.json({ 
        success: true, 
        available: true,
        responseTime,
        models: data.data?.length || 0
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error checking DeepSeek API status:', error);
      
      let errorMessage = error.message || 'Unknown error checking API availability';
      
      // 处理超时错误
      if (error.name === 'AbortError') {
        errorMessage = 'API请求超时，请检查网络连接';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = '网络连接超时，请检查网络设置';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = '无法解析API域名，请检查DNS设置';
      }
      
      res.status(500).json({ 
        success: false, 
        available: false,
        error: errorMessage,
        responseTime: Date.now() - startTime
      });
    }
  } catch (error) {
    console.error('Error checking DeepSeek API status:', error);
    res.status(500).json({ 
      success: false, 
      available: false,
      error: error.message || 'Unknown error checking API availability' 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`OpenAI API key ${OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
  console.log(`Gemini API key ${GEMINI_API_KEY ? 'is' : 'is NOT'} configured`);
  console.log(`DeepSeek API key ${DEEPSEEK_API_KEY ? 'is' : 'is NOT'} configured`);
});

console.log('Server.js: End of file reached, server setup complete.'); 