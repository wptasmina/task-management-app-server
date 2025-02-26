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
    app.post('/jwt', async (req, res) => {
        const user = req.body
        const token = jwt.sign(user, 'secret', {expiresIn: '1h'})
        res.send(token)
    })


    app.get('/tasks', async(req, res)=>{
        const result = await tasksCollection.find().toArray();
        res.send(result)
      })
    
  // Post tasks data
  app.post("/tasks", async (req, res) => {
    const newTask= req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);

  });  


  // Get a specific task by ID
  app.get("/tasks/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

    // Update tasks
app.put("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body;  // Get the updated task from the request body
  console.log(updatedTask, id)
  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },  // Find the task by ID
      { $set: updatedTask }  // Set the updated data (category in this case)
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

    console.log()

  });


    //   await client.connect();

    //   await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("Hello From coding!!!!")
})

app.listen(port, ()=>{
    console.log(`server is running on...${port}`)
})