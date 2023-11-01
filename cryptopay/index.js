import Web3 from 'web3';
import { hdkey } from '@ethereumjs/wallet';
import dotenv from 'dotenv-extended';

dotenv.load({
  silent: true,
  errorOnRegex: true,
  errorOnMissing: false,
  errorOnExtra: false,
  includeProcessEnv: true,
});

const { CRYPTOPAY_ETH_XPUB, CRYPTOPAY_WEBHOOK_URL, CRYPTOPAY_SECRET, CRYPTOPAY_ETH_REWIND_BLOCKS = 100, CRYPTOPAY_ETH_RPC } = process.env;

const web3 = new Web3(CRYPTOPAY_ETH_RPC)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processBlocks(start, end, { addresses }) {
    console.group("Process blocks from", start, "to", end);
    const changedAddressesETH = [];
    const blockPromises = Array.from({ length: Number(end - start) }).fill(null).map((_,i) => web3.eth.getBlock(start + BigInt(i), true));
    for await (const block of blockPromises) {
        if (!block) continue;
        console.group("Block", block.number);
        for (const transaction of block.transactions) {
            if (addresses.includes(transaction.to)) {
                console.log(`${transaction.from} -> ${transaction.to} (${transaction.value})`);
                changedAddressesETH.push(transaction.to);
            }
        }
        console.groupEnd();
    }

    await Promise.all([...new Set(changedAddressesETH)].map(async (address) => {
        const balance = await web3.eth.getBalance(address, end);
        if (balance > 0) {
            const payload = {
                "wallet": {
                    "currency": "ETH",
                    "contract": null,
                    "decimals": 18,
                    "address": address,
                    "amount": balance.toString(),
                    "blockHeight": Number(end),
                },
                "secret": CRYPTOPAY_SECRET,
            };
            const response = await fetch(CRYPTOPAY_WEBHOOK_URL, { headers: {
                'Content-Type': 'application/json',
            }, method: 'POST', body: JSON.stringify(payload)});
            const result = await response.json();
        }
    }));

    console.groupEnd();
}

const buildMonitoredAddresses = () => {
    console.log("Build monitored address pool (can take a while)")
    const wallet = hdkey.EthereumHDKey.fromExtendedKey(CRYPTOPAY_ETH_XPUB).derivePath("m/0");
    return Array.from({ length: 20000 }).fill(null).map((_,i) => {
        const child = wallet.deriveChild(i);
        return child.getWallet().getAddressString();
    });
}

const main = async () => {
    let blockNumberHead;
    const addresses = buildMonitoredAddresses();
    while(1) {
        let newestBlockNumber = await web3.eth.getBlockNumber();
        console.log("Current Block Height", newestBlockNumber)
        if (!blockNumberHead) blockNumberHead = newestBlockNumber - BigInt(CRYPTOPAY_ETH_REWIND_BLOCKS);
        if (newestBlockNumber !== blockNumberHead) {
            await processBlocks(blockNumberHead, newestBlockNumber, { addresses });

            const payload = {
                "ping": {
                    "currency": "ETH",
                    "blockHeight": Number(newestBlockNumber),
                },
                "secret": CRYPTOPAY_SECRET,
            };
            await fetch(CRYPTOPAY_WEBHOOK_URL, { headers: {
                'Content-Type': 'application/json',
            }, method: 'POST', body: JSON.stringify(payload)});
        }
        
        blockNumberHead = newestBlockNumber;
        await wait(2000);
    }
}

main();