# Content Adapter API Proxy Server

This project implements a secure backend proxy server for communicating with AI APIs (OpenAI and Google Gemini) to avoid CORS issues and securely manage API keys.

## Features

- Backend proxy server to avoid CORS issues
- Secure API key management through environment variables
- Support for OpenAI and Google Gemini APIs
- Error handling and retry logic
- API status checking endpoints
- Combined development server for frontend and backend

## Project Structure

- `server.js` - Express.js backend server for proxying API requests
- `src/api/apiProxy.ts` - Frontend interface for communicating with the proxy server
- `src/api/contentAdapter.ts` - Content adaptation API implementation using the proxy
- `.env` - Environment variables for API keys (not committed to version control)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with the following variables:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

## Running the Application

The application now uses a combined development approach with both the frontend and backend running simultaneously:

```bash
npm run dev
```

This will start:
- The Express.js backend proxy server on port 3001
- The Vite development server for the frontend

## Testing the API

You can test the API connectivity by visiting the API test page at `/api-test`.

## Implementation Details

### Backend Proxy Server

The backend proxy server provides the following endpoints:

- `/api/proxy/openai` - Proxy for OpenAI API calls
- `/api/proxy/gemini` - Proxy for Google Gemini API calls
- `/api/status/openai` - Check OpenAI API availability
- `/api/status/gemini` - Check Google Gemini API availability

### Security Considerations

- API keys are stored in environment variables on the server
- Keys are never exposed to the client
- All API requests are made server-side to avoid CORS issues
- Error handling is implemented to avoid leaking sensitive information

## Production Deployment

For production deployment:

1. Build the frontend:
```bash
npm run build
```

2. Set the `NODE_ENV` environment variable to `production`
3. Start the server:
```bash
npm run server
```

The Express server will serve the static frontend files and handle API requests.