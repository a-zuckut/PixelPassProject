//****************************** Models *****************************************
class canvasModel {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}


class gridModel {
	constructor(canvasModel, size, blocksPerSide) {
		this.canvas = canvasModel;
		this.size = size;
		this.x = (canvasModel.width - size) / 2;
		this.y = (canvasModel.height - size) / 2;
		this.blocksPerSide = blocksPerSide;
        this.blockSize = size / blocksPerSide;
        this.blockStrokeWeight = 0.5;
		this.colors = this.newColors();
	}

	newColors() {
		let result = [];
		for (let i = 0; i < this.blocksPerSide; i++) {
			let temp = [];
			for (let j = 0; j < this.blocksPerSide; j++) {
				temp.push("rgb(255,255,255)");
			}
			result.push(temp);
		}
		return result;
	}
	
	setSize(n){
        if(n > Math.max(this.canvas.width,this.canvas.height)) {
            new console.error("Cannot set grid size bigger than canvas.");
            return;
        }
		this.size = n;
		this.x = (this.canvas.width - n) / 2;
		this.y = (this.canvas.height - n) / 2;
		this.blockSize = n / this.blocksPerSide;
	}
	
	setBlocksPerSide(n){
		this.blocksPerSide = n;
		this.blockSize = this.size / n;
		this.colors = this.newColors();
	}

}
//****************************** View Controllers *******************************
new p5();
var canvas;
var grid;
var zoomInButton;
var zoomOutButton;

function setup() {
    canvas = new canvasModel(1280,800);
    grid = new gridModel(canvas, 300, 10);
    createCanvas(canvas.width, canvas.height);

    let buttonX = 20;
    let buttonY = 20;
    zoomInButton = createButton("Zoom In");
    zoomInButton.position(buttonX, buttonY);
    zoomInButton.mousePressed(zoomInPressed);

    zoomOutButton = createButton("Zoom Out");
    zoomOutButton.position(buttonX,buttonY + 50);
    zoomOutButton.mousePressed(zoomOutPressed);

    clearButton = createButton("Clear");
    clearButton.position(buttonX,buttonY + 100);
    clearButton.mousePressed(clearPressed); 

    blocksPerSideUpButton = createButton("Blocks per Side Up");
    blocksPerSideUpButton.position(buttonX, buttonY + 150);
    blocksPerSideUpButton.mousePressed(blocksPerSideUpPressed);

    blocksPerSideDownButton = createButton("Blocks per Side Down");
    blocksPerSideDownButton.position(buttonX, buttonY + 200);
    blocksPerSideDownButton.mousePressed(blocksPerSideDownPressed);

    
    noLoop();
}

function draw(){
    background(200);
    stroke(51);
    strokeWeight(grid.blockStrokeWeight);
    for(let i = 0; i < grid.blocksPerSide; i++){
        for(let j = 0; j < grid.blocksPerSide; j++){
            fill(grid.colors[i][j]);
            square(grid.x + i * grid.blockSize, grid.y + j * grid.blockSize, grid.blockSize );
        }
    }
}

function mousePressed(){
    let x = Math.floor((mouseX - grid.x)/grid.blockSize);
    let y = Math.floor((mouseY - grid.y)/grid.blockSize);
    if (x < 0 || x >=  grid.blocksPerSide || y < 0 || y>= grid.blocksPerSide) return;
    if (grid.colors[x][y]  == "rgb(0,0,0)"){
        grid.colors[x][y]  = "rgb(255,255,255)";
    } else{
        grid.colors[x][y]  = "rgb(0,0,0)";
    }
    redraw();
}

function zoomInPressed(){
    grid.setSize(grid.size*1.1);
    redraw();
}

function zoomOutPressed(){
    grid.setSize(grid.size/1.1);
    redraw();
}

function clearPressed(){
    grid.colors = grid.newColors();
    redraw();
}

function blocksPerSideUpPressed(){
    grid.setBlocksPerSide(grid.blocksPerSide+1);
    redraw();
}

function blocksPerSideDownPressed(){
    grid.setBlocksPerSide(grid.blocksPerSide-1);
    redraw();
}