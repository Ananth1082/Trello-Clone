import React from "react";
import { useDrag, useDrop } from "react-dnd";

export default function ListItem({ item, index, listId, moveItem }) {
  const ref = React.useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "LIST_ITEM",
    canDrop: (dragged) => true, // allow dropping always
    drop: (dragged) => {
      if (dragged.listId === listId && dragged.index === index) return;

      moveItem(dragged.listId, listId, dragged.index, index, dragged.item);

      // update dragged reference
      dragged.index = index;
      dragged.listId = listId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: "LIST_ITEM",
    item: { item, index, listId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        padding: "8px 12px",
        margin: "4px 0",
        backgroundColor: isOver && canDrop ? "#d0f0ff" : "#e0e0e0",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        borderRadius: "4px",
        transition: "background 0.2s",
      }}
    >
      {item.label}
    </div>
  );
}
