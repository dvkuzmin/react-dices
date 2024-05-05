  import React, { Component, useEffect } from 'react';
  import Hand from './Hand';

  class App extends Component {

    // state = {
    //   socket: null
    // };
  
    // componentDidMount() {
    //   const newSocket = new WebSocket('ws://localhost:8000/chat');

    //   newSocket.onopen = () => {
    //     this.setState({ socket: newSocket});
    //   }
  
    //   newSocket.onmessage = (message) => {
    //     console.log(message);
    //   };
    //   }
  
    // componentWillUnmount() {
    //   const { socket } = this.state;
    //   if (socket) {
    //     socket.close();
    //   }
    // }



    render() {
      return (
        <div className='App'>
          <Hand />
        </div>
      );
    }
  }

  export default App;
