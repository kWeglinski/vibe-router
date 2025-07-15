
















const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mock endpoint for testing
app.post('/completions', (req, res) => {
  console.log('Received request with model:', req.body.model);
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    console.log('Received API key:', authHeader);
  }
  res.json({
    id: 'mock-id',
    object: 'text_completion',
    created: Math.floor(Date.now() / 1000),
    model: req.body.model || 'unknown',
    choices: [
      {
        text: 'This is a mock response from the inference server.',
        index: 0,
        logprobs: null,
        finish_reason: 'length'
      }
    ]
  });
});

const cors = require('cors');
app.use(cors({ origin: '*' }));

// Start the mock server
const PORT = 5004;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock inference server running on port ${PORT}`);
});













