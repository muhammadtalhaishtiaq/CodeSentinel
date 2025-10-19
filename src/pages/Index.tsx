
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./Home";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to Home page
    navigate("/", { replace: true });
  }, [navigate]);
  
  // Render Home directly to avoid flash during redirect
  return <Home />;
};

export default Index;
