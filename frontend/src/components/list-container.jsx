import React, { useState } from "react";

export const ListContainer = () => {
  const [lists, setLists] = useState([
    {
      _id: "list-1",
      title: "To Do",
      tasks: [
        {
          _id: "task-1",
          title: "Setup project",
          description: "Initialize Git repo and folder structure",
        },
        {
          _id: "task-2",
          title: "Design UI",
          description: "Create wireframes and UI kit",
        },
      ],
    },
    {
      _id: "list-2",
      title: "In Progress",
      tasks: [
        {
          _id: "task-3",
          title: "Build Auth Module",
          description: "Implement JWT auth",
        },
      ],
    },
    {
      _id: "list-3",
      title: "Done",
      tasks: [
        {
          _id: "task-4",
          title: "Setup MongoDB",
          description: "Create and connect DB",
        },
      ],
    },
  ]);

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
      </div>
    </div>
  );
};
