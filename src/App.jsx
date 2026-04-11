import { useState, useEffect } from "react";
import RevenueForecast from "./revenueforecast";
import Login from "./Login";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    setIsAuth(!!auth);
  }, []);

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <div>
      <RevenueForecast />
    </div>
  );
}

export default App;