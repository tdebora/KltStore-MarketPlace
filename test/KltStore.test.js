const KltStore = artifacts.require("./KltStore.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should();


contract('KltStore', ([deployer, seller, buyer]) => {

  let kltstore;

  before(async () => {
    kltstore = await KltStore.deployed()
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await kltstore.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined)
    });

    it('it has name', async () => {
      const name = await kltstore.name();
      assert.equal(name, 'Dapp Kltstore')
    })
  });

  describe('products', async () => {

    let result, productCounter;

    before(async () => {
      result = await kltstore.createProduct('Klt', 'crochet', web3.utils.toWei('1', 'Ether'), {from: seller});
      productCounter = await kltstore.productCounter()
    });

    // Create the products

    it('create products', async () => {
      //SUCCESS
      assert.equal(productCounter, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), productCounter.toNumber(), 'id is correct');
      assert.equal(event.name, 'Klt', 'name is correct');
      assert.equal(event.category, 'crochet', 'category is correct');
      assert.equal(event.price, '1000000000000000000', 'price is correct');
      assert.equal(event.owner, seller, 'owner is correct');
      assert.equal(event.purchased, false, 'purchase is correct');

      //FAILURE: Product have a name

      await kltstore.createProduct('', '', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected;

      //FAILURE: Product have a price

      await kltstore.createProduct('', '', 0, {from: seller}).should.be.rejected;

    });

    // List the products

    it('list products', async ()=>{

      var product = await kltstore.products(productCounter);

      assert.equal(product.id.toNumber(), productCounter.toNumber(), 'id is correct');
      assert.equal(product.name, 'Klt', 'name is correct');
      assert.equal(product.category, 'crochet', 'category is correct');
      assert.equal(product.price, '1000000000000000000', 'price is correct');
      assert.equal(product.owner, seller, 'owner is correct');
      assert.equal(product.purchased, false, 'purchase is correct');
    });

    // Sell the products

    it('sell products', async ()=>{

      //Check the seller balance

      let oldBalanceOfSeller;
      oldBalanceOfSeller =  await web3.eth.getBalance(seller);
      oldBalanceOfSeller = new web3.utils.BN(oldBalanceOfSeller);

      //SUCCESS: Buyer purchase the product
      result = await kltstore.purchaseProduct(productCounter, {from: buyer, value: web3.utils.toWei('1', 'Ether')});

      //Checking the log
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), productCounter.toNumber(), 'id is correct');
      assert.equal(event.name, 'Klt', 'name is correct');
      assert.equal(event.category, 'crochet', 'category is correct');
      assert.equal(event.price, '1000000000000000000', 'price is correct');
      assert.equal(event.owner, buyer, 'buyer is correct');
      assert.equal(event.purchased, true, 'purchase is correct');

      //Check the seller balance

      let newBalanceOfSeller;
      newBalanceOfSeller =  await web3.eth.getBalance(seller);
      newBalanceOfSeller = new web3.utils.BN(newBalanceOfSeller);

      let price;
      price = web3.utils.toWei('1','Ether');
      price = new web3.utils.BN(price);

      const exceptedBalance = oldBalanceOfSeller.add(price);

      assert.equal(newBalanceOfSeller.toString(), exceptedBalance.toString());

      //FAILURE: Buyer Tries product id does'nt exist
      await kltstore.purchaseProduct(99, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

      //FAILURE: Buyer does'nt have enough money
      await kltstore.purchaseProduct(99, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

      //FAILURE: If product owner try to buy own product means
      await kltstore.purchaseProduct(99, {from: deployer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

      //FAILURE: Deployer try to buy the product; i.e product can't buy twice
      await kltstore.purchaseProduct(99, {from: deployer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

    })
  })
});