import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import { List, User } from "./schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// import { addData } from "./data.js";
const saltRounds = 10;
const app = express();
app.use(express.json());
if (!process.env.DATABASE_URL) throw Error("Database url not found");

await mongoose.connect(process.env.DATABASE_URL);
console.log("MongoDB connected");

function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "unauthorized" });
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
    res.status(200).json({ msg: "user created", token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "couldnt create user" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          id: data._id,
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({ msg: "user loggin successfull", token });
    } else {
      res.status(401).json({ msg: "invalid password" });
    }
  } catch (error) {
    res.status(404).json({ msg: "user not found" });
  }
});
app.post("/api/auth/logout", (_, res) => {
  res.status(200).json({ msg: "user logged out" });
});

app.use(auth);
app.get("/api/lists", async (_, res) => {
  try {
    const lists = await List.find();
    res.status(200).json({ msg: "fetched sucessfully", lists });
  } catch (err) {
    res.status(500).json({ msg: "couldnt fetch lists" });
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
    const tasks = await List.findById(id)
      .populate("tasks")
      .then((list) => {
        res.status(200).json({ msg: "fetched tasks", tasks: list.tasks });
      })
      .catch((err) => {
        res.status(500).json({ msg: "couldnt fetch tasks" });
      });
    res.status(200).json({ msg: "fetched tasks", tasks });
  } catch (error) {
    res.status(500).json({ msg: "couldnt fetch tasks" });
  }
});
app.post("/api/lists/:id/tasks", async (req, res) => {
  const userId = req.__userId;
  const { title, description, position } = req.body;
  const { id } = req.params;
  try {
    const task = await List.findById(id)
      .then((list) => {
        const task = list.tasks.create({
          title,
          description,
          position,
          user: userId,
        });
        list.tasks.push(task);
        list.save();
        res.status(200).json({ msg: "task created", task });
      })
      .catch((err) => {
        res.status(500).json({ msg: "couldnt create task" });
      });
    res.status(200).json({ msg: "task created", task });
  } catch (error) {
    res.status(500).json({ msg: "couldnt create task" });
  }
});
app.put("/api/tasks/:id", async (req, res) => {
  const { title, description, position } = req.body;
  const { id } = req.params;
  try {
    const task = await List.findById(id)
      .then((list) => {
        const task = list.tasks.find((task) => task._id == id);
        task.title = title;
        task.description = description;
        task.position = position;
        list.save();
        res.status(200).json({ msg: "task updated", task });
      })
      .catch((err) => {
        res.status(500).json({ msg: "couldnt update task" });
      });
    res.status(200).json({ msg: "task updated", task });
  } catch (error) {
    res.status(500).json({ msg: "couldnt update task" });
  }
});
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await List.findById(id)
      .then((list) => {
        const task = list.tasks.find((task) => task._id == id);
        list.tasks.pull(task);
        list.save();
        res.status(200).json({ msg: "task deleted", task });
      })
      .catch((err) => {
        res.status(500).json({ msg: "couldnt delete task" });
      });
    res.status(200).json({ msg: "task deleted", task });
  } catch (error) {
    res.status(500).json({ msg: "couldnt delete task" });
  }
});
app.put("/api/tasks/:id/move", (req, res) => {
  const { position } = req.body;
  const { id } = req.params;
  try {
    List.updateOne(
      {
        "tasks._id": id,
      },
      {
        $set: {
          "tasks.$.position": position,
        },
      }
    )
      .then(() => {
        res.status(200).json({ msg: "task moved" });
      })
      .catch((err) => {
        res.status(500).json({ msg: "couldnt move task" });
      });
  } catch (error) {
    res.status(500).json({ msg: "couldnt move task" });
  }
});

app.listen(8080, () => {
  console.log("Server listening server at port 8080");
});
