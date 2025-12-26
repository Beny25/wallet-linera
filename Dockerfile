# Base image Rust + Node
FROM rust:1.86-slim

Install Linux dependencies
RUN apt-get update && apt-get install -y \
    git pkg-config protobuf-compiler clang make curl findutils gnupg \
    && rm -rf /var/lib/apt/lists/*

Clone Linera repo (testnet-conway branch)
RUN git clone --branch testnet-conway https://github.com/linera-io/linera.git /linera

Build linera binaries
RUN cd /linera \
    && cargo install --path service \
    && cargo install --path storage-service

Install Node.js 20 & pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

Set working directory for frontend
WORKDIR /build

Copy project files
COPY . .

Install frontend dependencies
RUN pnpm install

Expose default frontend port
EXPOSE 5173

Start frontend
CMD ["pnpm", "start"]
