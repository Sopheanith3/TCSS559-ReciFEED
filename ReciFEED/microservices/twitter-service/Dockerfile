# Use a specific version of Node.js for consistency
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3084

# Define the command to run your app
CMD [ "npm", "start" ]
