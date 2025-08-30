# Base image
FROM node:14.15.0

# Set working directory
WORKDIR /usr/src/app

# Install Angular CLI globally
RUN npm install -g @angular/cli@12.2.4

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the application port
EXPOSE 1991

# Start the Angular app with polling enabled for file watching
CMD ["ng", "serve", "--port", "1991", "--disable-host-check", "--host", "0.0.0.0", "--proxy-config", "proxy.config.js", "--poll", "2000"]
