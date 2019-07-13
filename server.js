const io = require('socket.io')();

class World {
    constructor(size) {
        this.size = size;
        this.grid = this.newGrid(size);
    }

    newGrid(size) {
        let newGrid =[]
        for(let rows = 0; rows < size; rows++){
            let colArr = [];
            for(let cols = 0; cols < size; cols++){
                colArr.push(-1);
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
        for(let row = 0; row < this.size; row++){
            for(let col = 0; col < this.size; col++){
                const colorTally = [0,0,0,0,0,0,0];
                const neighbors = this.getSubGrid(row, col).reduce((previous, current) =>{
                    return(previous += current.reduce((previous, current) => {
                        if(current && current !== -1) {colorTally[current]++;}
                        return(previous += (current && current !== -1) ? 1 : 0);
                    }, 0));
                }, 0);
                let newColor = 1;
                colorTally.reduce((mostFreq, current, index) => {
                    if (current > mostFreq) {newColor = index}
                    return (current > mostFreq ? current : mostFreq);
                }, 0);
                if(neighbors === 3) {
                    newGrid[row][col] = newColor;
                }
                else if(neighbors < 2 || neighbors > 3) {
                    newGrid[row][col] = -1;
                }
                else {
                    newGrid[row][col] = this.grid[row][col];
                }
            }
        }
        this.grid = newGrid;
    }
}

let world = new World(32);
const growTimer = setInterval(() => {
    world.grow();
    io.emit('worldUpdate', world);
}, 1000)

const colorChart = {
    1:'red',
    2:'orange',
    3:'yellow',
    4:'green',
    5:'blue',
    6:'indigo',
    7:'violet'
}

let lastColor = 0;

io.on('connection', (socket) => {
    console.log('A client connected.');
    lastColor = ((lastColor < 7) ? ++lastColor : 1);
    const color = colorChart[lastColor];
    console.log('Adding new user ', socket.id, color);
    socket.emit('newUser', lastColor);
    socket.emit('initalLoad', world);

    socket.on('getWorld', (cb) => {
        cb(world);
    });

    socket.on('fillCell', (row, col, value) => {
        console.log(`Heard fillCell ${row} ${col} ${value}`);
        world.grid[row][col] = value;
        io.emit('worldUpdate', world);
    });
});

io.listen(3001);
console.log(`listening on port 3001`);