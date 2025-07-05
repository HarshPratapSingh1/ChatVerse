import React, { useContext, useEffect, useState, useRef } from 'react';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { UserContext } from './userContext';
import { uniqBy } from 'lodash';
import axios from 'axios';
import { Contact } from './Contact';

export const Chat = () => {
  const { username, id, setId, setUsername } = useContext(UserContext);
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, SetSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode ? storedMode === 'true' : false;
  });
  const divUnderMessages = useRef();
  const sidebarRef = useRef();

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    connectToWS();
  }, []);

  function connectToWS() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://chatverse-4bz4.onrender.com`);
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        connectToWS();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username: uname }) => {
      people[userId] = uname;
    });
    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData && id) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => [...prev, { ...messageData }]);
      }
    }
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessage,
      file,
    }));
    setNewMessage('');
    setMessages(prev => ([
      ...prev,
      {
        text: newMessage,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
        file: file?.name
      }
    ]));

    if (file) {
      setTimeout(() => {
        axios.get('/messages/' + selectedUserId).then(res => {
          setMessages(res.data);
        });
      }, 500);
    }
  }

  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then(res => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));

      const offlinePeoples = {};
      offlinePeopleArr.forEach(p => {
        offlinePeoples[p._id] = p;
      });
      setOfflinePeople(offlinePeoples);
    });
  }, [onlinePeople]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && sidebarRef.current.contains(event.target)) {
        const contactElements = sidebarRef.current.querySelectorAll('.contact');
        const isOnAnyContact = Array.from(contactElements).some(el => el.contains(event.target));
        if (!isOnAnyContact) {
          SetSelectedUserId(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const messageWithOutDups = uniqBy(messages, '_id');

  return (
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-blue-50 text-gray-800'}`}>
      {/* Sidebar */}
      <div ref={sidebarRef} className={`w-1/3 flex flex-col border-r shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className='flex-grow overflow-y-auto'>
          <div className='flex justify-between items-center p-4'>
            <Logo />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className='text-xs px-3 py-1 rounded border border-current hover:opacity-80 transition'
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
          {Object.keys(onlinePeople)
            .filter(userId => userId !== id)
            .map(userId => (
              <Contact key={userId} id={userId}
                mode={darkMode}
                online={true}
                username={onlinePeople[userId]}
                onClick={() => SetSelectedUserId(userId)}
                selected={userId === selectedUserId} />
            ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact key={userId} id={userId}
              mode={darkMode}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => SetSelectedUserId(userId)}
              selected={userId === selectedUserId} />
          ))}
        </div>
        <div className={`p-3 border-t flex items-center justify-between ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <span className='text-sm flex items-center gap-1'>
            {username}
          </span>
          <button onClick={logout} className='text-sm text-blue-400 border border-blue-400 px-3 py-1 rounded hover:bg-blue-100 transition cursor-pointer'>
            Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex flex-col w-2/3 p-2'>
        <div className='flex-grow relative'>
          {!selectedUserId ? (
            <div className='flex items-center justify-center h-full text-gray-400 text-lg'>
              &larr; Please select someone to talk
            </div>
          ) : (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute inset-0 pb-4 pr-2'>
                {messageWithOutDups.map(msg => (
                  <div key={msg._id} className={`my-2 ${msg.sender === id ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-2 rounded-md text-sm shadow-sm ${msg.sender === id ? 'bg-blue-500 text-white' : `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}`}>
                      {msg.text}
                      {msg.file && (
                        <div className='mt-1'>
                          <a target='_blank' rel='noreferrer' className='flex items-center gap-1 text-blue-700 hover:underline' href={axios.defaults.baseURL + "/uploads/" + msg.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.59 2.59a2 2 0 00-2.83 0L3 11.34V21h9.66l8.76-8.76a2 2 0 000-2.83l-6.83-6.82zM6 18a1 1 0 110-2 1 1 0 010 2zm4-4a1 1 0 110-2 1 1 0 010 2zm4-4a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                            {msg.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {selectedUserId && (
          <form className='flex gap-2 mt-2 items-center' onSubmit={sendMessage}>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              type="text"
              placeholder='Type your message here'
              className={`border rounded px-3 py-2 flex-grow text-sm focus:outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'}`}
            />
            <label className={`relative cursor-pointer p-2 rounded transition ${darkMode ? 'bg-gray-700 text-blue-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              <input type="file" className='hidden' onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.97 3.66a2.25 2.25 0 0 0-3.18 0l-10.94 10.94a3.75 3.75 0 1 0 5.3 5.3l7.69-7.69a.75.75 0 0 1 1.06 1.06l-7.69 7.69a5.25 5.25 0 1 1-7.42-7.42l10.93-10.94a3.75 3.75 0 0 1 5.3 5.3L9.1 18.83a.75.75 0 0 0 1.06 1.06l8.81-8.81a2.25 2.25 0 0 0 0-3.18Z" />
              </svg>
            </label>
            <button type='submit' className={`rounded p-2 transition ${darkMode ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.27 3.13A59.77 59.77 0 0121.49 12 59.77 59.77 0 013.27 20.87L6 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};