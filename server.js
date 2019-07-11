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

const users = new Map();

io.set('origins', '*:*');

io.on('connection', (socket) => {
    console.log('A client connected.');
    if(!users.get(socket.id)){
        const color = Math.floor(Math.random() * 255);
        console.log('Adding new user ', socket.id, color);
        users.set(socket.id, color);
        socket.emit('newUser', color);
    }

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