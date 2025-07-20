


const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testLogging() {
  try {
    // Test logging stats endpoint
    console.log('Testing /v1/logs/stats endpoint...');
    const statsResponse = await axios.get('http://localhost:3001/v1/logs/stats');
    console.log('Logging stats:', statsResponse.data);

    // Test completions request with logging enabled
    console.log('\nTesting completions request with logging enabled...');
    try {
      const completionsResponse = await axios.post('http://localhost:3001/v1/completions', {
        model: 'thinker',
        prompt: 'What is the capital of France?',
        max_tokens: 10
      });

      console.log('Completions response:', completionsResponse.data);
    } catch (error) {
      console.log('Completions request failed as expected (no inference server):', error.message);
    }

    // Test completions request with logging disabled
    console.log('\nTesting completions request with logging disabled...');
    try {
      const completionsResponse = await axios.post('http://localhost:3001/v1/completions', {
        model: 'thinker',
        prompt: 'What is the capital of Germany?',
        max_tokens: 10,
        log_request: false
      });

      console.log('Completions response (no logging):', completionsResponse.data);
    } catch (error) {
      console.log('Completions request failed as expected (no inference server):', error.message);
    }

    // Check if logs were created
    const logDir = './logs';
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      console.log(`Found ${files.length} log files:`);
      files.forEach(file => {
        const filePath = path.join(logDir, file);
        if (fs.statSync(filePath).size > 0) {
          const logContent = fs.readFileSync(filePath, 'utf8');
          console.log(`Log file ${file}:`, logContent);
        }
      });
    } else {
      console.log('No logs directory found');
    }

  } catch (error) {
    console.error('Error during testing:', error.message || error);
  }
}

testLogging();

