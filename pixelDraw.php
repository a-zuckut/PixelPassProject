//****************************** Models *****************************************

/*
model for p5Canvas
.width and .height are width and heigth of the p5Canvas
*/
class p5CanvasModel {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}

/*
model for drawing grid, you create it by giving a p5Canvas model, a size in pixel unit
    and a number for how many blocks on a side.

.p5Canvas is the current p5Canvas model.

.size is the size of the whole grid in pixel unit.

.x and .y is the pixel coordinate of the upper-left corner of the entire grid.

.blocksPerSide is the number of blocks on one side of the gird.

.blockSize is the size of one block in pixel unit.

.blockStrokeWeight is the weight of lines delimitting each blockes.

.pixels is a 2d string list recording rgb colors of all blocks.
    .pixels[0][0] = "rgb(0,0,0)";  ==> set the first block on the first line to black.

.newPixels() returns a white grid according to current .blocksPerSide

.setSize(n) changes the size of the entire grid. This function would reset all other information
    automatically according to the new size n.

.setBlocksPerSide(n) changes the number of blocks on one side of the grid. This function would
    reset all other information automatically according to the new number n.
*/
class gridModel {
	constructor(p5CanvasModel, size, blocksPerSideOrPixels) {
		this.p5Canvas = p5CanvasModel;
		this.size = size;
		this.x = (p5CanvasModel.width - size) / 2;
        this.y = (p5CanvasModel.height - size) / 2;
        if (typeof(blocksPerSideOrCanvas)=="number"){
            this.blocksPerSide = blocksPerSideOrCanvas;
            this.pixels = this.newPixels();
        } else {
            this.blocksPerSide = blocksPerSideOrPixels.length;
            this.pixels = blocksPerSideOrPixels;
        }
        this.blockSize = size / this.blocksPerSide;
        this.blockStrokeWeight = 0.5;
	}

	newPixels() {
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

    pixelsToString(){
        var temp = [];
        for(let i = 0; i<this.pixels.length; i++){
            temp.push( this.pixels[i].map(foo => foo.substring(3)).join(";") );
        }
        return temp.join(".")
    }

	setSize(n){
        if(n > Math.max(this.p5Canvas.width,this.p5Canvas.height)) {
            new console.error("Cannot set grid size bigger than p5Canvas.");
            return;
        }
		this.size = n;
		this.x = (this.p5Canvas.width - n) / 2;
		this.y = (this.p5Canvas.height - n) / 2;
		this.blockSize = n / this.blocksPerSide;
	}

	setBlocksPerSide(n){
		this.blocksPerSide = n;
		this.blockSize = this.size / n;
		this.pixels = this.newPixels();
	}

}
//****************************** View Controllers *******************************
new p5(); // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var pixels = [];
var p5Canvas;
var grid;
var zoomInButton;
var zoomOutButton;
var prevMousePosition = [-1,-1];

//this is the very first function executed by the script
function setup() {

    if(longText != ""){
        var rowsInPixels = longText.split(".");
        for(let i = 0; i<rowsInPixels.length; i++){
            let temp = rowsInPixels[i];
            if(temp=="") continue;
            temp = temp.split(";");
            temp = temp.map(foo => "rgb"+foo);
            pixels.push(temp);
        }
    }

    //initialize models
    p5Canvas = new p5CanvasModel(windowWidth,windowHeight);
    if(pixels.length==0) grid = new gridModel(p5Canvas, 300, 10);
    else grid = new gridModel(p5Canvas, 300, pixels);

    //draw p5Canvas
    createCanvas(p5Canvas.width, p5Canvas.height);

    //create functional buttons
    let buttonX = 20;
    let buttonY = 200;
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

    /*
    If you delete 'noLoop();', the script would automatically execute draw() indefinately.
    With 'noLoop();', draw() would be excecuted only once, after setup() and everytime you call redraw()
    */
    noLoop();
}

//draw everything -- all the blocks.
//DO NOT CHANGE THIS NAME
function draw(){
    clear(); //clear all blocks drew previously
    background(200);
    stroke(51);//color in grayscale of lines delimiting blocks.
    strokeWeight(grid.blockStrokeWeight);//set line weight
    //draw blocks
    for(let i = 0; i < grid.blocksPerSide; i++){
        for(let j = 0; j < grid.blocksPerSide; j++){
            fill(grid.pixels[i][j]);
            //DO NOT USE square(), it may cause some unknown bugs.
            rect(grid.x + i * grid.blockSize, grid.y + j * grid.blockSize, grid.blockSize , grid.blockSize);
        }
    }
}

//when mouse is pressed down and moving
//DO NOT CHANGE THIS NAME
function mouseDragged(){
    whenMouseDraggedOrPressed(false);
}

//when mouse is pressed
//DO NOT CHANGE THIS NAME
function mousePressed(){
    whenMouseDraggedOrPressed(true);
}

//change the color of blocks if mouse is either pressed down or dragging
//      specifically from black to white or from white to black
function whenMouseDraggedOrPressed(isPressed){
    let x = Math.floor((mouseX - grid.x)/grid.blockSize);
    let y = Math.floor((mouseY - grid.y)/grid.blockSize);
    //if the mouse is dragging in a small range within one same block, do nothing
    if ((prevMousePosition[0] == x && prevMousePosition[1] == y) && !isPressed) return;
    prevMousePosition = [x,y];
    if (x < 0 || x >=  grid.blocksPerSide || y < 0 || y>= grid.blocksPerSide) return;
    if (grid.pixels[x][y]  == "rgb(0,0,0)"){
        grid.pixels[x][y]  = "rgb(255,255,255)";
    } else{
        grid.pixels[x][y]  = "rgb(0,0,0)";
    }
    redraw();
    document.getElementById("test").innerHTML = grid.pixelsToString();
}

//execute when zoomInButton pressed
function zoomInPressed(){
    grid.setSize(grid.size*1.1);
    redraw();
}

//execute when zommOutButton pressed
function zoomOutPressed(){
    grid.setSize(grid.size/1.1);
    redraw();
}

//execute when clearButton pressed
function clearPressed(){
    grid.pixels = grid.newPixels();
    redraw();
}

//execute when blocksPerSideUp button pressed
function blocksPerSideUpPressed(){
    grid.setBlocksPerSide(grid.blocksPerSide+1);
    redraw();
}

//execute when blocksPerSideDown button pressed
function blocksPerSideDownPressed(){
    if (grid.blocksPerSide <= 1) return;
    grid.setBlocksPerSide(grid.blocksPerSide-1);
    redraw();
}




/*

Canvas was meant to be a constant and everything further like the gridModel, the 
position of the gridModel etc. was based on the constant p5Canvas. So if you'd like to make some
changes to the p5Canvas, make sure all data releates to it being updated properly!
                                                                                -- Elvin
*/
function windowResized() {
//   if (fullscreen()) {
//     resizeCanvas(displayWidth, displayHeight);
//   } else {
//     resizeCanvas(windowWidth,windowHeight);
//   }
 	redraw();
}
