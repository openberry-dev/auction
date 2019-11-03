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
// import web3 from '../contracts/web3';
// import auction from '../contracts/Auction';
// import auctionFactory from '../contracts/AuctionFactory';

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
  },
  methods: {
    createAuction() {
    },
    getAuctionItem() {
    },
    checkAuctionState() {
    },
    placeBid() {
    },
    finalizeAuction() {
    },
    withdrawBids() {
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
