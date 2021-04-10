const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42gqz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) =>{
    res.send('hello from db, its working')
})


client.connect(err => {
  const collection = client.db("simple-amazon").collection("products");
  const ordersCollection = client.db("simple-amazon").collection("orders")
  app.post('/addProduct', (req, res) =>{
    const products = req.body;  
    collection.insertOne(products)
    .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount)
    })
  })

//  make a API
    app.get('/products', (req, res)=>{
        const search = req.query.search;
        collection.find({name: {$regex: search}})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })


    app.get('/products/:key', (req, res)=>{
        collection.find({key: req.params.key})
        .toArray((err, documents)=>{
            res.send(documents[0])
        })
    })

    app.post('/productsByKeys', (req, res)=>{
        const productKeys = req.body;
        collection.find({key: {$in: productKeys}})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })





    app.post('/addOrder', (req, res) =>{
        const order = req.body;  
        ordersCollection.insertOne(order)
        .then(result => {
            console.log(result.insertedCount)
            res.send(result.insertedCount > 0)
        })
      })
});

app.listen(process.env.PORT || port)