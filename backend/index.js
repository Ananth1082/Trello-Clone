import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import { List, Task, User } from "./schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

// import { addData } from "./data.js";
const saltRounds = 10;
const app = express();
app.use(cors());
app.use(express.json());
if (!process.env.DATABASE_URL) throw Error("Database url not found");

await mongoose.connect(process.env.DATABASE_URL);
console.log("MongoDB connected");

function auth(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "unauthorized" });
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  } else {
    return res.status(401).json({ msg: "unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "unauthorized" });
    if (!decoded) return res.status(401).json({ msg: "unauthorized" });
    req.__userId = decoded.id;
    next();
  });
}

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name)
      return res.status(400).json({ msg: "missing fields" });
    const hashPswd = bcrypt.hashSync(password, saltRounds);
    const data = await User.create({
      email,
      password: hashPswd,
      name,
    });

    const token = jwt.sign(
      {
        id: data._id,
      },
      process.env.JWT_SECRET
    );
    console.log("created user: Name: ", name, " Email: ", email);
    res.status(200).json({ msg: "user created", token });
  } catch (error) {
    console.log("error creating user: ", error);
    res.status(400).json({ msg: "couldnt create user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  console.log("login request: ", req.body);
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ msg: "missing fields" });

    const user = await User.findOne({
      email,
    });
    if (!user) return res.status(401).json({ msg: "invalid email" });

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({ msg: "user loggin successfull", token });
    } else {
      res.status(401).json({ msg: "invalid password" });
    }
  } catch (error) {
    console.log("error logging in user: ", error);
    res.status(404).json({ msg: "user not found" });
  }
});

app.use(auth);

app.get("/api/user", async (req, res) => {
  const userId = req.__userId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ msg: "unauthorized" });
    res.status(200).json({
      msg: "user fetched",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "couldnt fetch user" });
  }
});

app.post("/api/auth/logout", (_, res) => {
  res.status(200).json({ msg: "user logged out" });
});

app.get("/api/lists", async (_, res) => {
  try {
    const lists = await List.find();

    const listIds = lists.map((list) => list._id);

    const tasks = await Task.find({ list: { $in: listIds } });

    const tasksByListId = {};
    tasks.forEach((task) => {
      const listId = task.list.toString();
      if (!tasksByListId[listId]) {
        tasksByListId[listId] = [];
      }
      tasksByListId[listId].push(task);
    });

    const listsWithTasks = lists.map((list) => {
      return {
        ...list.toObject(),
        tasks: tasksByListId[list._id.toString()] || [],
      };
    });

    res
      .status(200)
      .json({ msg: "Fetched successfully", lists: listsWithTasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Couldn't fetch lists" });
  }
});

app.post("/api/lists", async (req, res) => {
  const { title, position } = req.body;
  try {
    await List.create({
      title,
      position,
    });
    res.status(200).json({ msg: "list created" });
  } catch (error) {
    res.status(400).json({ msg: "couldnt create list" });
  }
});
app.put("/api/lists/:id", async (req, res) => {
  const { title, position } = req.body;
  try {
    await List.updateOne(
      {
        _id: req.params.id,
      },
      {
        title,
        position,
      }
    );
    res.status(200).json({ msg: "list updated" });
  } catch (error) {
    res.status(400).json({ msg: "couldnt update list" });
  }
});
app.delete("/api/lists/:id", async (req, res) => {
  try {
    await List.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ msg: "list deleted" });
  } catch (error) {
    res.status(400).json({ msg: "couldnt delete list" });
  }
});

app.get("/api/lists/:id/tasks", async (req, res) => {
  const { id } = req.params;
  try {
    const tasks = await Task.find({
      list: id,
    });
    res.status(200).json({ msg: "fetched tasks", tasks });
  } catch (error) {
    console.error("error fetching tasks: ", error);

    res.status(500).json({ msg: "couldnt fetch tasks" });
  }
});
app.post("/api/lists/:id/tasks", async (req, res) => {
  const userId = req.__userId;
  const { title, description, position } = req.body;
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    console.log();
    if (!list) return res.status(404).json({ msg: "list not found" });
    const task = await Task.create({
      list: id,
      createdBy: userId,
      title,
      description,
      position,
      user: userId,
    });
    res.status(200).json({ msg: "task created", task });
  } catch (error) {
    console.log("error creating task: ", error);

    res.status(500).json({ msg: "couldnt create task" });
  }
});
app.put("/api/tasks/:id", async (req, res) => {
  const { title, description, position } = req.body;
  const { id } = req.params;
  try {
    await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        position,
      },
      { new: true }
    );
    res.status(200).json({ msg: "task updated" });
  } catch (error) {
    res.status(500).json({ msg: "couldnt update task" });
  }
});
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({ msg: "task deleted" });
  } catch (error) {
    res.status(500).json({ msg: "couldnt delete task" });
  }
});
app.put("/api/tasks/:id/move", async (req, res) => {
  const { position } = req.body;
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      {
        position,
      },
      { new: true }
    );
    res.status(200).json({ msg: "task moved", task });
  } catch (error) {
    res.status(500).json({ msg: "couldnt move task" });
  }
});

app.listen(8080, () => {
  console.log("Server listening server at port 8080");
});
