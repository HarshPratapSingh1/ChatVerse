import axios from "axios"
import { Register } from "../components/Register"
import { UserContextProvider } from "../components/userContext";
import { Routes } from "./Routes";

function App() {
  axios.defaults.baseURL = "http://localhost:3000";
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
