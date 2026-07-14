import { ClerkLoaded } from "@clerk/react";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <>
      <ClerkLoaded>
        <Outlet />
      </ClerkLoaded>
    </>
  );
}

export default App;
