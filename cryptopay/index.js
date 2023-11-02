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

const ADDRESSES_LIMIT = 2000;

const { CRYPTOPAY_ETH_XPUB, CRYPTOPAY_WEBHOOK_URL, CRYPTOPAY_SECRET, CRYPTOPAY_ETH_REWIND_BLOCKS = 100, CRYPTOPAY_ETH_RPC } = process.env;

const web3 = new Web3(CRYPTOPAY_ETH_RPC)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// var subscription = web3.eth.subscribe('pendingTransactions', function(error, result){
//     if (!error)
//         console.log(result);
// }).on("data", function(transaction){
//     console.log(transaction);
// });

async function processBlocks(start, end, { addresses }) {
    console.group("Process blocks from", start, "to", end);
    const changedAddressesETH = [];

    for (let index = 0; index < Number(end - start); index++) {
        const blockNumber = start + BigInt(index);
        console.group("Block", blockNumber);
        const block = await web3.eth.getBlock(blockNumber, true);
        if (!block) {
            console.log("Block not found");
            continue;
        }
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
            await fetch(CRYPTOPAY_WEBHOOK_URL, { headers: {
                'Content-Type': 'application/json',
            }, method: 'POST', body: JSON.stringify({
                "wallet": {
                    "currency": "ETH",
                    "contract": null,
                    "decimals": 18,
                    "address": address,
                    "amount": balance.toString(),
                    "blockHeight": Number(end),
                },
                "secret": CRYPTOPAY_SECRET,
            })});
        }
    }));

    console.groupEnd();
}

const buildMonitoredAddresses = () => {
    console.log("Build monitored address pool (can take a while)")
    const wallet = hdkey.EthereumHDKey.fromExtendedKey(CRYPTOPAY_ETH_XPUB).derivePath("m/0");
    return Array.from({ length: ADDRESSES_LIMIT }).fill(null).map((_,i) => {
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
        if (newestBlockNumber !== blockNumberHead) {
            await processBlocks(blockNumberHead || newestBlockNumber - BigInt(CRYPTOPAY_ETH_REWIND_BLOCKS), newestBlockNumber, { addresses });
            await fetch(CRYPTOPAY_WEBHOOK_URL, { headers: {
                'Content-Type': 'application/json',
            }, method: 'POST', body: JSON.stringify({
                "ping": {
                    "currency": "ETH",
                    "blockHeight": Number(newestBlockNumber),
                },
                "secret": CRYPTOPAY_SECRET,
            })});
        }
        
        blockNumberHead = newestBlockNumber;
        await wait(2000);
    }
}

main();