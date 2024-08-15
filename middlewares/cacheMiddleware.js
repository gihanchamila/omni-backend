import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

export const cacheCommentMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  try {
    const cachedResponse = await getAsync(key);
    if (cachedResponse) {
      res.json(JSON.parse(cachedResponse));
    } else {
      res.sendResponse = res.json;
      res.json = async (body) => {
        try {
          await setAsync(key, JSON.stringify(body), 'EX', 600); // Cache for 10 minutes
        } catch (err) {
          console.error('Error caching response:', err);
        }
        res.sendResponse(body);
      };
      next();
    }
  } catch (err) {
    console.error('Error retrieving cached response:', err);
    next();
  }
};

export const cacheLikesMiddleware = async (req, res, next) => {
  const key = `likes:${req.params.postId}`; // Use a unique key for likes based on postId
  try {
    const cachedResponse = await getAsync(key);
    if (cachedResponse) {
      res.json(JSON.parse(cachedResponse));
    } else {
      res.sendResponse = res.json;
      res.json = async (body) => {
        try {
          await setAsync(key, JSON.stringify(body), 'EX', 600); // Cache for 10 minutes
        } catch (err) {
          console.error('Error caching response:', err);
        }
        res.sendResponse(body);
      };
      next();
    }
  } catch (err) {
    console.error('Error retrieving cached response:', err);
    next();
  }
};
