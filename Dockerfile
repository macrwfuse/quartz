FROM docker.1ms.run/node:22-slim AS builder

RUN set -eux; \
 if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
 sed -i \
 -e 's|deb.debian.org|mirrors.aliyun.com|g' \
 -e 's|security.debian.org|mirrors.aliyun.com/debian-security|g' \
 /etc/apt/sources.list.d/debian.sources; \
 else \
 sed -i \
 -e 's|deb.debian.org|mirrors.aliyun.com|g' \
 -e 's|security.debian.org|mirrors.aliyun.com/debian-security|g' \
 /etc/apt/sources.list; \
 fi

# install git to install plugins
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json* .
COPY .npmrc* .
COPY quartz/ ./quartz/
COPY quartz.lock.json* .
RUN npm install; npx quartz plugin install

FROM docker.1ms.run/node:22-slim
RUN set -eux; \
 if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
 sed -i \
 -e 's|deb.debian.org|mirrors.aliyun.com|g' \
 -e 's|security.debian.org|mirrors.aliyun.com/debian-security|g' \
 /etc/apt/sources.list.d/debian.sources; \
 else \
 sed -i \
 -e 's|deb.debian.org|mirrors.aliyun.com|g' \
 -e 's|security.debian.org|mirrors.aliyun.com/debian-security|g' \
 /etc/apt/sources.list; \
 fi

# ---- 安装中文 locale 和 git ----
RUN apt-get update && \
 apt-get install -y --no-install-recommends locales git && \
 sed -i 's/# zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen && \
 locale-gen zh_CN.UTF-8 && \
 rm -rf /var/lib/apt/lists/*

# ---- 设置中文 UTF-8 环境 ----
ENV LANG=zh_CN.UTF-8
ENV LC_ALL=zh_CN.UTF-8
ENV LANGUAGE=zh_CN:zh

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY . .
CMD ["npx", "quartz", "build", "--serve"]
