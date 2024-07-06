const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis').default;
const cors = require('cors');
const {
  MONGO_IP,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASSWORD,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require('./config/config');
let redisClient = redis.createClient({
  url: `redis://${REDIS_URL}:${REDIS_PORT}`,
});
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

(async () => {
  await redisClient.connect();
})();

redisClient.on('connect', () => console.log('::> Redis Client Connected'));
redisClient.on('error', (err) => console.log('<:: Redis Client Error', err));

const app = express();

const connectWithRetry = () => {
  const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

  mongoose.connect(mongoURL);

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error('Failed to connect to MongoDB', err);
    setTimeout(connectWithRetry, 5000);
  });

  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
};

connectWithRetry();

app.enable('trust proxy');
app.use(cors({}));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/v1', (req, res) => {
  res.send('<h2>Hello World</h2>');
  console.log('Yeah it run');
});

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
