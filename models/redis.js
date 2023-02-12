const Redis = require("redis");

const RedisClient = Redis.createClient();
const DEFFAULT_EXPIRATION = 36000;

(async () => {
  await RedisClient.connect();
})();

RedisClient.on("ready", () => {
  console.log("Connected!");
});

RedisClient.on("error", (err) => {
  console.log("Error in the Connection");
});

function storeURL(surl) {
  return new Promise((resolve, reject) => {
    RedisClient.get(surl.short, (err, reply) => {
      if (err) {
        return reject("error occurred during the redis operation");
      }
      if (reply) {
        resolve(reply);
      } else {
        RedisClient.setEX(surl.short, DEFFAULT_EXPIRATION, surl.full);
        // return
        resolve(surl.short);
      }
    });
  });
}

function findURL(key) {
  return new Promise((resolve, reject) => {
    RedisClient.get(key, (err, reply) => {
      if (err) {
        return reject("error occurred during the redis operation");
      }
      // check if the reply exists
      if (reply === null) {
        resolve(null);
      } else {
        resolve(reply);
      }
    });
  });
}

module.exports = {
  storeURL,
  findURL,
};

// function getOrSetCach(key, cb) {
//   return new Promise((resolve, reject) => {
//     RedisClient.get(key, async (err, data) => {
//       if (err) return reject("error occurred during the redis operation");
//       if (data != null) return resolve(JSON.parse(data));
//       const freshData = await cb();
//       RedisClient.setEx(key, DEFFAULT_EXPIRATION, JSON.stringify(freshData));
//       resolve(freshData);
//     });
//   });
// }
// module.exports = { getOrSetCach };
