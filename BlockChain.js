const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash(){
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction(signingKey){
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets! ');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid(){
      if (this.fromAddress === null) return true;

      if (!this.signature || this.signature.length === 0) {
        throw new Error('No signature in this transaction');
      }

      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
      return publicKey.verify(this.calculateHash(), this.signature);
    }
}
class Block {
  /* 
  @param index: Posicion del bloque en la cadena
  @param timestamp: Fecha de creacion del bloque
  @param data: Detalles de la transaccion(cantidad, quien es el emisor y receptor)
  @param previousHash: String que contiene el hash anterior al que esta enlazado
  */
  constructor(timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /* @brief Creacion del hash de un bloque
      @note  JSON.stringify es usado para tranformar un objeto a String */
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }

  hasValidTransactions() {
    for(const tx of this.transactions){
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  /* brief se retorna a la cadena el primer bloque
  $note este bloque se debe crear manualmente */
  createGenesisBlock() {
    return new Block(Date.parse('01/01/2022'), [], '0');
  }

  /* brief retorna el ultimo bloque de la cadena */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   *
   * @param {Direccion de la billetera del que va a minar este bloque} miningRewardAddress
   * @note {En la vida real, es imposible meter todas las trnasacciones pendiente en un solo bloque}
   * @note {El minero debera elegir a que transactions quiere ser incluido para minar}
   *
   * @note {Se reiniciara las transacciones pendiente y crear una nueva transaccion para recompensar al minero}
   * Como es un peer-a-peer network y otros nodos en la network no aceptaran intentos de modificaciones de recompensas. Las ignoraran
   */
  minePendingTransactions(miningRewardAddress) {
  const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error('Transaction must include from and to address');
    }
    if(!transaction.isValid()){
        throw new Error('Cannot add invalid transaction to chain');
    }
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress == address) {
          balance -= trans.amount;
        }
        if (trans.toAddress == address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }
  /* @brief  comprobara si la integridad de la cadena
  @return false si la cadena no es validad
  @return true si la cadena es validad */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      if(!currentBlock.hasValidTransactions()){
        return false;
      }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }
    return true;
  }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
