const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist/public directory
app.use(express.static(path.join(__dirname, 'dist/public')));

// Handle index.html separately to inject environment variables
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  
  // Read the index.html file
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading page');
    }

    // Replace environment variable placeholders
    let html = data;
    
    // Replace VITE environment variables with actual values
    const envVars = {
      VITE_ANALYTICS_ENDPOINT: process.env.VITE_ANALYTICS_ENDPOINT || '',
      VITE_ANALYTICS_WEBSITE_ID: process.env.VITE_ANALYTICS_WEBSITE_ID || '',
      VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL || '',
      VITE_APP_ID: process.env.VITE_APP_ID || '',
      VITE_API_URL: process.env.VITE_API_URL || '',
      VITE_FRONTEND_FORGE_API_KEY: process.env.VITE_FRONTEND_FORGE_API_KEY || '',
      VITE_FRONTEND_FORGE_API_URL: process.env.VITE_FRONTEND_FORGE_API_URL || ''
    };

    // Replace %VARIABLE_NAME% placeholders
    Object.keys(envVars).forEach(key => {
      const placeholder = `%${key}%`;
      html = html.replace(new RegExp(placeholder, 'g'), envVars[key]);
    });

    res.send(html);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Environment variables loaded:`);
  console.log(`- VITE_API_URL: ${process.env.VITE_API_URL || 'NOT SET'}`);
});
