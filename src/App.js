import React, {useState, useEffect} from 'react';
import openSocket from 'socket.io-client';
import './App.css';

const socket = openSocket('http://localhost:8000');

const Cell = ({col, row, value, color}) => {
  const fillCell = () => {
    socket.emit('fillCell', row, col, color);
  }

  return(
    <button 
      key={col} 
      className={value === 0 ? 'cell cellEmpty' : 'cell cellFull' }
      onClick={fillCell}
    >{value}</button>
  );
}

const Table = ({world, color}) => {
  const createTable = () => {
    let rowId = 0;
    const table = [];
    for(let row = 0; row < world.size; row++) {
      let cols = [];
      let cellId = 0;
      for(let col = 0; col < world.size; col++) {
        cols.push(<Cell 
            key={cellId} 
            col={cellId} 
            row={rowId} 
            value={world.grid[row][col]} 
            color={color} 
          />);
        cellId++;
      }
      table.push(<div key={rowId} className='boardRow'>{cols}</div>);
      rowId++;
    }
    return table;
  }
  return(
    <div>
      {createTable()}
    </div>
  );
}

const App = () => {
  const [world, setWorld] = useState({});
  const [color, setColor] = useState(0);

  socket.on('worldUpdate', (newWorld) => {
    setWorld(newWorld);
  });

  socket.on('newUser', (newColor) => {
    setColor(newColor);
  });

  useEffect(() => {
    const updateGridTimer = setInterval(() => {
      socket.emit('getWorld', (newWorld) => {
        setWorld(newWorld);
      });
    }, 1000);



    return(() => {
      clearInterval(updateGridTimer);
    });
  });

  return (
    <div className='App'>
      <Table world={world} color={color}/>
      <p>Your color id is {color}</p>
    </div>
  );
}

export default App;
