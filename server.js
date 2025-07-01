// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Added dotenv import

// Load environment variables from .env file
dotenv.config(); // Added dotenv config call

// For ES Modules, __dirname needs to be derived
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log('Server.js: Starting up...'); // <--- 新增诊断日志
const app = express();
const PORT = process.env.PORT || 3001; // Changed to PORT to match server.js content

// Middleware
app.use(cors());
app.use(express.json());
console.log('Server.js: Middleware configured.'); // <--- 新增诊断日志

// API keys from environment variables (these will be set on the server)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API keys
if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables');
}

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables');
}

// API routes
console.log('Server.js: Defining API routes...'); // <--- 新增诊断日志

// OpenAI proxy route
app.post('/api/proxy/openai', async (req, res) => {
  console.log('Server.js: Received POST request for /api/proxy/openai'); // <--- 新增诊断日志
  try {
    const { messages, model, temperature } = req.body;
    
    if (!OPENAI_API_KEY) {
      console.error('Server.js: OpenAI API Key not configured!'); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key is not configured on the server' 
      });
    }
    
    console.log('OpenAI API Request initiated.'); // <--- 新增诊断日志
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    });
    
    console.log('OpenAI response status:', response.status); // <--- 新增诊断日志

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI API:', textBody.substring(0, 500)); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data); // <--- 新增诊断日志
      return res.status(response.status).json({ 
        success: false, 
        error: data.error?.message || `API error: ${response.status}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in OpenAI proxy:', error); // <--- 新增诊断日志
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error calling OpenAI API' 
    });
  }
});

// Google Gemini API proxy endpoint
app.post('/api/proxy/gemini', async (req, res) => {
  console.log('Server.js: Received POST request for /api/proxy/gemini'); // <--- 新增诊断日志
  try {
    const { prompt } = req.body;
    
    if (!GEMINI_API_KEY) {
      console.error('Server.js: Gemini API Key not configured!'); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key is not configured on the server' 
      });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Gemini API Request to URL initiated.'); // <--- 新增诊断日志
    
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
    
    console.log('Gemini response status:', response.status); // <--- 新增诊断日志

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini API:', textBody.substring(0, 500)); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data); // <--- 新增诊断日志
      return res.status(response.status).json({ 
        success: false, 
        error: data.error?.message || `API error: ${response.status}` 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in Gemini proxy:', error); // <--- 新增诊断日志
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error calling Gemini API' 
    });
  }
});

// OpenAI API status check endpoint
app.get('/api/status/openai', async (req, res) => {
  console.log('Server.js: Received GET request for /api/status/openai'); // <--- 新增诊断日志
  try {
    if (!OPENAI_API_KEY) {
      console.error('Server.js: OpenAI API Key not configured for status check!'); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key is not configured on the server' 
      });
    }

    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const responseTime = Date.now() - startTime;
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI status check:', textBody.substring(0, 500)); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
        responseTime
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI status check error:', data); // <--- 新增诊断日志
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
    console.error('Error checking OpenAI API status:', error); // <--- 新增诊断日志
    res.status(500).json({ 
      success: false, 
      available: false,
      error: error.message || 'Unknown error checking API availability' 
    });
  }
});

// Google Gemini API status check endpoint
app.get('/api/status/gemini', async (req, res) => {
  console.log('Server.js: Received GET request for /api/status/gemini'); // <--- 新增诊断日志
  try {
    if (!GEMINI_API_KEY) {
      console.error('Server.js: Gemini API Key not configured for status check!'); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
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
    
    console.log('Making Gemini status check to API.'); // <--- 新增诊断日志
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContent)
    });

    const responseTime = Date.now() - startTime;
    console.log('Gemini status check response status:', response.status); // <--- 新增诊断日志
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini status check:', textBody.substring(0, 500)); // <--- 新增诊断日志
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
        responseTime
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini status check error:', data); // <--- 新增诊断日志
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
    console.error('Error checking Gemini API status:', error); // <--- 新增诊断日志
    res.status(500).json({ 
      success: false, 
      available: false,
      error: error.message || 'Unknown error checking API availability' 
    });
  }
});

// Serve static files from the 'dist' directory when in production
// <--- 请将下方整个 if (process.env.NODE_ENV === 'production') 块注释掉，例如：
/*
if (process.env.NODE_ENV === 'production') {
  console.log('Server.js: Running in production mode, attempting to serve static files...'); // <--- 新增诊断日志
  // Serve static files
  app.use(express.static(path.join(__dirname, 'dist')));

  // Handle any requests that don't match the API routes
  app.get('*', (req, res) => {
    console.log('Server.js: Serving index.html for unknown GET route.'); // <--- 新增诊断日志
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
    console.log('Server.js: Running in development mode, static file serving skipped.'); // <--- 新增诊断日志
}
*/
// <--- 注释结束。确保您在注释时没有删除任何代码，只是用 /* ... */ 包裹起来

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`OpenAI API key ${OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
  console.log(`Gemini API key ${GEMINI_API_KEY ? 'is' : 'is NOT'} configured`);
});
console.log('Server.js: End of file reached, server setup complete.'); // <--- 新增诊断日志