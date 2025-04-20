export const getJWT = () => {
  const jwt = localStorage.getItem("access_token");
  if (!jwt) return null;
  return jwt;
};

export const authHeader = () => {
  const token = getJWT();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};
