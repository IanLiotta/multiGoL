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
                colArr.push(0);
            }
            this.grid.push(colArr);
        }
    }
}

let world = new World(6);
const clearTimer = setInterval(() => {
    world = new World(6);
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

io.set('origins', '*:*');

io.on('connection', (socket) => {
    console.log('A client connected.');
    const colorPicker = Math.floor(Math.random() * 7);
    const color = colorChart[colorPicker];
    console.log('Adding new user ', socket.id, color);
    socket.emit('newUser', color);

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