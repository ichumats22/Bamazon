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
  selectCommand();
});

function selectCommand() {
  inquirer.prompt([
    {
      type: "list",
      name: "command",
      message: "What would you like to do?",
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
    }
  ]).then(function(answer) {
      console.log(answer);
      runCommand(answer.command);
    }
  )
}

function runCommand(answer) {
  switch (answer) {
    case 'View Products for Sale':
      readProducts();
      break;
    case 'View Low Inventory':
      lowInventory();
      break;
    case 'Add to Inventory':
      addToInventory();
      break;
    case 'Add New Product':
      addNewProduct();
  }
};


function readProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
    selectCommand();
  });
}

function lowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
    selectCommand();
  });
}

function addToInventory() {
  inquirer.prompt([
    {
      type: "input",
      name: "item_id",
      message: "Please provide the ID of the item you would like to update"
    },
    {
      type: "number",
      name: "quantity",
      message: "Please provide the quantity to add"
    }
  ]).then(function(answer) {
    console.log(answer);
    var item_id = answer.item_id
    var addedQuantity = answer.quantity
    var query = `SELECT * FROM products WHERE item_id = ${item_id}`;
    connection.query(query, function(err, res) {
      if (err) throw err;
      else {
        var newQuantity = res[0].stock_quantity + addedQuantity
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
            else {
              console.log(`Item #${item_id} quantity updated to ${newQuantity}`)
              selectCommand();
            }
          }
        );
      }
    })
  })
}

function addNewProduct() {
  inquirer.prompt([
    {
      type: "input",
      name: "product_name",
      message: "Please provide the name of the item you would like to add"
    },
    {
      type: "input",
      name: "department_name",
      message: "Please provide the product's department"
    },
    {
      type: "input",
      name: "price",
      message: "Please provide the product's price"
    },
    {
      type: "input",
      name: "stock_quantity",
      message: "Please provide the quantity of this product in stock"
    },
    {
      type: "confirm",
      name: "confirm",
      message: "Please confirm to add new product"
    }
  ]).then(function(answer) {
    console.log(answer);
    if (answer.confirm) {
      connection.query( "INSERT INTO products SET ?",
        {
          product_name: answer.product_name, 
          department_name: answer.department_name, 
          price: answer.price,
          stock_quantity: answer.stock_quantity
        },
        function(err, res){
          if (err) throw err;
          else {
            console.log(`Product #${res.insertId} added!`);
            selectCommand();
          }; 
        }
      )
    }   
  })
}



