require('dotenv').config()

var inquirer = require('inquirer');

var mysql = require("mysql");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: process.env.password,
  database: 'bamazon_db'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  readProducts();
});

function readProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
    runSearch();
  });
}

function completePurchase(item_id, price, purchaseQuantity, newQuantity) {
  var totalPrice = price * purchaseQuantity 
  console.log(`Total Cost: ${totalPrice}`);
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newQuantity
      },
      {
        item_id: item_id
      }
    ],
    function(err, res) {
      if (err) throw err;
      // Call deleteProduct AFTER the UPDATE completes
      //deleteProduct();
    }
  );
}

function runSearch() {
  inquirer.prompt([
    {
      type: "input",
      name: "product_id",
      message: "Please provide the ID of the item you would like to purchase"
    },
    {
      type: "number",
      name: "quantity",
      message: "Please provide the quantity"
    }
  ]).then(function(answer) {
      console.log(answer);

      var query = `SELECT * FROM products WHERE item_id = ${answer.product_id}`;
      connection.query(query, function(err, res) {
        if (err) throw err;
        else if (res[0].stock_quantity - answer.quantity >= 0) {
          console.log('Item available')
          var price = res[0].price
          var purchaseQuantity = answer.quantity
          var newQuantity = res[0].stock_quantity - answer.quantity
          completePurchase(answer.product_id, price, purchaseQuantity,newQuantity);
        } else {
          console.log('Insufficient Quantity!');
        }
      })
  });
}


