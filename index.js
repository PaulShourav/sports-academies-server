const express=require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app=express()
app.use(cors())
app.use(express.json())

const port=process.env.PORT || 5000;


console.log(process.env.DB_PASSWORD);
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/?retryWrites=true&w=majority`;

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

    const userCollection=client.db('sportsDB').collection('user')
    const classCollection=client.db('sportsDB').collection('class')
    app.post('/user',async(req,res)=>{
        console.log('paici');
        const query={
          email:req.body.email
        }
        const findEmail=await userCollection.findOne(query)
        if (findEmail) {
          return res.status(404).send({message:"Allready have a same email"})
        }
        const result=await userCollection.insertOne({...req.body})
        res.send(result)
    })
    app.get('/user',async(req,res)=>{
      const result=await userCollection.find({}).toArray()
      res.send(result)
    })
    app.get('/adminUser',async(req,res)=>{
      const filter={
        email:req.query.email,
        role:"admin"
      }
        const result=await userCollection.findOne(filter)
        if (!result) {
          return res.status(401)
        }
        return res.send(result) 
    })
    app.get('/instructor',async(req,res)=>{
      const filter={
        email:req.query.email,
        role:"instructor"
      }
        const result=await userCollection.findOne(filter)
        if (!result) {
          return res.status(401)
        }
        return res.send(result) 
    })
    app.patch('/user',async(req,res)=>{
      const role=req.query.role
      const email=req.query.email
      const filter={
        email:req.query.email
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role:req.query.role
        },
      };
      const result=await userCollection.updateOne(filter,updateDoc,options)
      res.send(result)

      console.log(role,email);
    })
    //Class 
    app.post('/class',async(req,res)=>{
      
      const result=await classCollection.insertOne({...req.body})
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



app.get('/',(req,res)=>{
    res.send("Hello word")
})
app.listen(port,()=>{
    console.log("The server is runing",port);
})