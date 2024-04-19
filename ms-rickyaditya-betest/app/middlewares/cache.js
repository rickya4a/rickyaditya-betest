const redis = require("redis");
const { deepEqual } = require('../libs/checkObj')

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const cacheData = async (req, res, next) => {
  try {
    const cacheResults = await redisClient.get('redis_rickyaditya_betest');

    if (cacheResults) {
      let data = JSON.parse(cacheResults)
      let isParamsEqual = deepEqual(data.params, req.query)

      if (isParamsEqual) {
        res.send(data.cachedData);
      } else {
        next()
      }
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occurred while retrieving data");
  }
}

const cacheModule = {
  cacheData,
  redisClient
};

module.exports = cacheModule;