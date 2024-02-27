require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

// verify jwt
// const verifyJWT=(req,res,next)=>{
//     const authorization=req.headers.authorization;
//     if(!authorization){
//         res.status(403).send({error:true, message: "Unauthorize access"})
//     }
//     const token=authorization.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error,decoded)=>{
//         if(error){
//             res.status(403).send({error:true, message:"Unauthorize access"})
//         }
//         else{
//             req.decoded=decoded;
//             next()
//         }
//     })
// }

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.n2wd0zs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        //JWT
        app.post('/jwt',(req,res)=>{
            const user=req.body;
            console.log(user);
            const token=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
            console.log(token);
            res.send({token})
        })

        const galleryCollection = client.db('volunteerDB').collection('gallery');
        const galleryCollection2 = client.db('volunteerDB').collection('cart');

        //get all data from gallery collection and sent to ui
        app.get('/gallery', async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const skip = page * limit
            const result = await galleryCollection.find().skip(skip).limit(limit).toArray()
            res.send(result);
        })

        //getting total no of items in gallery Collection
        app.get('/totalGallery', async (req, res) => {
            const result = await galleryCollection.estimatedDocumentCount();
            res.send({ totalGallery: result })
        })

        // getting total no of items from cart collection
        app.get('/totalGallery2', async (req, res) => {
            const result = await galleryCollection2.estimatedDocumentCount();
            res.send({ totalGallery: result })
        })
        

        //post a single data from ui to cart collection
        app.post('/cart', async (req, res) => {
            const user = req.body;
            const result = await galleryCollection2.insertOne(user)
            res.send(result)
        })

        // get all data from cart collection
        app.get('/cart', async (req, res) => {
            const result = await galleryCollection2.find().toArray()
            res.send(result)
        })

        // delete a single data from cart by id
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };   // this _id is a title of user
            const result = await galleryCollection2.deleteOne(query)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('volunteer is running')
})

app.listen(port, () => {
    console.log(`volunteer is running on port ${port}`);
})