


const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testLoggingOptOut() {
  try {
    // Clear existing logs
    const logDir = './logs';
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
      fs.mkdirSync(logDir);
    }

    // Test 1: Request with logging enabled (default)
    console.log('Test 1: Request with logging enabled (default)...');
    try {
      await axios.post('http://localhost:3001/v1/completions', {
        model: 'thinker',
        prompt: 'Test request with logging enabled',
        max_tokens: 10
      });
    } catch (error) {
      console.log('Expected error (no inference server):', error.message);
    }

    // Test 2: Request with logging disabled
    console.log('\nTest 2: Request with logging disabled...');
    try {
      await axios.post('http://localhost:3001/v1/completions', {
        model: 'thinker',
        prompt: 'Test request with logging disabled',
        max_tokens: 10,
        log_request: false
      });
    } catch (error) {
      console.log('Expected error (no inference server):', error.message);
    }

    // Test 3: Another request with logging enabled
    console.log('\nTest 3: Another request with logging enabled...');
    try {
      await axios.post('http://localhost:3001/v1/completions', {
        model: 'thinker',
        prompt: 'Another test request with logging enabled',
        max_tokens: 10
      });
    } catch (error) {
      console.log('Expected error (no inference server):', error.message);
    }

    // Check logs
    const files = fs.readdirSync(logDir);
    console.log(`\nFound ${files.length} log files:`);

    // Group logs by prompt to verify opt-out worked
    const logsByPrompt = {};
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      if (fs.statSync(filePath).size > 0) {
        const logContent = fs.readFileSync(filePath, 'utf8');
        const logData = JSON.parse(logContent);
        logsByPrompt[logData.prompt] = (logsByPrompt[logData.prompt] || 0) + 1;
      }
    });

    console.log('Logs by prompt:');
    for (const [prompt, count] of Object.entries(logsByPrompt)) {
      console.log(`- "${prompt}": ${count} logs`);
    }

    // Verify that the "logging disabled" request was not logged
    if (logsByPrompt['Test request with logging disabled'] === undefined || logsByPrompt['Test request with logging disabled'] === 0) {
      console.log('\n✅ SUCCESS: Request with log_request=false was not logged');
    } else {
      console.log(`\n❌ FAILURE: Request with log_request=false was logged ${logsByPrompt['Test request with logging disabled']} times`);
    }

  } catch (error) {
    console.error('Error during testing:', error.message || error);
  }
}

testLoggingOptOut();


