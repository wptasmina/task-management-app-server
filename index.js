const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken')
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000

const corsOptions = {
  origin: ["https://tesk-management-app-client.vercel.app","http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));

//middleware
app.use(express.json())
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.fmah5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-1`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  
async function run() {
  try {

 // Tasts-Collection
 const tasksCollection = client.db("tasks").collection("task");

    //Auth related apis

      // Get tasks for the logged-in user
      app.get("/tasks", async (req, res) => {
        try {
          const { email } = req.query; // Get email from query parameters
      
          if (!email) {
            return res.status(400).json({ error: "Email is required" });
          }
      
          const tasks = await tasksCollection.find({ email }).toArray();
          res.json(tasks);
        } catch (error) {
          res.status(500).json({ error: "Error fetching tasks" });
        }
      });

    
  // Post tasks data
  app.post("/tasks", async (req, res) => {
    const newTask= req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);

  });  


    // Update tasks
app.put("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body; 
  console.log(updatedTask, id)
  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },  
      { $set: updatedTask }  
    );
    
    if (result.modifiedCount === 1) {
      res.send({ message: "Task updated successfully" });
    } else {
      res.status(404).send({ message: "Task not found or no changes" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send({ message: "Failed to update task" });
  }
});


  // ✅ DELETE a task
  app.delete("/tasks/:id", async (req, res) => {

    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await tasksCollection.deleteOne(query)
    res.send(result)

  });


    //   await client.connect();

    //   await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send("Hello From coding!!!!")
})

app.listen(port, ()=>{
    console.log(`server is running on...${port}`)
})