FROM node:16-alpine3.18 AS base

WORKDIR /app

FROM base AS frontend

COPY client/package.json client/package-lock.json ./

RUN npm install

COPY client/ .

ARG REACT_APP_API_URL
ARG REACT_APP_LOGIN_API_URL

RUN npm run build

FROM base AS backend

COPY package.json package-lock.json ./

RUN npm install --ignore-scripts

COPY models/ models/
COPY resources/ resources/
COPY \
    app.ts configuration.ts middlewares.ts router.ts \
    services.ts tsconfig.json types.ts utils.ts \
    ./

RUN npm run build:backend

FROM base

COPY --from=backend /app/node_modules /app/node_modules
COPY --from=backend /app/dist /app/dist
COPY --from=frontend /app/build/ /app/dist/client/build/

CMD ["node", "dist/app.js"]
