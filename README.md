


# Vibe Router

Vibe Router is a Node.js proxy server for model inference requests that provides friendly model names while maintaining compatibility with OpenAI API endpoints.

## Features

- **Model Name Mapping**: Configure friendly model names (e.g., "thinker") that map to actual model names (e.g., "mistral-small:q4-mlx")
- **OpenAI Compatibility**: Exposes `/v1/completions` endpoint compatible with OpenAI API
- **API Key Support**: Passes API keys from proxy to inference server for authentication
- **Environment Variable Support**: Allows overriding configuration via environment variables
- **CORS Support**: Enables cross-origin requests for web applications
- **Streaming Compatibility**: Designed to support streaming functionality
- **Docker Ready**: Includes Dockerfile for containerization

## Installation

```bash
npm install
```

## Configuration

Create a `config.json` file with your model mappings and server configuration:

```json
{
  "modelMapping": {
    "thinker": "mistral-small:q4-mlx",
    "creator": "other-model-name",
    "whisperer": "third-model"
  },
  "inferenceServerUrl": "http://your-inference-server:5004",
  "baseUrl": "",
  "apiKey": ""
}
```

## Environment Variables

You can override configuration values using environment variables:

- `INFERENCE_BASE_URL`: Override the inference server URL
- `INFERENCE_API_KEY`: Override the API key

## Usage

### Start the Proxy Server

```bash
npm start
```

### Make a Request

```bash
curl -X POST http://localhost:3001/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "thinker", "prompt": "Hello, world!"}'
```

## Docker Deployment

```bash
docker build -t vibe-router:latest .
docker run -p 3001:3001 \
  -e INFERENCE_BASE_URL="http://your-inference-server:5004" \
  -e INFERENCE_API_KEY="your-api-key-here" \
  vibe-router:latest
```

## Testing

Run the test suite with:

```bash
npm test
```

## Code Structure

- `config.json`: Configuration file with model mapping and server settings
- `working-proxy-refactored.js`: Main proxy server implementation
- `config.js`: Configuration loading module
- `modelMapper.js`: Model name replacement utilities
- `__tests__/`: Test directory with unit and integration tests

## License

MIT

