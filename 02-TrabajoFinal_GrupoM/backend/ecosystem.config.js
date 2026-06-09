module.exports = {
  apps: [
    {
      name: 'grupo-m-backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        FRONTEND_URL: 'https://localhost',
      },
    },
  ],
};
