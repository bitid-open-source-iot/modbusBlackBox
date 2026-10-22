# Per-arch Node (Shane, edge-router #60):
#   linux/amd64, linux/arm64  -> Node 24.22.1
#   linux/arm/v7              -> Node 22.23.4
# CI / local buildx pass BUILD_BASE + RUNTIME_BASE. Defaults are Node 24.
#
# Index digests re-verified 2026-10-22 against registry-1.docker.io/library/node:
#   24.22.1-alpine  linux/amd64, linux/arm64/v8, linux/s390x
#   24.22.1-slim    linux/amd64, linux/arm64/v8, linux/ppc64le
#   22.23.4-alpine  linux/amd64, linux/arm/v6, linux/arm/v7, linux/arm64/v8, linux/s390x
#   22.23.4-slim    linux/amd64, linux/arm/v7, linux/arm64/v8, linux/ppc64le
# Official Node 24 has no linux-armv7l tarball and no arm/v7 image.
# ARG before the first FROM is visible to every FROM.
#
# No native addons (deps are `net` + `q` only). Alpine build does not
# install a C toolchain.

ARG BUILD_BASE=node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
ARG RUNTIME_BASE=node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
FROM ${BUILD_BASE} AS build
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

# Inspector is intentionally not enabled (no --inspect, no 9229).
FROM ${RUNTIME_BASE}
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/node_modules /usr/src/node_modules
COPY --chown=node:node . /usr/src/app
EXPOSE 5002
USER node
CMD ["node", "index.js"]
