import React from "react";

export default function Input({ type, name, id, onChange }) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      onChange={onChange}
      className="border-slate-300 border-2 rounded-md min-w-[16rem]  px-2"
    />
  );
}
