~/Downloads/modpoll/x86_64-linux-gnu$ ./modpoll -t4:float -r 100 -c 1 -1 -a 247 -p 5002 localhost



docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 --push -t shanebowyer/modbus-blackbox:main .


NOTE that if you have issues with buildx rerun this
docker run --privileged --rm tonistiigi/binfmt --install all