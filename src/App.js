import React, {useState, useEffect} from 'react';
import openSocket from 'socket.io-client';
import './App.css';

const socket = openSocket('http://localhost:8000');

const Cell = ({col, row, value}) => {
  const fillCell = () => {
    socket.emit('fillCell', row, col, 1);
  }

  return(
    <button 
      key={col} 
      className={value === 0 ? 'cell cellEmpty' : 'cell cellFull' }
      onClick={fillCell}
    >{value}</button>
  );
}

const Table = ({world}) => {
  const createTable = () => {
    let rowId = 0;
    const table = [];
    for(let row = 0; row < world.size; row++) {
      let cols = [];
      let cellId = 0;
      for(let col = 0; col < world.size; col++) {
        cols.push(<Cell key={cellId} col={cellId} row={rowId} value={world.grid[row][col]} />);
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

  useEffect(() => {
    const updateGridTimer = setInterval(() => {
      socket.emit('getWorld', (newWorld) => {
        setWorld(newWorld);
      });
    }, 1000);

    socket.on('worldUpdate', (newWorld) => {
      setWorld(newWorld);
    });

    return(() => {
      clearInterval(updateGridTimer);
    });
  });

  return (
    <div className='App'>
      <Table world={world} />
    </div>
  );
}

export default App;
