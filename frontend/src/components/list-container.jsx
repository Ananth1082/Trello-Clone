import React, { useEffect, useState } from "react";
import { authHeader } from "../util";
import { Dialog } from "./ui/dialog";

export const ListContainer = () => {
  const [lists, setLists] = useState([]);
  const [isAddListDiagOpen, setIsAddListDiagOpen] = useState(false);
  const [isAddTaskDiagOpen, setIsAddTaskDiagOpen] = useState(false);
  const [isUpdateListDiagOpen, setIsUpdateListDiagOpen] = useState(false);
  const [isUpdateTaskDiagOpen, setIsUpdateTaskDiagOpen] = useState(false);

  const [newList, setNewList] = useState({ title: "", position: 0 });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    listId: "",
  });
  const [updateList, setUpdateList] = useState({ listId: "", title: "" });
  const [updateTask, setUpdateTask] = useState({
    taskId: "",
    title: "",
    description: "",
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedTaskSource, setDraggedTaskSource] = useState(null);
  const [dragOverList, setDragOverList] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = () => {
    fetch("http://localhost:8080/api/lists", {
      headers: authHeader(),
    })
      .then((res) => {
        if (!res.ok) throw Error("couldn't fetch");
        return res.json();
      })
      .then(({ lists }) => {
        lists.sort((a, b) => a.position - b.position);
        lists.forEach((list) =>
          list.tasks.sort((a, b) => a.position - b.position)
        );
        setLists(lists);
      })
      .catch((err) => console.log(err));
  };

  const handleDragStart = (task, sourceListId) => {
    setDraggedTask(task);
    setDraggedTaskSource(sourceListId);
  };

  const handleDragOver = (e, listId) => {
    e.preventDefault();
    setDragOverList(listId);
  };

  const handleTaskMovement = (taskId, destListId, sourceListId) => {
    if (destListId === sourceListId) return;
    fetch(`http://localhost:8080/api/tasks/${taskId}/move`, {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ list: destListId }),
    })
      .then((res) => {
        if (!res.ok) throw Error("couldn't move task");
        return res.json();
      })
      .then(() => fetchLists())
      .catch((err) => console.log(err));
  };

  const handleDrop = (e, destListId) => {
    e.preventDefault();
    if (!draggedTask || draggedTaskSource === null) return;
    if (destListId === draggedTaskSource) return;

    const sourceList = lists.find((l) => l._id === draggedTaskSource);
    const destList = lists.find((l) => l._id === destListId);

    const newSourceTasks = sourceList.tasks.filter(
      (t) => t._id !== draggedTask._id
    );
    const newDestTasks = [...destList.tasks, draggedTask];

    handleTaskMovement(draggedTask._id, destListId, draggedTaskSource);

    const updatedLists = lists.map((list) => {
      if (list._id === sourceList._id) {
        return { ...list, tasks: newSourceTasks };
      }
      if (list._id === destList._id) {
        return { ...list, tasks: newDestTasks };
      }
      return list;
    });

    setLists(updatedLists);
    setDraggedTask(null);
    setDraggedTaskSource(null);
    setDragOverList(null);
  };

  const handleAddList = () => {
    fetch("http://localhost:8080/api/lists", {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newList),
    })
      .then((res) => res.json())
      .then(() => {
        fetchLists();
        setIsAddListDiagOpen(false);
        setNewList({ title: "", position: 0 });
      })
      .catch((err) => console.log(err));
  };

  const handleAddTask = () => {
    fetch("http://localhost:8080/api/tasks", {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then(() => {
        fetchLists();
        setIsAddTaskDiagOpen(false);
        setNewTask({ title: "", description: "", listId: "" });
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateList = () => {
    fetch(`http://localhost:8080/api/lists/${updateList.listId}`, {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: updateList.title }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchLists();
        setIsUpdateListDiagOpen(false);
        setUpdateList({ listId: "", title: "" });
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateTask = () => {
    fetch(`http://localhost:8080/api/tasks/${updateTask.taskId}`, {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: updateTask.title,
        description: updateTask.description,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchLists();
        setIsUpdateTaskDiagOpen(false);
        setUpdateTask({ taskId: "", title: "", description: "" });
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Task Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setIsAddListDiagOpen(true)}
          className="border p-2 rounded bg-green-400"
        >
          Add List
        </button>
        <button
          onClick={() => setIsAddTaskDiagOpen(true)}
          className="border p-2 rounded bg-blue-400"
        >
          Add Task
        </button>
        <button
          onClick={() => setIsUpdateListDiagOpen(true)}
          className="border p-2 rounded bg-yellow-400"
        >
          Update List
        </button>
        <button
          onClick={() => setIsUpdateTaskDiagOpen(true)}
          className="border p-2 rounded bg-purple-400"
        >
          Update Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div
            key={list._id}
            className={`bg-white rounded-lg shadow p-4 ${
              dragOverList === list._id ? "border-2 border-blue-400" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, list._id)}
            onDrop={(e) => handleDrop(e, list._id)}
          >
            <h2 className="text-xl font-semibold mb-4">{list.title}</h2>
            {list.tasks.map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task, list._id)}
                className="bg-blue-100 p-3 mb-3 rounded shadow cursor-move"
              >
                <h3 className="font-medium">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-700">{task.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modals */}
      {isAddListDiagOpen && (
        <Dialog
          title="Add New List"
          onClose={() => setIsAddListDiagOpen(false)}
        >
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="Title"
            value={newList.title}
            onChange={(e) => setNewList({ ...newList, title: e.target.value })}
          />
          <input
            className="border p-2 mb-2 w-full"
            type="number"
            placeholder="Position"
            value={newList.position}
            onChange={(e) =>
              setNewList({ ...newList, position: Number(e.target.value) })
            }
          />
          <button
            onClick={handleAddList}
            className="border p-2 bg-green-400 rounded w-full"
          >
            Add List
          </button>
        </Dialog>
      )}

      {isAddTaskDiagOpen && (
        <Dialog
          title="Add New Task"
          onClose={() => setIsAddTaskDiagOpen(false)}
        >
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <select
            className="border p-2 mb-2 w-full"
            value={newTask.listId}
            onChange={(e) => setNewTask({ ...newTask, listId: e.target.value })}
          >
            <option value="">Select List</option>
            {lists.map((list) => (
              <option key={list._id} value={list._id}>
                {list.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            className="border p-2 bg-blue-400 rounded w-full"
          >
            Add Task
          </button>
        </Dialog>
      )}

      {isUpdateListDiagOpen && (
        <Dialog
          title="Update List"
          onClose={() => setIsUpdateListDiagOpen(false)}
        >
          <select
            className="border p-2 mb-2 w-full"
            value={updateList.listId}
            onChange={(e) =>
              setUpdateList({ ...updateList, listId: e.target.value })
            }
          >
            <option value="">Select List</option>
            {lists.map((list) => (
              <option key={list._id} value={list._id}>
                {list.title}
              </option>
            ))}
          </select>
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="New Title"
            value={updateList.title}
            onChange={(e) =>
              setUpdateList({ ...updateList, title: e.target.value })
            }
          />
          <button
            onClick={handleUpdateList}
            className="border p-2 bg-yellow-400 rounded w-full"
          >
            Update List
          </button>
        </Dialog>
      )}

      {isUpdateTaskDiagOpen && (
        <Dialog
          title="Update Task"
          onClose={() => setIsUpdateTaskDiagOpen(false)}
        >
          <select
            className="border p-2 mb-2 w-full"
            value={updateTask.taskId}
            onChange={(e) =>
              setUpdateTask({ ...updateTask, taskId: e.target.value })
            }
          >
            <option value="">Select Task</option>
            {lists.flatMap((list) =>
              list.tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))
            )}
          </select>
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="New Title"
            value={updateTask.title}
            onChange={(e) =>
              setUpdateTask({ ...updateTask, title: e.target.value })
            }
          />
          <input
            className="border p-2 mb-2 w-full"
            type="text"
            placeholder="New Description"
            value={updateTask.description}
            onChange={(e) =>
              setUpdateTask({ ...updateTask, description: e.target.value })
            }
          />
          <button
            onClick={handleUpdateTask}
            className="border p-2 bg-purple-400 rounded w-full"
          >
            Update Task
          </button>
        </Dialog>
      )}
    </div>
  );
};
