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
