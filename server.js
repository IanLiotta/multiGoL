const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

class World {
    constructor(size) {
        this.size = size;
        this.grid = [];
        for(let rows = 0; rows < size; rows++){
            let colArr = [];
            for(let cols = 0; cols < size; cols++){
                colArr.push('');
            }
            this.grid.push(colArr);
        }
    }

    newGrid(size) {
        let newGrid =[]
        for(let rows = 0; rows < size; rows++){
            let colArr = [];
            for(let cols = 0; cols < size; cols++){
                colArr.push('');
            }
            newGrid.push(colArr);
        }
        return newGrid;
    }

    getSubGrid(row, col) {
        const row0 = [
            (this.grid[row-1] && this.grid[row-1][col-1]),
            (this.grid[row-1] && this.grid[row-1][col]),
            (this.grid[row-1] && this.grid[row-1][col+1])
        ];
        const row1 = [
            this.grid[row][col-1],
            //this.grid[row][col],
            this.grid[row][col+1]
        ];
        const row2 = [
            (this.grid[row+1] && this.grid[row+1][col-1]),
            (this.grid[row+1] && this.grid[row+1][col]),
            (this.grid[row+1] && this.grid[row+1][col+1])
        ];
        return [row0, row1, row2];
    }

    grow(){
        let newGrid = this.newGrid(this.size);
        const colorTally = [0,0,0,0,0,0,0];
        for(let row = 0; row < this.size; row++){
            for(let col = 0; col < this.size; col++){
                const neighbors = this.getSubGrid(row, col).reduce((previous, current) =>{
                    return(previous += current.reduce((previous, current) => {
                        return(previous += (current && current !== '') ? 1 : 0);
                    }, 0));
                }, 0);
                if(neighbors === 3) {
                    newGrid[row][col] = 'red';
                }
                else if(neighbors < 2 || neighbors > 3) {
                    newGrid[row][col] = '';
                }
                else {
                    newGrid[row][col] = this.grid[row][col];
                }
            }
        }
        this.grid = newGrid;
    }
}

let world = new World(6);
const clearTimer = setInterval(() => {
    //world = new World(6);
    world.grow();
}, 8000)

const colorChart = {
    0:'red',
    1:'orange',
    2:'yellow',
    3:'green',
    4:'blue',
    5:'indigo',
    6:'violet'
}

io.on('connection', (socket) => {
    console.log('A client connected.');
    const colorPicker = Math.floor(Math.random() * 7);
    const color = colorChart[colorPicker];
    console.log('Adding new user ', socket.id, color);
    socket.emit('newUser', colorPicker);

    socket.on('getWorld', (cb) => {
        cb(world);
    });

    socket.on('fillCell', (row, col, value) => {
        console.log(`Heard fillCell ${row} ${col} ${value}`);
        world.grid[row][col] = value;
        io.emit('worldUpdate', world);
    });
});

const listener = server.listen((process.env.PORT || 8000), () => {
    console.log('listening on port ' + listener.address().port);
});