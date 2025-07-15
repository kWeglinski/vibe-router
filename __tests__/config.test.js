


const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../config');

jest.mock('fs');

describe('config', () => {
  const mockConfigPath = '/path/to/config.json';
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    fs.readFileSync.mockClear();
  });

  test('loadConfig should read and parse config file', () => {
    const mockConfig = JSON.stringify({
      modelMapping: { thinker: 'model1' },
      inferenceServerUrl: 'http://localhost:5004',
      baseUrl: '',
      apiKey: ''
    });

    fs.readFileSync.mockReturnValue(mockConfig);

    const config = loadConfig(mockConfigPath);
    expect(config.modelMapping).toEqual({ thinker: 'model1' });
    expect(config.inferenceServerUrl).toBe('http://localhost:5004');
  });

  test('loadConfig should throw error for missing file', () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    expect(() => loadConfig(mockConfigPath)).toThrow('Error reading config file: ENOENT: no such file or directory');
  });

  test('loadConfig should handle baseUrl override from environment', () => {
    process.env.INFERENCE_BASE_URL = 'http://custom-server:5004';

    const mockConfig = JSON.stringify({
      modelMapping: { thinker: 'model1' },
      inferenceServerUrl: 'http://localhost:5004',
      baseUrl: '',
      apiKey: ''
    });

    fs.readFileSync.mockReturnValue(mockConfig);

    const config = loadConfig(mockConfigPath);
    expect(config.inferenceServerUrl).toBe('http://custom-server:5004/');
  });

  test('loadConfig should handle apiKey override from environment', () => {
    process.env.INFERENCE_API_KEY = 'test-api-key';

    const mockConfig = JSON.stringify({
      modelMapping: { thinker: 'model1' },
      inferenceServerUrl: 'http://localhost:5004',
      baseUrl: '',
      apiKey: ''
    });

    fs.readFileSync.mockReturnValue(mockConfig);

    const config = loadConfig(mockConfigPath);
    expect(config.inferenceApiKey).toBe('test-api-key');
  });

  test('loadConfig should clean baseUrl to prevent double slashes', () => {
    process.env.INFERENCE_BASE_URL = 'http://custom-server:5004/';

    const mockConfig = JSON.stringify({
      modelMapping: { thinker: 'model1' },
      inferenceServerUrl: 'http://localhost:5004',
      baseUrl: '',
      apiKey: ''
    });

    fs.readFileSync.mockReturnValue(mockConfig);

    const config = loadConfig(mockConfigPath);
    expect(config.inferenceServerUrl).toBe('http://custom-server:5004/');
  });
});


