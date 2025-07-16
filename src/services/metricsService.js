

const client = require('prom-client');
const os = require('os');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label for all metrics
register.setDefaultLabels({
  app: 'vibe-router'
});

// Create metrics
const httpRequestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code', 'model']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 5] // buckets for response time
});

const httpResponseSize = new client.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [100, 500, 1000, 5000, 10000, 50000] // buckets for response size
});

const systemCpuUsage = new client.Gauge({
  name: 'system_cpu_usage',
  help: 'System CPU usage percentage'
});

const systemMemoryUsage = new client.Gauge({
  name: 'system_memory_usage_bytes',
  help: 'System memory usage in bytes'
});

const systemMemoryTotal = new client.Gauge({
  name: 'system_memory_total_bytes',
  help: 'Total system memory in bytes'
});

// Register metrics
register.registerMetric(httpRequestCount);
register.registerMetric(httpRequestDuration);
register.registerMetric(httpResponseSize);
register.registerMetric(systemCpuUsage);
register.registerMetric(systemMemoryUsage);
register.registerMetric(systemMemoryTotal);

// Middleware to track HTTP requests
const requestMetricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  // Store original json method to capture response size
  const originalJson = res.json;
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const contentLength = Buffer.byteLength(JSON.stringify(body), 'utf8');
      httpResponseSize
        .labels(req.method, req.path, res.statusCode)
        .observe(contentLength);
    }
    return originalJson.call(res, body);
  };

  res.on('finish', () => {
    httpRequestCount
      .labels(req.method, req.path, res.statusCode, req.body?.model || 'unknown')
      .inc();

    end({ method: req.method, path: req.path, status_code: res.statusCode });
  });

  next();
};

// Function to update system metrics
const updateSystemMetrics = () => {
  // CPU usage (percentage)
  const totalTicks = os.totalmem() / (1024 * 1024); // Convert to MB for percentage
  const freeTicks = os.freemem() / (1024 * 1024);
  const usedTicks = totalTicks - freeTicks;
  const cpuUsage = (usedTicks / totalTicks) * 100;

  systemCpuUsage.set(cpuUsage);

  // Memory usage
  systemMemoryUsage.set(os.totalmem() - os.freemem());
  systemMemoryTotal.set(os.totalmem());

  // Log metrics update
  console.log('Updated system metrics');
};

// Create metrics endpoint
const createMetricsEndpoint = (app, path = '/metrics') => {
  app.get(path, async (req, res) => {
    try {
      // Update system metrics before responding
      updateSystemMetrics();

      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).send('Error generating metrics');
    }
  });
};

// Initialize metrics service
const initializeMetrics = (app, config) => {
  const { metricsEndpoint = '/metrics' } = config.logging || {};

  // Create metrics endpoint
  createMetricsEndpoint(app, metricsEndpoint);

  // Start collecting system metrics periodically
  setInterval(updateSystemMetrics, 15000); // Update every 15 seconds

  console.log(`Metrics endpoint available at ${metricsEndpoint}`);
};

module.exports = {
  initializeMetrics,
  requestMetricsMiddleware
};

