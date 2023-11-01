docker build -t registry.ucc.dev/unchained/kitchensink:box -f ./engine/Dockerfile ./engine
docker build -t registry.ucc.dev/unchained/heliox:box -f ./helios/Dockerfile ./helios
# docker build -f ./storefront/Dockerfile ./storefront registry.ucc.dev/unchained/storefront:box

docker pull -q registry.ucc.dev/unchained/storefront:box
docker pull -q mongo:4.4.18-focal
docker pull -q ghcr.io/erebe/wstunnel:v7.8.2
docker pull -q traefik:v2.9
docker pull -q jnovack/autossh:2.0.1

docker image save -o ./bundle/kitchensink.tar registry.ucc.dev/unchained/kitchensink:box
docker image save -o ./bundle/storefront.tar registry.ucc.dev/unchained/storefront:box
docker image save -o ./bundle/helios.tar registry.ucc.dev/unchained/heliox:box
docker image save -o ./bundle/mongo.tar mongo:4.4.18-focal
docker image save -o ./bundle/wstunnel.tar ghcr.io/erebe/wstunnel:v7.8.2
docker image save -o ./bundle/traefik.tar traefik:v2.9
docker image save -o ./bundle/autossh.tar jnovack/autossh:2.0.1

cp ./init-bundle.sh ./bundle/init-bundle.sh
cp ./shop-stack.yml ./bundle/shop-stack.yml
cp ./control-stack.yml ./bundle/control-stack.yml
cp ./traefik-dynamic.yml ./bundle/traefik-dynamic.yml
cp ./traefik-static.yml ./bundle/traefik-static.yml

cp ./.env* ./bundle/