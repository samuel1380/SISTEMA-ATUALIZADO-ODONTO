const path = require('path');

module.exports = {
  apps: [
    {
      name: 'odontoprint-backend',
      cwd: __dirname,
      script: path.join(__dirname, 'dist/src/main.js'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
