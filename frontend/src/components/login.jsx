import React, { useState } from "react";
import { Link } from "react-router";

export default function SignIN() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleFormChange = (e) => {
    setFormData((prev) => {
      prev[e.target.name] = e.target.value;
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div className="max-w-30rem w-[20vw] border-black border-2 flex flex-col justify-center items-center gap-2 px-2 py-10 rounded-sm">
      <h1 className="text-2xl"> Sign in</h1>
      <div className="flex flex-col">
        <label for="email">Email</label>
        <input
          type="text"
          name="email"
          id="email"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem] px-2"
        />
      </div>
      <div className="flex flex-col">
        <label for="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem]  px-2"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="border-2 border-black w-[5rem] mt-4"
      >
        Sign in
      </button>
      <div className="mt-10">
        <p>
          Are you a new user? <Link to="/auth/sign-up">create account</Link>
        </p>
      </div>
    </div>
  );
}
