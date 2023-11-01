scp -r ./bundle unbox@unbox.local:/home/unbox
ssh unbox@unbox.local 'cd /home/unbox/bundle && sudo ./init-bundle.sh'