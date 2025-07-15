















# Model Proxy Server

A proxy server for model inference requests that replaces friendly model names with actual model names, making it easy to update models across pipelines and workflows.

## Features

- Configurable through JSON file
- Exposes OpenAI-compatible endpoint
- Proxies requests to actual inference server while replacing model names
- Supports streaming functionality

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/model-proxy.git
   cd model-proxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```



## Configuration

The proxy server reads configuration from `config.json` file. The configuration includes:

- `modelMapping`: Maps friendly model names to actual inference server model names
- `inferenceServerUrl`: Base URL for the inference server (can be overridden by environment variable)
- `baseUrl`: Optional base URL that can be used as fallback for inferenceServerUrl



Create a `config.json` file with your model mappings and inference server URL:

```json
{
  "modelMapping": {
    "thinker": "mistral-small:q4-mlx",
    "creator": "dalle2:latest",
    "whisperer": "whisper-large-v3"
  },
  "inferenceServerUrl": "http://your-inference-server/v1"
}
```

## Usage

Start the proxy server:

```bash
npm start
```

The server will run on port 3001 by default and expose OpenAI-compatible endpoints.

## Example Request

```bash
curl -X POST http://localhost:3001/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "thinker", "prompt": "Hello, world!"}'
```

This request will be forwarded to the inference server with model name replaced from "thinker" to "mistral-small:q4-mlx".

## Testing

A mock server is included for testing purposes. To test:

1. Start the mock server:
   ```bash
   node simple-mock-server.js
   ```

2. Start the proxy server:
   ```bash
   npm start
   ```

3. Send test requests as shown in the example above.

## Environment Variables

You can override the inference server URL and API key using environment variables. This is particularly useful in Docker environments where you might want to use service discovery or different credentials for different environments.

### Available Environment Variables

- `INFERENCE_BASE_URL`: Override the inference server URL (default: value from config.json)
- `INFERENCE_API_KEY`: Override the API key for authentication (default: value from config.json)

Example:
```bash
export INFERENCE_BASE_URL="http://your-inference-server:5004"
export INFERENCE_API_KEY="your-api-key-here"
npm start
```

## Docker Deployment

The project includes a Dockerfile for easy deployment. To build and run the Docker container:

```bash
# Build the Docker image
docker build -t model-proxy:latest .

# Run the container (with optional environment variable override)
docker run -p 3001:3001 \
  -e INFERENCE_BASE_URL="http://your-inference-server:5004" \
  -e INFERENCE_API_KEY="your-api-key-here" \
  model-proxy:latest
```

## License

MIT














