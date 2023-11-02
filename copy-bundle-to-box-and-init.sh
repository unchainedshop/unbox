scp -r ./bundle $1:/home/unbox
ssh $1 'cd /home/unbox/bundle && sudo ./init-bundle.sh'
