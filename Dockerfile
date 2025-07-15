
















# Use the official Node.js 18 image as a base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port 3001 (default for our proxy server)
EXPOSE 3001



# Environment variable for base URL


# Environment variables should be provided at runtime
# ENV INFERENCE_BASE_URL="http://inference-server:5004"
# ENV INFERENCE_API_KEY="your-api-key-here"



# Command to run the application

CMD ["npm", "start"]














