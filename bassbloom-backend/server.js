// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Setup file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure uploads and data folder exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('data')) fs.mkdirSync('data');

// Upload music track
app.post('/upload', upload.single('track'), (req, res) => {
  const file = req.file;
  const title = req.body.title;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const metadata = {
    title: title,
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  const dataPath = 'data/tracks.json';
  let tracks = [];

  if (fs.existsSync(dataPath)) {
    tracks = JSON.parse(fs.readFileSync(dataPath));
  }

  tracks.push(metadata);
  fs.writeFileSync(dataPath, JSON.stringify(tracks, null, 2));

  res.status(200).json({ message: 'Track uploaded successfully', metadata });
});

// Get all uploaded tracks
app.get('/tracks', (req, res) => {
  const dataPath = 'data/tracks.json';
  let tracks = [];
  if (fs.existsSync(dataPath)) {
    tracks = JSON.parse(fs.readFileSync(dataPath));
  }
  res.json(tracks);
});

app.listen(PORT, () => {
  console.log(`🚀 BassBloom server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
