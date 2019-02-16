//****************************** Models *****************************************

/*
model for canvas
.width and .height are width and heigth of the canvas
*/
class canvasModel {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}

/*
model for drawing grid, you create it by giving a canvas model, a size in pixel unit
    and a number for how many blocks on a side.

.canvas is the current canvas model.

.size is the size of the whole grid in pixel unit.

.x and .y is the pixel coordinate of the upper-left corner of the entire grid.

.blocksPerSide is the number of blocks on one side of the gird.

.blockSize is the size of one block in pixel unit.

.blockStrokeWeight is the weight of lines delimitting each blockes.

.colors is a 2d string list recording rgb colors of all blocks.
    .colors[0][0] = "rgb(0,0,0)";  ==> set the first block on the first line to black.

.newColors() returns a white grid according to current .blocksPerSide

.setSize(n) changes the size of the entire grid. This function would reset all other information
    automatically according to the new size n.

.setBlocksPerSide(n) changes the number of blocks on one side of the grid. This function would
    reset all other information automatically according to the new number n.
*/
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
new p5(); // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var canvas;
var grid;
var zoomInButton;
var zoomOutButton;
var prevMousePosition = [-1,-1];

//this is the very first function executed by the script
function setup() {
    //initialize models
    canvas = new canvasModel(windowWidth,windowHeight);
    grid = new gridModel(canvas, 300, 10);

    //draw canvas
    createCanvas(canvas.width, canvas.height);

    //create functional buttons
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

		saveButton = createButton("Save");
		saveButton.position(buttonX, buttonY + 250);
    saveButton.mousePressed(saveButtonPressed);

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
            fill(grid.colors[i][j]);
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
    if (grid.colors[x][y]  == "rgb(0,0,0)"){
        grid.colors[x][y]  = "rgb(255,255,255)";
    } else{
        grid.colors[x][y]  = "rgb(0,0,0)";
    }
    redraw();
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
    grid.colors = grid.newColors();
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

var saveTime;
function saveButtonPressed() {
	console.log("Save Button Pressed");
	var d = new Date();
	var n = d.getTime();
	console.log(saveTime);
	if (saveTime == undefined || n - saveTime > 1000) {
		saveTime = n;
		console.log(JSON.stringify(grid.colors));
		$.ajax({
			type : "POST",
			contentType : "application/json",
			url : window.location + "/savegrid",
			data : JSON.stringify(grid.colors),
			dataType : 'json',
			error : function(e) {
				alert("Error!")
				console.log("ERROR: ", e);
			}
		});
	}
}


/*

Canvas was meant to be a constant and everything further like the gridModel, the
position of the gridModel etc. was based on the constant canvas. So if you'd like to make some
changes to the canvas, make sure all data releates to it being updated properly!
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
