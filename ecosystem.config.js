module.exports = {
  apps: [
    {
      name: "storybook-service",
      script: "java",
      args: [
        "-jar",
        "storybook-service/target/storybook-service-0.0.1-SNAPSHOT.jar",
        "--spring.profiles.active=prod"
      ],
      watch: false,
      env: {
        // 可以通过环境变量覆盖 application.yml 配置
        // "STORYBOOK_STORIES_PATH": "../stories" 
      }
    },
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
      env: {
        PM2_SERVE_PATH: "./web/dist",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html"
      }
    }
  ]
};
