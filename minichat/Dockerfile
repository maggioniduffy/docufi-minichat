FROM node:20

WORKDIR /app

# Add build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5000

RUN mkdir -p /app/db /app/uploads

CMD ["npm", "start"]
