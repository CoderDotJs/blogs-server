const express = require('express')
const app = express()
const port =  process.env.PORT || 5000;
const dotenv = require('dotenv');
const { MongoClient } = require("mongodb");
const cors = require('cors')

app.use(cors())
app.use(express.json())
dotenv.config();



app.get('/', (req, res) => {
  res.send('Welcome to the blogs API')
})



 
// Replace the following with your Atlas connection string                                                                                                                                        
 const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.xuibt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
    try {
        await client.connect();
        const database = client.db('blogs_db');
        const blogsCollection = database.collection('blogs');
        const usersCollection = database.collection('users');

        

        

        //save blogs to the database

        app.get('/all-blogs', async(req, res) => {
            const result = await blogsCollection.find({}).toArray();
            if(!result || result.length === 0) {
                res.status(404).send('No blogs found');
            } else {
                res.send(result)
            }
        })

        app.get('/my-blogs', async(req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const result = await blogsCollection.find(filter).toArray();
            if(!result || result.length === 0) {
                res.status(404).send('No blogs found');
            } else {
                res.send(result)
            }
        })

        app.post('/add-blogs', async(req, res) => {
            const newBlog = req.body;
            if(newBlog.category == 'Web Design') {
                newBlog.category = 'web-design'
            }
            if(newBlog.category == 'Javascript') {
                newBlog.category = 'javascript'
            }
            if(newBlog.category == 'React') {
                newBlog.category = 'react'
            }
            if(newBlog.category == 'Css') {
                newBlog.category = 'css'
            }
            newBlog.createdAt = new Date().toDateString();
            const result = await blogsCollection.insertOne(newBlog);
            console.log(newBlog)
            res.json(result);
            res.send(res.json(result))
        })

        app.get('/category', async (req, res) => {
            const category = req.query.category;
            const filter = { category: category };
            const result = await blogsCollection.find(filter).toArray();
            if(!result || result.length === 0) {
                res.status(404).send('No blogs found');
            } else {
                res.send(result)
            }
        })

        //save user to the data

        app.put('/save-user', async(req, res) => {
            const user = req.body;
            const email = user.email;
            if(email === undefined) {
                res.status(400).send('Email is required');
            }
            console.log('user loged in', user)
            const query = { email: email };
            const update = { $set: user };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(query, update, options);
            res.send(result)
        })

        //get user  form db
        app.get('/db-user', async (req, res)=>{
            const email = req.query.email;
            if(email === "undefined" || null) {
               return res.status(400).send('Email is required');
            }
            console.log('email', email === 'undefined')
            const query = { email: email };
            console.log(query)
            const collection = await usersCollection.findOne(query);
            console.log('col', collection)
            res.send(collection)
        })
  
      //make admin api 
      app.put('/make-admin', async (req, res)=>{
        const user = req.body;
        const email = user.email;
        console.log('user loged in', user)
        const query = { email: email };
        const update = { 
          $set: {
            role: 'Admin',
          }
        };
        const options = { upsert: false };
        const result = await usersCollection.updateOne(query, update, options);
        res.send(result)
      })

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})