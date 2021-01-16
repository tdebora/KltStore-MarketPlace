// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract KltStore {
  string public name;
  uint public productCounter = 0;

  mapping(uint => Product) public products;

  struct Product {
    uint id;
    string name;
    string category;
    uint price;
    address payable owner;
    bool purchased;
  }

  event ProductCreated(
    uint id,
    string name,
    string category,
    uint price,
    address payable owner,
    bool purchased
  );

  event ProductSeller(
    uint id,
    string name,
    string category,
    uint price,
    address payable owner,
    bool purchased
  );

  constructor() public {
    name = "Dapp Kltstore";
  }

  function createProduct(string memory _name,string memory _category, uint _price) public {
    // Required Valid Name & Type
    require(bytes(_name).length > 0);
     require(bytes(_category).length > 0);
    // Required Valid Price
    require(_price > 0);
    //Increment product counter
    productCounter ++;
    //create a product
    products[productCounter] = Product(productCounter, _name, _category, _price, msg.sender, false);
    //Trigger the enter
    emit ProductCreated(productCounter, _name, _category, _price, msg.sender, false);
  }

  function purchaseProduct(uint _id) public payable {
    // Fetch the product
    Product memory _product = products[_id];
    // Fetch the Owner
    address payable _seller = _product.owner;
    // Check the product having valid ID
    require(_product.id > 0 && _product.id <= productCounter);
    // Check enough Ether in transaction
    require(msg.value >= _product.price);
    // Check the product not be purchased before
    require(!_product.purchased);
    // check the seller can't buy his own product
    require(_seller != msg.sender, "Seller can't buy his own product");
    // Transfer the ownership to buyer
    _product.owner = msg.sender;
    // Mark as Purchase
    _product.purchased = true;
    // Update the product
    products[_id] = _product;
    // Pay the seller
    address(_seller).transfer(msg.value);
    // Trigger the event
    emit ProductSeller(productCounter, _product.name, _product.category, _product.price, msg.sender, true);

  }

}
