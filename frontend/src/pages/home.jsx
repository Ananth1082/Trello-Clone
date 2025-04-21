import React, { useEffect, useState } from "react";
import { ListContainer } from "../components/list-container";
import { getJWT } from "../util";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getJWT();
    if (!token) return navigate("/auth/sign-in");
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    navigate("/auth/sign-in");
  }

  return (
    <div>
      <nav className="p-2 flex justify-end">
        <button
          className="side p-1 border-2 border-black rounded-md"
          onClick={logout}
        >
          Logout
        </button>
      </nav>
      <ListContainer />
    </div>
  );
};

export default Dashboard;
