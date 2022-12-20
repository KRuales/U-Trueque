const { BlockChain, Transaction } = require("./BlockChain");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('d41b6d944c98b6bf94527142ffbf2a587769ee99917e984683a019df74e0cf0e');
const myWalletAddress = myKey.getPublic('hex');

const uniCoin = new BlockChain();
uniCoin.minePendingTransactions(myWalletAddress);

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
uniCoin.addTransaction(tx1);



console.log("\nStaring the miner....");
uniCoin.minePendingTransactions(myWalletAddress);

console.log(
  "\nBalance of Mike is ",
  uniCoin.getBalanceOfAddress(myWalletAddress)
  );
// Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
uniCoin.addTransaction(tx2);

// Mine block
uniCoin.minePendingTransactions(myWalletAddress);

console.log();
console.log(
  `Balance of Mike is ${uniCoin.getBalanceOfAddress(myWalletAddress)}`
);

// Uncomment this line if you want to test tampering with the chain
// savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', uniCoin.isChainValid() ? 'Yes' : 'No');
  
  
  /* console.log("Mining block 1...");
  uniCoin.createTransaction(new Transaction("address1", "address2", 100));
  
  uniCoin.createTransaction(new Transaction("address2", "address3", 50)); */

/* console.log("\nStaring the miner again...");
uniCoin.minePendingTransactions("mike-address");

console.log(
  "\nBalance of Mike is: ",
  uniCoin.getBalanceOfAddress("mike-address")
); */
/* console.log("Is BlockChain valid? " + uniCoin.isChainValid());

uniCoin.chain[1].data = { cantidad: 100 };

console.log("Is BlockChain valid? " + uniCoin.isChainValid());

console.log(JSON.stringify(uniCoin, null, 4)); */
