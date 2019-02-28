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

.scale(n) changes the size of the entire grid. 

.setBlocksPerSide(n) changes the number of blocks on one side of the grid. This function would
    reset all other information automatically according to the new number n.
*/
class gridModel 
{
	constructor(canvasModel, size, blocksPerSide) 
    {
		this.canvas = canvasModel;
        this.size = size;
        
        //x and y is the coordinate of upperleft corner of the grid
        this.x = (canvasModel.width - size) / 2;
		this.y = (canvasModel.height - size) / 2;
		this.blocksPerSide = blocksPerSide;
        this.blockStrokeWeight = 0.5;
		this.colors = this.newColors();
	}

	newColors() 
    {
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
	
	scale(n)
    {
        this.size *= n;
		this.x = n * this.x + (1-n) * canvas.width/2;
		this.y = n * this.y + (1-n) * canvas.height/2;
	}
    
    setSize(newSize){
        var scale = newSize / this.size;
        this.scale(scale);
    }
    
	setBlocksPerSide(n)
    {
		this.blocksPerSide = n;
		this.colors = this.newColors();
    }
    
    transfer(newx, newy){
        this.x = newx;
        this.y = newy;
    }



}
//********************************************************* View Controllers *****************************************************


new p5(); // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var canvas;
var grid;
var zoomInButton;
var zoomOutButton;

var currentCursor;  //"crosshair" for Draw mode
                    //"move" for Move mode  
                    //"pointer" for default mode

var defaultSize = 300;
var defaultBlocksPerSide = 8;

//Mode variable
var currentMode = "None";       //Draw = enables user to draw
                                //Move = enables mover to pan image around screen
                                //None = default mode

//Draw variables
var colorSelect = "rgb(0,0,0)";		//Initially, black is colorSelect

//Move variables
var offset = [0,0]; // offset = [mouseX, mouseY] - [gridModel.x, gridModel.y]


var mouseDown = false;

//********************************built-in functions**********************
//this is the very first function executed by the script


function a(){
    
}
function setup() 
{
    
    //initialize models
    canvas = new canvasModel(windowWidth,windowHeight);
    grid = new gridModel(canvas, defaultSize, defaultBlocksPerSide);
    setCursor("pointer");

    //draw canvas
    createCanvas(canvas.width, canvas.height);
    background(200);

    //create functional buttons
    let buttonX = 20;
    let buttonY = 0;

    //initialize buttons 
    logo = createImg("source/logo3.png");
    logo.position(window.width-350,buttonY);

    zoomInButton = createImg("source/zoomIn.png");
    zoomInButton.position(buttonX, buttonY + 50);
    zoomInButton.mousePressed(zoomInPressed);

    zoomOutButton = createImg("source/zoomOut.png");
    zoomOutButton.position(buttonX, buttonY + 100);
    zoomOutButton.mousePressed(zoomOutPressed);

    clearButton = createImg("source/clear.png");
    clearButton.position(buttonX, buttonY + 200);
    clearButton.mousePressed(clearPressed); 

    drawButton = createImg("source/draw.png");
    drawButton.position(buttonX, buttonY + 250);
    drawButton.mousePressed(DrawPressed); 

    moveButton = createImg("source/move.png");
    moveButton.position(buttonX, buttonY + 350);
    moveButton.mousePressed(MovePressed); 

    centerButton = createImg("source/center.png");
    centerButton.position(buttonX, buttonY + 400);
    centerButton.mousePressed(CenterPressed); 

   
    /*
    If you delete 'noLoop();', the script would automatically execute draw() indefinately.
    With 'noLoop();', draw() would be excecuted only once, after setup() and everytime you call redraw()
    */
    noLoop();
}

//draw everything -- all the blocks.
//DO NOT CHANGE THIS NAME
function draw()
{
    //Get rid of previous artifacts in drawing
    clear(draw);

    //Set background to gray color (stands out)
    background(200);

    stroke(51);//color in grayscale of lines delimiting blocks.
    strokeWeight(grid.blockStrokeWeight);//set line weight

    //draw blocks
    var blockSize = grid.size / grid.blocksPerSide;
    for(let i = 0; i < grid.blocksPerSide; i++)
    {
        for(let j = 0; j < grid.blocksPerSide; j++)
        {
            fill(grid.colors[i][j]);
            //DO NOT USE square(), it may cause some unknown bugs.
            rect(grid.x + i * blockSize, grid.y + j * blockSize, blockSize , blockSize);
        }
    }
}

//when mouse is pressed down and moving
//DO NOT CHANGE THIS NAME
function mouseDragged(){
    if (currentMode == "Draw") drawOnGrid();

    if(currentMode == "Move") {
        grid.transfer(mouseX+offset[0],mouseY+offset[1]);
        redraw();
    }
}

//when mouse is pressed
//DO NOT CHANGE THIS NAME
function mousePressed(){
    offset = [grid.x-mouseX, grid.y-mouseY];
    if (currentMode == "Draw") drawOnGrid();
}

function mouseReleased(){
}

function keyPressed(){
    if (keyCode === 86){ //"v"
        setMode("Move");
    }
    if (keyCode === 66){ //"b"
        setMode("Draw");
    }
    if (keyCode == 32){//space
        CenterPressed();
    }
}

//********************************custom functions**********************

function setCursor(mode){
    document.body.style.cursor = mode;
    currentCursor = mode;
}

function setMode(mode){
    currentMode = mode;
    if(mode == "Draw") setCursor("crosshair");
    if(mode == "Move") setCursor("move");
    if(mode == "None") setCursor("pointer");
}

//paint the block at position mouseX, mouseY colorSelect
function drawOnGrid(){
    setCursor("crosshair");
    var blockSize = grid.size/ grid.blocksPerSide;
    let x = Math.floor((mouseX - grid.x)/blockSize);
    let y = Math.floor((mouseY - grid.y)/blockSize);
    if (x < 0 || x >=  grid.blocksPerSide || y < 0 || y>= grid.blocksPerSide) return;
    grid.colors[x][y]  = colorSelect;   //update model information
    redraw(); 
}


//execute when zoomInButton pressed
function zoomInPressed()
{
    grid.scale(1.1);
    redraw();
}

//execute when zommOutButton pressed
function zoomOutPressed()
{
    grid.scale(0.9);
    redraw();    
}

//On scroll wheel
document.onwheel = function(event)
{
    var y = event.deltaY;

    //Zoom in
    if(y == -100)
    {
        grid.scale(1.1);
        redraw();  
    }

    //Zoom out
    if(y == 100)
    {
        grid.scale(0.9);
        redraw();  
    }
}


//execute when clearButton pressed
function clearPressed()
{
    setMode("None");
    if (confirm('Are you sure you want to clear the canvas?')) {
        grid.colors = grid.newColors();
        redraw();
    } else {
        // Do nothing!
    }
    
}

function DrawPressed()
{
    setMode("Draw");
}

function MovePressed()
{
    setMode("Move");
}

function CenterPressed()
{
    grid.transfer((canvas.width-grid.size)/2, (canvas.height-grid.size)/2)
    grid.setSize(defaultSize);
    redraw();
}


function colorPicked(jscolor){
    colorSelect = jscolor.toRGBString();
}