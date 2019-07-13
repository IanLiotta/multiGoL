import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');
console.log(socket);

const Cell = ({col, row, value, color}) => {
  
  const fillCell = () => {
    socket.emit('fillCell', row, col, color);
  }

  const colorChart = {
    1:'red',
    2:'orange',
    3:'yellow',
    4:'green',
    5:'blue',
    6:'indigo',
    7:'violet'
  }

  const colorValue = colorChart[value];
  

  return(
    <button 
      key={col} 
      className={value === -1 ? 'cell cellEmpty' : `cell ${colorValue}` }
      onMouseOver={fillCell}
    ></button>
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
  const [color, setColor] = useState(-1);

  socket.on('worldUpdate', (newWorld) => {
    setWorld(newWorld);
  });

  socket.on('newUser', (colorIndex) => {
    setColor(colorIndex);
  });

  useEffect(() => {
    socket.on('initalLoad', (newWorld) => {
      setWorld(newWorld);
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