FROM node:21


RUN apt-get update -y && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/


RUN npm install


COPY . .


RUN npx prisma generate


RUN npm run build

EXPOSE 8012


RUN echo '#!/bin/sh\n\
echo "Running migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting server..."\n\
node dist/server.js\n\
' > /app/start.sh && chmod +x /app/start.sh


CMD ["/app/start.sh"]