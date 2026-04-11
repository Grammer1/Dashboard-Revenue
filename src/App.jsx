import { useState, useEffect } from "react";
import RevenueForecast from "./revenueforecast";
import Login from "./Login";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
  const interval = setInterval(() => {
    const loginTime = localStorage.getItem("loginTime");

    if (loginTime) {
      const diff = Date.now() - parseInt(loginTime);
      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (diff > THIRTY_MINUTES) {
        localStorage.removeItem("auth");
        localStorage.removeItem("loginTime");
        setIsAuth(false);
      }
    }
  }, 60000); // cek tiap 1 menit

  return () => clearInterval(interval);
}, []);

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
  <div>
    <RevenueForecast onLogout={() => setIsAuth(false)} />
  </div>
);
}

export default App;