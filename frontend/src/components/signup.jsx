import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function Login() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const handleFormChange = (e) => {
    setFormData((prev) => {
      prev[e.target.name] = e.target.value;
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw Error("Unauthorized");
        return res.json();
      })
      .then(({ token }) => {
        localStorage.setItem("access_token", token);
        nav("/");
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="max-w-30rem w-[25vw] border-black border-2 flex flex-col justify-center items-center gap-2 px-2 py-10 rounded-sm">
      <h1 className="text-2xl"> Sign up</h1>
      <div className="flex flex-col">
        <label for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem]"
        />
        <label for="email">Email</label>
        <input
          type="text"
          name="email"
          id="email"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem]"
        />
      </div>
      <div className="flex flex-col">
        <label for="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem]"
        />
      </div>
      <div className="flex flex-col">
        <label for="re-password">Re-enter Password</label>
        <input
          type="password"
          name="rePassword"
          id="re-password"
          onChange={handleFormChange}
          className="border-black border-2 rounded-md min-w-[16rem]"
        />
      </div>
      <button onClick={handleSubmit} className="border-2 border-black w-[5rem]">
        Sign up
      </button>
      <div className="mt-10">
        <p>
          {" "}
          Already a user?{" "}
          <Link className="underline" to="/auth/sign-in">
            {" "}
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
