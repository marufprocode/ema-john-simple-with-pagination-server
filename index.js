const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//Middleware
app.use(express.json());
app.use(cors());

//Connect MongoDB Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v8einb9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      console.log("Database connected");
    } catch (error) {
      console.log(error.name, error.message);
    }
  }
run();

// Database Collection List 
const productCollection = client.db("emaJohn").collection("products");

app.get('/', (req, res) => {
    res.send('Hello From MongoDB')
});

// Get all the products from DB productsCollection
app.get('/products', async (req, res) => {
    try{
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const cursor = productCollection.find({});
        const products = await cursor.skip(page*size).limit(size).toArray();
        const count = await productCollection.estimatedDocumentCount();
        console.log(products);
        res.send({
            success: true,
            message: 'Successfully got the data',
            count,
            products
        })
    }
    catch (error){
        console.log(error.name, error.message);
        res.send({
        success: false,
        error: error.message,
        });
    }
})

app.post('/productsByIds', async (req, res) =>{
    try{
        const ids = req.body;
        const objectIds = ids.map(id => ObjectId(id));
        const cursor = productCollection.find({_id: {$in: objectIds}});
        const products = await cursor.toArray();
        res.send(products);
    }
    catch (error) {
        console.log(error.name, error.message);
        res.send({
        success: false,
        error: error.message,
        });
    }
})




app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
})