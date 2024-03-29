const express = require('express');
const app = express();
const port = 8080;
const jwt = require('jsonwebtoken');
const userService = require('./models/userService');
const { runChatModel } = require('./models/chat');
const weather_model = require('./models/weather');
const predict_model = require('./models/predict');
const sensor_model = require('./models/getSensorData');
const crypto = require('crypto');

require('./models/fetchDataFromThingSpeak');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set the destination folder for uploaded images

// Secret key for JWT
const secretKey = crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits
console.log(secretKey);
// Middleware for parsing JSON request bodies
app.use(express.json());

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
}

// Middleware for role-based authorization
function authorize(roles = []) {
  return [
    // Authenticate JWT token
    (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        req.user = decoded;
        next();
      });
    },

    // Authorize based on user role
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      next();
    },
  ];
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

app.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imagePath = req.file.path;
    const predictions = await predict_model.predictImageObjectDetection(imagePath);

    // return predictions in response
    res.status(200).json({ predictions });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Authentication route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userService.authenticate(username, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.get('/farmers', authorize(['Admin']), async (req, res) => {
//   try {
//     const users = await userService.getAllUsers();
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.get('/farmers', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/createFarmer', async (req, res) => {
  try {
    const farmer = await userService.createFarmer(req.body);
    res.status(201).json(farmer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/chat', (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).send('Bad Request: Missing "query" in the request body');
  }

  const result = runChatModel(query);
  res.status(200).json({ answer: result });
});

//Handle SensorData Request
app.get('/sensorData', (req, res) => {
  sensor_model.getSensor()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
});

// Handle weather request
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  // const city = 'Maseru';

  if (!city) {
    return res.status(400).send('Bad Request: Missing "city" in the query parameters');
  }

  const weatherData = await weather_model.getWeather(city);
  res.json(weatherData);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});