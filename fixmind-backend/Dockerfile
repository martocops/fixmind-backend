FROM node:24-alpine
WORKDIR /app
COPY fixmind-backend/package*.json ./
RUN npm install --omit=dev
COPY fixmind-backend/ .
EXPOSE 8000
USER node
CMD ["npm", "start"]