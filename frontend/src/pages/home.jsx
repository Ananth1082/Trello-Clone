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
  return <ListContainer />;
};

export default Dashboard;
