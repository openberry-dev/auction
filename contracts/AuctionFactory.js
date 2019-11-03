import web3 from './web3';

const address = ''; // // AuctionFactoryのコントラクトアドレス
const abi = []; // AuctionFactory.solのabi

const instance = new web3.eth.Contract(abi, address);

export default instance;
