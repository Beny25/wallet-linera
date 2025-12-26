# Base image Rust + Node
FROM rust:1.86-slim

SHELL ["bash", "-c"]

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make \
    curl \
    findutils \
 && rm -rf /var/lib/apt/lists/*

# Install Linera CLI / services
RUN cargo install --locked \
    linera-service@0.15.5 \
    linera-storage-service@0.15.5

# Install Node + pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs \
 && npm install -g pnpm

# Set working directory
WORKDIR /build

# Copy run script
COPY run.bash /build/run.bash
RUN chmod +x /build/run.bash

# Copy frontend / MiniApp source
COPY package.json pnpm-lock.yaml package-lock.json ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public
COPY scripts ./scripts
COPY next.config.ts tsconfig.json ./
COPY postcss.config.mjs eslint.config.mjs ./

# Expose ports
EXPOSE 5173
EXPOSE 8080
EXPOSE 9001
EXPOSE 13001

# Entrypoint
ENTRYPOINT ["bash", "/build/run.bash"]
