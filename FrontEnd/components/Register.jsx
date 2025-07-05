import axios from 'axios';
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from './userContext';

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerOrLogin, setRegisterOrLogin] = useState("Log in");
  const [errorMessage, setErrorMessage] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode ? storedMode === 'true' : false;
  });

  const { setUsername: setLoggedInUserName, setId } = useContext(UserContext);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  async function sendData(ev) {
    ev.preventDefault();
    setErrorMessage(""); // reset error before trying

    const url = registerOrLogin === 'Register' ? 'register' : 'login';

    try {
      const { data } = await axios.post(url, { username, password });
      setLoggedInUserName(username);
      setId(data._id);
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      if (err.response?.data?.msg) {
        setErrorMessage(err.response.data.msg);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className={`h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-blue-100'}`}>
      <form
        className={`p-8 rounded-2xl shadow-md w-full max-w-sm transition-all duration-300 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}
        onSubmit={sendData}
      >
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-semibold'>{registerOrLogin}</h2>
          <button
            type='button'
            onClick={() => setDarkMode(!darkMode)}
            className='text-xs px-3 py-1 rounded border border-current hover:opacity-80 transition flex items-center gap-1'
          >
            {darkMode ? (
              <>
                🌞 Light Mode
              </>
            ) : (
              <>
                🌙 Dark Mode
              </>
            )}
          </button>
        </div>

        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          type="text"
          placeholder='Username'
          className={`w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' : 'text-gray-950 border-gray-300 focus:ring-blue-400'}`}
        />

        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder='Password'
          className={`w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' : 'text-gray-950 border-gray-300 focus:ring-blue-400'}`}
        />

        <button
          type="submit"
          className={`w-full p-3 rounded-lg transition-all duration-200 cursor-pointer ${darkMode ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {registerOrLogin === 'Register' ? "Register" : "Log in"}
        </button>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-3 text-center">
            {errorMessage}
          </div>
        )}

        <div className='text-center mt-4'>
          {registerOrLogin === 'Register' ? (
            <>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Already a member? </span>
              <button
                type="button"
                className='text-blue-400 hover:underline cursor-pointer'
                onClick={() => {
                  setRegisterOrLogin("Log in");
                  setErrorMessage("");
                }}
              >
                Login here
              </button>
            </>
          ) : (
            <>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Don't have an account? </span>
              <button
                type="button"
                className='text-blue-400 hover:underline cursor-pointer'
                onClick={() => {
                  setRegisterOrLogin("Register");
                  setErrorMessage("");
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
