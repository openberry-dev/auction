<template>
  <div id="app">
    <b-container>
      <h1>Auction DApp</h1>
      <div class="mt-4">
        <p v-if="address.length > 0">あなたのウォレットアドレス: {{ address }}</p>
        <p v-else>ウォレットが接続されていません</p>
      </div>
      <hr>
      <h3 class="my-4">オークションの作成</h3>
      <b-form-group
        label-for="input-1"
        label="タイトル："
      >
        <b-form-input id="input-1" type="text" v-model="form.title" placeholder="タイトルを入力" required></b-form-input>
      </b-form-group>
      <b-form-group
        label-for="input-2"
        label="スタート価格："
      >
        <b-input-group
          append="ETH"
        >
          <b-form-input id="input-2" type="number" v-model="form.startPrice" placeholder="スタート価格を入力" required></b-form-input>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label-for="textarea"
        label="説明文："
      >
        <b-form-textarea
          id="textarea"
          v-model="form.description"
          placeholder="オークションの説明文を入力"
          rows="3"
          max-rows="3"
          required
        ></b-form-textarea>
      </b-form-group>
      <div  class="my-4">
        <b-button v-if="!isLoading" variant="primary" @click="createAuction">
          オークションを作成
        </b-button>
        <b-button v-if="isLoading" variant="primary" disabled>
          <b-spinner small class="mr-2"></b-spinner>
          Loading..
        </b-button>
      </div>
      <hr>
      <h3 class="my-4">オークションの一覧</h3>
      <p>オークション数：{{ totalContract }}</p>
      <div class="mb-5">
        <b-card-group deck>
          <div
            v-for="(auction, index) in auctions"
            :key=index
          >
            <b-card
              v-if="auction.info.status == 1"
              :title=auction.info.title
              style="width: 350px;"
              bg-variant="light"
              class="mb-4"
            >
              <b-card-text>{{ auction.info.description }}</b-card-text>
              <b-card-text>スタート価格：{{ auction.info.startPrice }} ETH</b-card-text>
              <hr>
              <b-card-text>最高入札アドレス：{{ auction.state.highestBidder }}</b-card-text>
              <b-card-text>最高額：{{ auction.state.highestPrice }} ETH</b-card-text>
              <b-input-group
                append="ETH"
              >
                <b-form-input
                  type="number"
                  v-model="auctions[index].bidPrice"
                >
                </b-form-input>
              </b-input-group>
              <div class="mt-3">
                <b-button
                  class="mr-2"
                  variant="success"
                  @click="placeBid(auction.address, auction.bidPrice, index)"
                >
                  入札する
                </b-button>
                <b-button
                  variant="danger"
                  @click="finalizeAuction(auction.address, index)"
                >
                  オークションを終了する
                </b-button>
              </div>
            </b-card>
            <b-card
              v-if="auction.info.status == 2"
              :title=auction.info.title
              style="width: 350px;"
              bg-variant="dark"
              text-variant="white"
              class="mb-4"
            >
              <b-card-text>{{ auction.info.description }}</b-card-text>
              <b-card-text>スタート価格：{{ auction.info.startPrice }} ETH</b-card-text>
              <hr color="white">
              <b-card-text>最高入札アドレス：{{ auction.state.highestBidder }}</b-card-text>
              <b-card-text>最高額：{{ auction.state.highestPrice }} ETH</b-card-text>
              <div class="mt-3">
                <b-button
                  class="mr-2"
                  variant="danger"
                  @click="withdrawBids(auction.address, auction.bidPrice, index)"
                >
                  入札金額を引き出す
                </b-button>
              </div>
            </b-card>
          </div>
        </b-card-group>
      </div>
    </b-container>
  </div>
</template>

<script>
import web3 from '../contracts/web3';
import auction from '../contracts/Auction';
import auctionFactory from '../contracts/AuctionFactory';

export default {
  name: 'app',
  data() {
    return {
      address: '',
      form: {
        title: '',
        startPrice: 0,
        description: ''
      },
      auctions: [],
      totalContract: 0,
      auctionAddresses: [],
      bidPrice: 0,
      isOwner: false,
      isLoading: false
    }
  },
  async beforeMount() {
    web3.currentProvider.publicConfigStore.on('update', this.watchAddress)
    this.auctionAddresses = await auctionFactory.methods.getAllAuctions().call()
    this.totalContract = this.auctionAddresses.length
    for(const index in this.auctionAddresses) {
      this.getAuctionItem(this.auctionAddresses[index])
      .then((data) => {
        this.auctions.push(data)
      })
    }
  },
  methods: {
    watchAddress(data) {
      this.address = data.selectedAddress
    },
    createAuction() {
      if(this.address == '') {
        alert("ウォレットが接続されていません")
        return
      }
      const startPrice = web3.utils.toWei(this.form.startPrice, 'ether')
      this.isLoading = true
      auctionFactory.methods.createAuction(this.form.title, startPrice, this.form.description)
      .send({ from: this.address })
      .then((reciept) => {
        console.log(reciept)
        this.isLoading = false
        this.form.title = ''
        this.form.startPrice = 0
        this.form.description = ''
        return auctionFactory.methods.getAllAuctions().call();
      })
      .then((auctions) => {
        this.auctionAddresses = auctions
        this.totalContract = auctions.length
      })
      .catch(() => {
        this.isLoading = false
      })
    },
    getAuctionItem(address) {
      const auctionInstance = auction(address)
      return auctionInstance.methods.getAucitoItem().call()
      .then((auction) => {
        const auctionInfo = {
          title: auction[0],
          startPrice: web3.utils.fromWei(auction[1], 'ether'),
          description: auction[2],
          status: auction[3]
        }
        return this.checkAuctionState(address)
        .then((state) => {
          var auctionState;
          if(state[2] > 0) {
            auctionState = {
              highestBidder: state[1],
              highestPrice: web3.utils.fromWei(state[2], 'ether'),
            }
          } else {
            auctionState = {
              highestBidder: '-',
              highestPrice: 0
            }
          }
          return {
            address: address,
            info: auctionInfo,
            state: auctionState,
            bidPrice: 0
          }
        })
      })
    },
    checkAuctionState(address) {
      const auctionInstance = auction(address)
      return auctionInstance.methods.checkAuctionState().call()
    },
    placeBid(address, bidPrice, index) {
      const auctionInstance = auction(address)
      auctionInstance.methods.placeBid()
      .send({
        from: this.address,
        value: web3.utils.toWei(bidPrice, 'ether'),
      })
      .then((reciept) => {
        console.log(reciept)
        return this.getAuctionItem(address)
      })
      .then((data) => {
        this.$set(this.auctions, index, data)
      })
    },
    finalizeAuction(address, index) {
      const auctionInstance = auction(address)
      auctionInstance.methods.finalizeAuction()
      .send({from: this.address})
      .then(() => {
        this.getAuctionItem(address)
        .then((data) => {
          this.$set(this.auctions, index, data)
        })
      })
    },
    withdrawBids(address) {
      const auctionInstance = auction(address)
      auctionInstance.methods.withdrawBids()
      .send({from: this.address})
      .then((reciept) => {
        console.log(reciept)
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}
</style>
