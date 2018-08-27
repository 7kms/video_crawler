module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'video_crawler',
      script    : 'src/index.js',
      env: {
        NODE_ENV: "production"
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],
};
