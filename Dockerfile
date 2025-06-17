FROM node:20-slim

# Actualización y dependencias necesarias
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    curl unzip git nano cron openjdk-17-jre-headless fonts-liberation \
    libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcb-dri3-0 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libasound2 libatk1.0-0 libcups2 \
    libdrm2 libxshmfence1 xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Instalar Allure CLI
RUN curl -o allure.zip -L https://github.com/allure-framework/allure2/releases/download/2.25.0/allure-2.25.0.zip && \
    unzip allure.zip -d /opt/ && \
    mv /opt/allure-2.25.0 /opt/allure && \
    ln -sf /opt/allure/bin/allure /usr/bin/allure && \
    rm allure.zip

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias y navegadores
RUN npm install && \
    npx playwright install --with-deps

# Crear archivo de log de cron y dar permisos al script
RUN touch /var/log/cron.log && \
    chmod +x /usr/src/app/test_publish.js

# Crear tarea de cron (cada 5 minutos)
RUN echo "*/5 * * * * node /usr/src/app/test_publish.js >> /var/log/cron.log 2>&1" > /etc/cron.d/app-cron && \
    chmod 0644 /etc/cron.d/app-cron && \
    crontab /etc/cron.d/app-cron

# Asegurar que el archivo de cron tenga la línea final
RUN echo "" >> /etc/cron.d/app-cron

# Exponer puerto del servidor Allure
EXPOSE 51100

# Comando de inicio: lanzar cron y el servidor
CMD cron && sh -c "npx http-server ./allure-history -p 51100 --no-cache"
