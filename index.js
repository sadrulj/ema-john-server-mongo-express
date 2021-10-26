const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ediyn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    console.log("database connected success");
    const database = client.db("onlineShop");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");

    //GET PRODUCTS API
    app.get("/products", async (req, res) => {
      // console.log(req.query);
      const cursor = productCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await cursor.count();
      let products;
      if (page) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }

      res.send({
        count,
        products,
      });
      //use POST to get data by keys
      app.post("/products/byKeys", async (req, res) => {
        const keys = req.body;
        const query = { key: { $in: keys } };
        const products = await productCollection.find(query).toArray();
        res.json(products);
      });
      //add ORDERS api
      app.post("/orders", async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result);
      });
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ema john server is running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
