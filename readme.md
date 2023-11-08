# How Ethereum?

We rely on a feature called "Light node" that uses a centralized ethereum node without trust. It's not the best thing to do it like that but hell yeah...
More infos: https://github.com/a16z/helios

# When Bitcoin?

Due to the constraints of Bitcoin with it's 600GB+ blockchain and long wait times for block confirmations, we can't just run a full node on the Raspi without making the price explode of the Unchained Box.

So it's clear that we have to use Lighting for Bitcoin payments.

To fix the size problem, we have the following options:
1. Allowing advanced users to plug in an external SSD and configure the box to run a full btc node -> too complicated for most people
2. Allowing advanced users to copy pruned data from their own nodes and run a full btc node in pruned mode -> way too complicated
3. Use Bitcoin SPV light client -> privacy issues when using lighting and such because it leaks too much information to the full nodes, https://en.bitcoinwiki.org/wiki/Simplified_Payment_Verification + Unchained would need to provide a public node
4. Use Neutrino -> It's currently not safe to use Neutrino in mainnet, lightning does not even show a way on how to do it because it's still considered alpha software https://dev.lightning.community/guides/installation/#using-neutrino


We'll propably go the neutrino way for the future or depend on raspberry pi 5.

https://docs.zaphq.io/docs-ios-docker-node-setup


# Init E-Paper Display

sudo cp 02-papirus /etc/NetworkManager/dispatcher.d
sudo chmod +x /etc/NetworkManager/dispatcher.d/02-papirus
sudo reboot

