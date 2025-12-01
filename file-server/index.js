const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Paths
const STORIES_DIR = path.resolve(__dirname, '../stories');

// Middleware
app.use(cors()); // Allow Frontend to access

// Static Files
// Mount /stories route to the physical stories directory
app.use('/stories', express.static(STORIES_DIR));

// Health check
app.get('/', (req, res) => {
  res.send('Storybook File Server is Running. Access content at /stories');
});

app.listen(PORT, () => {
  console.log(`📂 Static File Server running at http://localhost:${PORT}`);
  console.log(`👉 Serving files from: ${STORIES_DIR}`);
});
