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
class gridModel 
{
	constructor(canvasModel, size, blocksPerSide) 
    {
		this.canvas = canvasModel;
		this.size = size;
		this.x = (canvasModel.width - size) / 2;
		this.y = (canvasModel.height - size) / 2;
		this.blocksPerSide = blocksPerSide;
        this.blockSize = size / blocksPerSide;
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
	
	setSize(n)
    {
        if(n > Math.max(this.canvas.width,this.canvas.height)) {
            new console.error("Cannot set grid size bigger than canvas.");
            return;
        }
		this.size = n;
		this.x = (this.canvas.width - n) / 2;
		this.y = (this.canvas.height - n) / 2;
		this.blockSize = n / this.blocksPerSide;
	}
	
	setBlocksPerSide(n)
    {
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


//Mode variable
var currentMode = "Draw";          //Draw = enables user to draw
                                   //Move = enables mover to pan image around screen
//Draw variables
var colorSelect = "rgb(0,0,0)";		//Initially, black is colorSelect
var prevMousePosition = [-1,-1];

//Move variables
var prevMouseCoords = [0, 0];   //Actually fraction based on size of canvas (so 0 - 1 range)
var xOffset = 0;
var yOffset = 0;
var moveSpeed = 0.5;
var maxSpeed = 150;


//this is the very first function executed by the script
function setup() 
{
    //initialize models
    canvas = new canvasModel(1280,800);
    grid = new gridModel(canvas, 300, 10);

    //draw canvas
    createCanvas(canvas.width, canvas.height);
    background(200);

    //create functional buttons
    let buttonX = 20;
    let buttonY = 20;

    zoomInButton = createButton("Zoom In");
    zoomInButton.position(buttonX, buttonY + 50);
    zoomInButton.mousePressed(zoomInPressed);

    zoomOutButton = createButton("Zoom Out");
    zoomOutButton.position(buttonX, buttonY + 100);
    zoomOutButton.mousePressed(zoomOutPressed);

    clearButton = createButton("Clear");
    clearButton.position(buttonX, buttonY + 150);
    clearButton.mousePressed(clearPressed); 

    drawButton = createButton("Draw");
    drawButton.position(buttonX, buttonY + 200);
    drawButton.mousePressed(DrawPressed); 

    moveButton = createButton("Move");
    moveButton.position(buttonX, buttonY + 250);
    moveButton.mousePressed(MovePressed); 

    centerButton = createButton("Center");
    centerButton.position(buttonX, buttonY + 300);
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
    for(let i = 0; i < grid.blocksPerSide; i++)
    {
        for(let j = 0; j < grid.blocksPerSide; j++)
        {
            fill(grid.colors[i][j]);

            //DO NOT USE square(), it may cause some unknown bugs.
            rect(grid.x + i * grid.blockSize + xOffset, grid.y + j * grid.blockSize + yOffset, grid.blockSize , grid.blockSize);
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
function whenMouseDraggedOrPressed(isPressed)
{
    if(currentMode == "Draw")
    {
        let x = Math.floor((mouseX - grid.x - xOffset)/grid.blockSize);
        let y = Math.floor((mouseY - grid.y - yOffset)/grid.blockSize);

        //if the mouse is dragging in a small range within one same block, do nothing
        if ((prevMousePosition[0] == x && prevMousePosition[1] == y) && !isPressed) return;

        prevMousePosition = [x,y];

        if (x < 0 || x >=  grid.blocksPerSide || y < 0 || y>= grid.blocksPerSide) return;
    
        grid.colors[x][y]  = colorSelect;   
    }

    if(currentMode == "Move")
    {
        xDiff = (mouseX - prevMouseCoords[0]);
        yDiff = (mouseY - prevMouseCoords[1]);

        prevMouseCoords = [mouseX, mouseY];

        if ((xDiff == 0 && yDiff == 0) || isPressed) return;

        //MOVE X
        addSpeed = moveSpeed * xDiff;
        if(addSpeed > maxSpeed)
        {
            addSpeed = maxSpeed;
        }
        if(addSpeed < -maxSpeed)
        {
            addSpeed = -maxSpeed;
        }

        xOffset += addSpeed; 
        
        //CHECK X BOUNDARIES
        if(xOffset < ((-canvas.width / 2) + (grid.size / 2)) )
        {
            xOffset = (-canvas.width / 2) + (grid.size / 2);
        }

        if(xOffset > ((canvas.width / 2) - (grid.size / 2)) )
        {
            xOffset = (canvas.width / 2) - (grid.size / 2);
        }
        
        //MOVE Y
        addSpeed = moveSpeed * yDiff;
        if(addSpeed > maxSpeed)
        {
            addSpeed = maxSpeed;
        }
        if(addSpeed < -maxSpeed)
        {
            addSpeed = -maxSpeed;
        }

        yOffset += addSpeed;

        //CHECK Y BOUNDARIES
        if(yOffset < ((-canvas.height / 2) + (grid.size / 2)) )
        {
            yOffset = (-canvas.height / 2) + (grid.size / 2);
        }

        if(yOffset > ((canvas.height / 2) - (grid.size / 2)) )
        {
            yOffset = (canvas.height / 2) - (grid.size / 2);
        }
    }

    redraw();
}

//execute when zoomInButton pressed
function zoomInPressed()
{
    grid.setSize(grid.size*1.1);
    redraw();
}

//execute when zommOutButton pressed
function zoomOutPressed()
{
    grid.setSize(grid.size/1.1);
    redraw();    
}

//On scroll wheel
document.onwheel = function(event)
{
    var y = event.deltaY;

    //Zoom in
    if(y == -100)
    {
        grid.setSize(grid.size*1.1);
        redraw();  
    }

    //Zoom out
    if(y == 100)
    {
        grid.setSize(grid.size/1.1);
        redraw();  
    }
}

//execute when clearButton pressed
function clearPressed()
{
    grid.colors = grid.newColors();
    redraw();
}

function DrawPressed()
{
    currentMode = "Draw";
}

function MovePressed()
{
    currentMode = "Move";
}

function CenterPressed()
{
    xOffset = 0;
    yOffset = 0;
    redraw();
}

//Set whatever color was picked to new color
$('#color-picker').on('input', function () 
{
    colorSelect = this.value;
});