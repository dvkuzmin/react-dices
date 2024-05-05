import React, { useState } from 'react';

const WebSocketComponent = () => {
  const [socket, setSocket] = useState(null);

  // Функция для создания WebSocket соединения
  const connectWebSocket = () => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('WebSocket соединение установлено');
    };
    newSocket.onmessage = (event) => {
      console.log('Получено сообщение от сервера:', event.data);
    };
    newSocket.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };
    newSocket.onerror = (error) => {
      console.error('Произошла ошибка:', error);
    };
    setSocket(newSocket);
  };

  // Функция для отправки сообщения через WebSocket
  const sendMessage = () => {
    if (socket) {
      socket.send('Привет, сервер!');
    } else {
      console.error('WebSocket соединение не установлено.');
    }
  };

  // Функция для закрытия WebSocket соединения
  const closeWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  return (
    <div>
      <button onClick={connectWebSocket}>Установить соединение</button>
    </div>
  );
};

export default WebSocketComponent;
