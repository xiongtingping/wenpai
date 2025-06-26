// Backend proxy server for handling API calls securely
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// OpenAI API proxy endpoint
app.post('/api/proxy/openai', async (req, res) => {
  try {
    const { messages, model, temperature } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key is not configured on the server' 
      });
    }
    
    console.log('OpenAI API Request:', JSON.stringify({
      model: model || 'gpt-3.5-turbo-0125',
      messages: messages.map(m => ({ role: m.role })), // Log without content for privacy
      temperature: temperature || 0.7
    }));
    
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
    
    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', JSON.stringify([...response.headers.entries()]));

    // First check if response is actually JSON before attempting to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, read as text for debugging
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI API:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    // It's JSON, so now we can parse it
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
  try {
    const { prompt } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key is not configured on the server' 
      });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Gemini API Request to URL:', apiUrl.replace(GEMINI_API_KEY, 'REDACTED_KEY'));
    console.log('Request body length:', JSON.stringify(prompt).length);
    
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
    console.log('Gemini response headers:', JSON.stringify([...response.headers.entries()]));

    // First check if response is actually JSON before attempting to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, read as text for debugging
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini API:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...` 
      });
    }

    // It's JSON, so now we can parse it
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
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error calling Gemini API' 
    });
  }
});

// OpenAI API status check endpoint
app.get('/api/status/openai', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
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
    
    // First check if response is actually JSON before attempting to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, read as text for debugging
      const textBody = await response.text();
      console.error('Non-JSON response from OpenAI status check:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
        responseTime
      });
    }

    // It's JSON, so now we can parse it
    const data = await response.json();

    if (!response.ok) {
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
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key is not configured on the server' 
      });
    }

    const startTime = Date.now();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 10,
      }
    };
    
    console.log('Making Gemini status check to:', apiUrl.replace(GEMINI_API_KEY, 'REDACTED_KEY'));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContent)
    });

    const responseTime = Date.now() - startTime;
    console.log('Gemini status check response status:', response.status);
    
    // First check if response is actually JSON before attempting to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, read as text for debugging
      const textBody = await response.text();
      console.error('Non-JSON response from Gemini status check:', textBody.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        available: false,
        error: `Unexpected non-JSON response from API: ${textBody.substring(0, 100)}...`,
        responseTime
      });
    }

    // It's JSON, so now we can parse it
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

// Serve static files from the 'dist' directory when in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'dist')));

  // Handle any requests that don't match the API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`OpenAI API key ${OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
  console.log(`Gemini API key ${GEMINI_API_KEY ? 'is' : 'is NOT'} configured`);
});