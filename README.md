~/Downloads/modpoll/x86_64-linux-gnu$ ./modpoll -t4:float -r 100 -c 1 -1 -a 247 -p 5002 localhost



# amd64 / arm64 default to Node 24.22.1. linux/arm/v7 must pass Node 22.23.4
# BUILD_BASE / RUNTIME_BASE (Node 24 has no arm/v7 image). Prefer the
# release workflow, which sets those args per platform.


NOTE that if you have issues with buildx rerun this
docker run --privileged --rm tonistiigi/binfmt --install all