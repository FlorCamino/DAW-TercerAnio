module.exports = {
  apps: [
    {
      name: 'grupo-m-backend',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
