const NodeCache = require('node-cache');

// stdTTL: time to live in seconds for every generated cache element (300s = 5m)
// checkperiod: period in seconds, used for the automatic delete check interval
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Use the original URL (including query params) as the cache key
    // For example: /api/places?sort=most_memories
    const key = '__express__' + req.originalUrl || req.url;
    
    // Check if the response exists in the cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      // Return cached JSON response
      return res.status(200).json(cachedResponse);
    } else {
      // Intercept res.json to cache the response before sending it
      const originalJson = res.json;
      res.json = (body) => {
        // Only cache successful responses (status 200)
        // Express sets statusCode implicitly when using res.status(code).json(...)
        if (res.statusCode === 200) {
           cache.set(key, body, duration);
        }
        originalJson.call(res, body);
      };
      next();
    }
  };
};

module.exports = cacheMiddleware;
