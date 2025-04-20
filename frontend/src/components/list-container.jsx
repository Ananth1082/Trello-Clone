import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import List from "./list";

export default function ListContainer() {
  const [lists, setLists] = useState({
    listA: [
      { id: "a1", label: "A1" },
      { id: "a2", label: "A2" },
      { id: "a3", label: "A3" },
    ],
    listB: [
      { id: "b1", label: "B1" },
      { id: "b2", label: "B2" },
    ],
  });

  const moveItem = (fromList, toList, fromIndex, toIndex, item) => {
    if (!item) return;
    if (fromList === toList && fromIndex === toIndex) return;

    const updatedFrom = [...lists[fromList]];
    updatedFrom.splice(fromIndex, 1);

    const updatedTo = [...lists[toList]];
    updatedTo.splice(toIndex, 0, item);

    setLists((prev) => ({
      ...prev,
      [fromList]: updatedFrom,
      [toList]: updatedTo,
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", gap: "40px", padding: "20px" }}>
        <List items={lists.listA} listId="listA" moveItem={moveItem} />
        <List items={lists.listB} listId="listB" moveItem={moveItem} />
      </div>
    </DndProvider>
  );
}
