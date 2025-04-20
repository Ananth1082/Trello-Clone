export const getJWT = () => {
  const jwt = localStorage.getItem("access_token");
  if (!jwt) return null;
  return jwt;
};
