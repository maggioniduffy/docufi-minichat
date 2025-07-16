FROM node:20

WORKDIR /app

# Add build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5000

RUN mkdir -p /app/db /app/uploads

CMD ["npm", "start"]
