



const { replaceModelName, getAvailableModels } = require('../src/models/modelMapper');

describe('modelMapper', () => {
  const mockRequest = (body) => ({
    body: JSON.parse(JSON.stringify(body)),
    headers: {},
    method: 'POST',
    url: '/v1/completions'
  });

  const modelMapping = {
    thinker: 'mistral-small:q4-mlx',
    creator: 'other-model-name',
    whisperer: 'third-model'
  };

  test('replaceModelName should replace known model names', () => {
    // Test with known model
    let req = mockRequest({ model: 'thinker', prompt: 'Hello' });
    const result1 = replaceModelName(req, modelMapping);
    expect(result1.body.model).toBe('mistral-small:q4-mlx');

    // Test with another known model
    req = mockRequest({ model: 'creator', prompt: 'Hello' });
    const result2 = replaceModelName(req, modelMapping);
    expect(result2.body.model).toBe('other-model-name');
  });

  test('replaceModelName should not modify unknown model names', () => {
    const req = mockRequest({ model: 'unknown-model', prompt: 'Hello' });
    const result = replaceModelName(req, modelMapping);
    expect(result.body.model).toBe('unknown-model');
  });

  test('replaceModelName should handle missing model field', () => {
    const req = mockRequest({ prompt: 'Hello' });
    const result = replaceModelName(req, modelMapping);
    expect(result.body.model).toBeUndefined();
  });

  test('replaceModelName should not mutate original request', () => {
    const req = mockRequest({ model: 'thinker', prompt: 'Hello' });
    const originalBody = JSON.stringify(req.body);
    replaceModelName(req, modelMapping);
    expect(JSON.stringify(req.body)).toBe(originalBody);
  });

  test('getAvailableModels should return array of friendly model names', () => {
    const config = { modelMapping };
    const available = getAvailableModels(config);
    expect(available).toEqual(['thinker', 'creator', 'whisperer']);
  });

  test('getAvailableModels should return empty array for empty mapping', () => {
    const available = getAvailableModels({});
    expect(available).toEqual([]);
  });

  test('getAvailableModels should work with new config structure', () => {
    const newConfig = {
      apis: { lmstudio: { baseUrl: 'http://localhost:1234/v1', apiKey: '' } },
      models: {
        thinker: { name: 'devstral-small-2507-mlx', api: 'lmstudio' },
        coder: { name: 'mistral-small-3.2-24b-instruct-2506', api: 'lmstudio' }
      }
    };
    const available = getAvailableModels(newConfig);
    expect(available).toEqual(['thinker', 'coder']);
  });

  test('getAvailableModels should work with old config structure', () => {
    const oldConfig = {
      modelMapping: { thinker: 'model1', creator: 'model2' }
    };
    const available = getAvailableModels(oldConfig);
    expect(available).toEqual(['thinker', 'creator']);
  });
});


