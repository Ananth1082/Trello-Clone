import React, { useEffect, useState } from "react";
import { authHeader } from "../util";

export const ListContainer = () => {
  const [lists, setLists] = useState([]);
  const [isAddListDiagOpen, setIsAddListDiagOpen] = useState(false);
  const formData = {
    title: "",
    position: 0,
  };
  useEffect(() => {
    fetch("http://localhost:8080/api/lists", {
      headers: authHeader(),
    })
      .then((res) => {
        if (!res.ok) throw Error("couldnt fetch");
        return res.json();
      })
      .then(({ lists }) => {
        console.log(lists);
        lists.sort((a, b) => a.position - b.position);
        lists.forEach((list) => {
          list.tasks.sort((a, b) => a.position - b.position);
        });
        setLists(lists);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedTaskSource, setDraggedTaskSource] = useState(null);
  const [dragOverList, setDragOverList] = useState(null);

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
      body: JSON.stringify({
        list: destListId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw Error("couldnt move task");
        return res.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Task Dashboard</h1>
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
        {isAddListDiagOpen && (
          <div className={`bg-white rounded-lg shadow p-4`}>
            <h3>New List</h3>{" "}
            <p
              onClick={() => {
                setIsAddListDiagOpen(false);
              }}
            >
              close
            </p>
            <div className="bg-blue-100 p-3 mb-3 rounded shadow cursor-move">
              <div className="flex flex-col">
                <label for="title">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  // onChange={handleFormChange}
                  className="border-black border-2 rounded-md min-w-[10rem] px-2"
                />
              </div>

              <div className="flex flex-col">
                <label for="position">Position</label>
                <input
                  type="position"
                  name="position"
                  id="position"
                  // onChange={handleFormChange}
                  className="border-black border-2 rounded-md min-w-[10rem]  px-2"
                />
              </div>
              <button
                className="border-2 border-black p-1 rounded-lg"
                onClick={() => {
                  handleNewListSubmit;
                }}
              >
                Add List
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        className="border-2 border-black p-1 rounded-lg"
        onClick={() => {
          setIsAddListDiagOpen(true);
        }}
      >
        Add new list
      </button>
    </div>
  );
};
