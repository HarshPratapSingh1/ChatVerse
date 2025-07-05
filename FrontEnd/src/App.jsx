import axios from "axios"
import { Register } from "../components/Register"
import { UserContextProvider } from "../components/userContext";
import { Routes } from "./Routes";

function App() {
  axios.defaults.baseURL = "https://chatverse-4bz4.onrender.com";
  axios.defaults.withCredentials = true;
  return (
    <>
     <UserContextProvider>
      <Routes/>
     </UserContextProvider>
    </>
  )
}

export default App
