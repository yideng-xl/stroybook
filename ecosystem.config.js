module.exports = {
  apps: [
    {
      name: "storybook-file-server",
      script: "./file-server/index.js",
      watch: ["./file-server"],
      env: {
        PORT: 3001
      }
    },
    {
      name: "storybook-web",
      script: "serve",
      cwd: "./web/dist",
      env: {
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html"
      }
    }
  ]
};
