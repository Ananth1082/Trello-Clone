import React from "react";
import ListItem from "./list-item";

export default function List({ items, listId, moveItem }) {
  return (
    <div
      style={{
        padding: "10px",
        border: "2px solid black",
        minWidth: "200px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3>{listId.toUpperCase()}</h3>
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          listId={listId}
          moveItem={moveItem}
        />
      ))}
    </div>
  );
}
