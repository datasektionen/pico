FROM node:16-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY models/ models/
COPY resources/ resources/
COPY \
    app.ts configuration.ts middlewares.ts router.ts \
    services.ts tsconfig.json types.ts utils.ts \
    ./

RUN npm run build:backend

CMD ["npm", "start"]
