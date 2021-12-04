const express = require('express')
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000

// middleWare
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.om5y9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Database connected Successfully");
        const database = client.db("ema_tech");
        const productsCollection = database.collection("products");

        //getting all products Api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })
        //getting single product Api by Id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //added a new product Api
        app.post('/products', async (req, res) => {
            const key = req.body.key;
            const category = req.body.category;
            const price = req.body.price;
            const star = req.body.star;
            const stock = req.body.stock;
            const seller = req.body.seller;
            const starCount = req.body.starCount;
            const name = req.body.name;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const product = {
                key,
                category,
                price,
                star,
                stock,
                seller,
                starCount,
                name,
                img: imageBuffer
            }
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })

        // update a product api 
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedProduct = req.body;
            const options = { upsert: true };
            console.log(updatedProduct.stock);
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    category: updatedProduct.category,
                    price: updatedProduct.price,
                    seller: updatedProduct.seller,
                    stock: updatedProduct.stock
                },
            };

            const result = await productsCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        })


        // delete product Api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const result = await productsCollection.deleteOne(query);

            res.json(result);
        })


    } finally {
        //   await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Ema-John Tech')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})