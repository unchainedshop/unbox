docker image load -i ./kitchensink.tar
docker image load -i ./cryptopay.tar
docker image load -i ./storefront.tar
docker image load -i ./mongo.tar
docker image load -i ./wstunnel.tar
docker image load -i ./traefik.tar
docker image load -i ./autossh.tar
docker image load -i ./helios.tar
# docker image load -i ./redis.tar

echo "no" | ssh-keygen -f ./id_rsa -q -N ""

touch .env

docker stack deploy -c control-stack.yml control
docker stack deploy -c shop-stack.yml shop