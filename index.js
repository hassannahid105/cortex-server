const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const PORT = process.env.PORT || 5000;

// ? middle ware
// update
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cortex-new.web.app",
      "https://cortex-new.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bcmex8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  // Get the database and collection on which to run the operation
  const database = client.db("productList");
  const product = database.collection("product");
  const myCart = database.collection("myCart");
  try {
    // ! product list

    // get
    app.get("/product", async (req, res) => {
      const cursor = product.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await product.findOne(query);
      res.send(result);
    });
    // ?
    // !
    app.get("/products/:brand", async (req, res) => {
      const mybrand = req.params.brand;

      const result = await product
        .find({ brand: new RegExp(`^${mybrand}\\s*$`, "i") })
        .toArray();
      res.send(result);
    });
    // *
    // *
    // find prodct
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await product.findOne(query);
      res.send(result);
    });

    // post req
    app.post("/products", async (req, res) => {
      const productList = req.body;
      const result = await product.insertOne(productList);
      res.send(result);
    });
    // ! my cart
    // get
    app.get("/mycart", async (req, res) => {
      const cursor = myCart.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // post
    app.post("/mycart", async (req, res) => {
      const cart = req.body;
      const result = await myCart.insertOne(cart);
      res.send(result);
    });
    // update
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const items = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          brand: items.brand,
          name: items.name,
          type: items.type,
          price: items.price,
          description: items.description,
          rating: items.rating,
          photo: items.photo,
        },
      };
      const result = await product.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    // delete
    app.delete("/mycart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCart.deleteOne(query);
      res.send(result);
    });
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to cortex server. server is running......");
});
app.listen(PORT);
