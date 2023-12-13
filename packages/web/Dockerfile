FROM node:18-alpine3.16 AS base

ENV WORKDIR=/app

RUN apk add --no-cache cmake g++ gcc 

# =================================================================

FROM base as installer

WORKDIR ${WORKDIR}

COPY yarn.lock .
COPY package.json .

RUN yarn install

# =================================================================

FROM installer AS development

WORKDIR ${WORKDIR}

COPY --from=installer /app .
COPY . .

EXPOSE 3000

CMD ["yarn", "run", "dev"]

# =================================================================
