module.exports = {
  apps: [
    {
      name: 'pamoontoy-api',
      script: 'server.js',
      cwd: '/var/pamoontoyv2/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_file: '/var/log/pamoontoy/api.log',
      out_file: '/var/log/pamoontoy/api-out.log',
      error_file: '/var/log/pamoontoy/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      watch_options: {
        followSymlinks: false
      }
    }
  ]
};
