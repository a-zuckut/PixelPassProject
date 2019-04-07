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

//Project class contains an array of gridModel objects (one for each user)
class projectModel
{
	constructor(canvasModelProject, gridSize, gridBlocksPerSide, maxUsers, maxUsersPerRow)
	{
		//Set variables to help create grids
		this.canvas = canvasModelProject;
		this.gridSize = gridSize;
		this.gridBlocksPerSide = gridBlocksPerSide;

		//Variables for project
		this.maxUsers = maxUsers;
		this.offset = this.gridSize;
		this.maxUsersPerRow = maxUsersPerRow;

		//Needs to be called last
		this.grids = this.newGrids();
	}

	newGrids()
	{
		let grids = [];

		let columnCount = 0;
		let rowCount = 0;

		let currentID = 0;		//Should increment with each grid, and tie to a specific user

		for (let i = 0; i < this.maxUsers; i++)
		{
			grids.push( new gridModel(this.canvas, this.gridSize, this.gridBlocksPerSide, currentID) );

			//We are "out of bounds", reset columns and increment row
			if(columnCount > this.maxUsersPerRow - 1)
			{
				rowCount = rowCount + 1;
				columnCount = 0; 	//Reset this
			}

			//Keep a constant offset
			grids[i].offset[0] = this.gridSize * columnCount;
			grids[i].offset[1] = this.gridSize * rowCount;

			//This offset should always be integers, for access only
			grids[i].offsetBase[0] = grids[i].offset[0];
			grids[i].offsetBase[1] = grids[i].offset[1];

			//Assign starting x and y
			grids[i].x = grids[i].x + grids[i].offset[0];
			grids[i].y = grids[i].y + grids[i].offset[1];

			//Assign starting x and y
			//grids[i].x = grids[i].x + (this.gridSize * columnCount);
			//grids[i].y = grids[i].y + (this.gridSize * rowCount);




			//Increment column as we move right
			columnCount = columnCount + 1;

			//Also increment user ID each time
			currentID = currentID + 1;
		}

		return grids;
	}
}

class gridModel
{
	constructor(canvasModel, size, blocksPerSide, connectedUserID)
    {
				this.canvas = canvasModel;
        this.size = size;

        //x and y is the coordinate of upperleft corner of the grid
        this.x = (canvasModel.width - size) / 2;
				this.y = (canvasModel.height - size) / 2;
				this.blocksPerSide = blocksPerSide;
        this.blockStrokeWeight = 0.5;
				this.colors = this.newColors();


				this.offset = [0, 0];			//This represents displayed offset, includes
				this.offsetBase = [0, 0];		//this remains "normalized" offset, remains
										//constant for read only (DO NOT MODIFY)

				//User ID
				this.connectedUserID = connectedUserID;
				this.user = null;
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

		//Also scale offset with new size
		this.offset[0] = this.offset[0] * n;
		this.offset[1] = this.offset[1] * n;
	}

    setSize(newSize)
    {
        var scale = newSize / this.size;
        this.scale(scale);
    }

	setBlocksPerSide(n)
    {
		this.blocksPerSide = n;
		this.colors = this.newColors();
    }

    transfer(newx, newy)
    {
        this.x = newx + this.offset[0];
        this.y = newy + this.offset[1];
    }



}
//********************************************************* View Controllers *****************************************************

new p5(); // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var canvas;
var project;
var grid;


var projectSize //number of grids per side of a project
var userID; //0 to projectSize^2-1

var zoomInButton;
var zoomOutButton;


var currentCursor;  //"crosshair" for Draw mode
                    //"move" for Move mode
                    //"pointer" for default mode

var defaultSize = 500;
var defaultBlocksPerSide = 8;

//Mode variable
var currentMode = "None";       //Draw = enables user to draw
                                //Move = enables mover to pan image around screen
                                //None = default mode

//Draw variables
var colorSelect = "rgb(0,0,0)";		//Initially, black is colorSelect

//Move variables
var mouseProjectOffset = [0, 0];	//Difference between mouse x and y, and "project" (all grids)

//User identification
var userID = -1;				//Should increment with each user, and tie to a specific grid
							//Corresponds to INDEX of the grid

// User identification for database, first check for existence as cached value,
// then user prompt
var user = null;

var mouseDown = false;

//********************************built-in functions**********************
//this is the very first function executed by the script
var linkWhenSaved = false;

// np: new project to copy into project
// 		(copy variables so that methods still accessible)
function setupProject(np) {
	project.canvas = np.canvasModelProject;
	project.gridSize = np.gridSize;
	project.gridBlocksPerSide = np.gridBlocksPerSide;
	project.maxUsers = np.maxUsers;
	project.maxUsersPerRow = np.maxUsersPerRow;
	for (var i = 0; i < project.grids.length; i++) {
		project.grids[i].size = np.grids[i].size;
		project.grids[i].x = np.grids[i].x;
		project.grids[i].y = np.grids[i].y;
		project.grids[i].blocksPerSide = np.grids[i].blocksPerSide;
		project.grids[i].blockStrokeWeight = np.grids[i].blockStrokeWeight;
		project.grids[i].colors = np.grids[i].colors;
		project.grids[i].connectedUserID = np.grids[i].connectedUserID;
		project.grids[i].user = np.grids[i].user;
	}
}

function setup()
{
    //initialize models
    canvas = new canvasModel(windowWidth,windowHeight);
    project = new projectModel(canvas, defaultSize, defaultBlocksPerSide, 4, 2);
    grid = new gridModel(canvas, defaultSize, defaultBlocksPerSide);
    setCursor("pointer");

    //draw canvas
    createCanvas(canvas.width, canvas.height);
    background(200);

		// user identification
		var isThisNewUser = false;
		user = localStorage['userkey'] || null;
		if (user == null) {
			var input = window.prompt("Please enter your user id if you already have edited this image.","userid");
			if (input == null || input == "") {
				user = generateUID();
				isThisNewUser = true;
			} else {
				user = input;
			}
			localStorage['userkey'] = user;
		}

		console.log("userid: " + user)

    // where we want to check for query paramterss
    var urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get('test');
    var url = [location.protocol, '//', location.host, location.pathname].join('');
    url = url + "/get?test=" + myParam;
    // console.log(url)

    if (myParam != null) {
				linkWhenSaved = url;
				console.log("Get request sending.");
        $.get( url, function( data ) {
						if (data == null) {
							// redirect to location.host
							document.location.href="/";
						}
						linkWhenSaved = url;
						setupProject(data.data)
						console.log("Loaded project: ")
						console.log(project)
						if (isThisNewUser) {
							console.log("New User - Assigning New Grid");
							for (var i = 0; i < project.grids.length; i++) {
								if (project.grids[i].user == null) {
									project.grids[i].user = user;
									userID = i;
									redraw();
									break;
								}
							}
							window.notify("NO SPACE IN BOARD - ERROR");
						} else {
							console.log("Old User - Assigning Previous Grid")
							for (var i = 0; i < project.grids.length; i++) {
								if (project.grids[i].user == user) {
									console.log("Found user: " + user)
									userID = i;
									redraw();
									break;
								}
							}
							if (userID == -1) {
								console.log("Could not find old grid.");
								// NOTIFY USER THAT THEIR ID WAS INVALID AND GIVE THEM NEW BOARD
								window.alert("Invalid user id, assigning new grid.");
								for (var i = 0; i < project.grids.length; i++) {
									if (project.grids[i].user == null) {
										project.grids[i].user = user;
										userID = i;
										redraw();
										break;
									}
								}
								window.notify("NO SPACE IN BOARD - ERROR");
							}
						}
        });
    } else {
			for (var i = 0; i < project.grids.length; i++) {
				if (project.grids[i].user == null) {
					project.grids[i].user = user;
					userID = i;
					redraw();
					break;
				}
			}
		}

		console.log("User: " + userID)

    //create functional buttons
    let buttonX = 20;
    let buttonY = 0;

    //initialize buttons
    logo = createImg("source/logo3.png");
    logo.position(window.width-350,buttonY);
    logo.attribute('title', 'Pixel Pass');

    let saveButton = document.getElementById("save-btn");
    saveButton.addEventListener("click", saveButtonPressed);

    let buttonUndo = document.getElementById("undo-btn");

    zoomInButton = createImg("source/zoomIn.png");
    zoomInButton.position(buttonX, buttonY + 50);
    zoomInButton.mousePressed(zoomInPressed);
    zoomInButton.attribute('title', 'zoom in');

    zoomOutButton = createImg("source/zoomOut.png");
    zoomOutButton.position(buttonX, buttonY + 100);
    zoomOutButton.mousePressed(zoomOutPressed);
    zoomOutButton.attribute('title', 'zoom out');

    clearButton = createImg("source/clear.png");
    clearButton.position(buttonX, buttonY + 200);
    clearButton.mousePressed(clearPressed);
    clearButton.attribute('title', 'clear grid');

    drawButton = createImg("source/draw.png");
    drawButton.position(buttonX, buttonY + 250);
    drawButton.mousePressed(DrawPressed);
    drawButton.attribute('title', 'draw');

    moveButton = createImg("source/move.png");
    moveButton.position(buttonX, buttonY + 350);
    moveButton.mousePressed(MovePressed);
    moveButton.attribute('title', 'move grid');

    centerButton = createImg("source/center.png");
    centerButton.position(buttonX, buttonY + 400);
    centerButton.mousePressed(CenterPressed);
    centerButton.attribute('title', 'center');

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

	for(let i = 0; i < project.maxUsers; i++)
    {
			stroke(51);//color in grayscale of lines delimiting blocks.
			strokeWeight(project.grids[i].blockStrokeWeight);//set line weight

	    //draw individual blocks
	    var blockSize = project.grids[i].size / project.grids[i].blocksPerSide;

	    //draw only blocks within the canvas
	    function adjustIndex(index)
	    {
	        if(index < 0) return 0;

	        if(index >= project.grids[i].blocksPerSide) return project.grids[i].blocksPerSide-1;
	        return index;
	    }

	    var drawIndexUpperLeftX = adjustIndex(Math.floor(-project.grids[i].x / blockSize));
	    var drawIndexUpperLeftY = adjustIndex(Math.floor(-project.grids[i].y / blockSize));
	    var drawIndexBottomRightX = adjustIndex(Math.floor((canvas.width-project.grids[i].x) / blockSize));
	    var drawIndexBottomRightY = adjustIndex(Math.floor((canvas.height-project.grids[i].y) / blockSize));

	    for(let k = drawIndexUpperLeftX; k <= drawIndexBottomRightX; k++)
	    {
	        for(let j = drawIndexUpperLeftY; j <= drawIndexBottomRightY; j++)
	        {
	            fill(project.grids[i].colors[k][j]);

	            //DO NOT USE square(), it may cause some unknown bugs.
	            rect(project.grids[i].x + k * blockSize, project.grids[i].y + j * blockSize, blockSize , blockSize);
	        }
	    }
    }


    ////////////////////////// At very end, redo the draw for "OUR GRID" only //////////////////////////
		if (userID == -1) return;

    stroke(0);
		strokeWeight(15 * project.grids[userID].blockStrokeWeight);

    //draw individual blocks
    var blockSize = project.grids[userID].size / project.grids[userID].blocksPerSide;

    //draw only blocks within the canvas
    function adjustIndex(index)
    {
        if(index < 0) return 0;

        if(index >= project.grids[userID].blocksPerSide) return project.grids[userID].blocksPerSide-1;
        return index;
    }

    var drawIndexUpperLeftX = adjustIndex(Math.floor(-project.grids[userID].x / blockSize));
    var drawIndexUpperLeftY = adjustIndex(Math.floor(-project.grids[userID].y / blockSize));
    var drawIndexBottomRightX = adjustIndex(Math.floor((canvas.width-project.grids[userID].x) / blockSize));
    var drawIndexBottomRightY = adjustIndex(Math.floor((canvas.height-project.grids[userID].y) / blockSize));

    //Create a bold outline
    rect(project.grids[userID].x, project.grids[userID].y, blockSize * 8, blockSize * 8);

    //Reset to thinner lines
    stroke(51);
	strokeWeight(project.grids[userID].blockStrokeWeight);

    for(let k = drawIndexUpperLeftX; k <= drawIndexBottomRightX; k++)
    {
        for(let j = drawIndexUpperLeftY; j <= drawIndexBottomRightY; j++)
        {
            fill(project.grids[userID].colors[k][j]);

            //DO NOT USE square(), it may cause some unknown bugs.
            rect(project.grids[userID].x + k * blockSize, project.grids[userID].y + j * blockSize, blockSize , blockSize);
        }
    }
}

//when mouse is pressed down and moving
//DO NOT CHANGE THIS NAME
function mouseDragged()
{
    if (currentMode == "Draw") drawOnGrid();

    if(currentMode == "Move")
    {
    	for(let i = 0; i < project.maxUsers; i++)
    	{
    		project.grids[i].transfer(mouseX + mouseProjectOffset[0], mouseY + mouseProjectOffset[1]);
    	}

        redraw();
    }
}

//when mouse is pressed
//DO NOT CHANGE THIS NAME
function mousePressed()
{
	//Only need this in terms of absolute center (grid[0])
	mouseProjectOffset = [project.grids[0].x - mouseX, project.grids[0].y - mouseY];

	for(let i = 0; i < project.maxUsers; i++)
    {
		//project.grids[i].offset = [project.grids[i].x - mouseX, project.grids[i].y - mouseY];
    }

    if (currentMode == "Draw") drawOnGrid();
}

function mouseReleased(){
}

function keyPressed()
{
    if (keyCode === 86)
    { //"v"
        setMode("Move");
    }

    if (keyCode === 66)
    { //"b"
        setMode("Draw");
    }

    if (keyCode == 32)
    { //space
        CenterPressed();
    }
}

//********************************custom functions**********************

function setCursor(mode)
{
    document.body.style.cursor = mode;
    currentCursor = mode;
}

function setMode(mode)
{
    currentMode = mode;
    if(mode == "Draw") setCursor("crosshair");
    if(mode == "Move") setCursor("move");
    if(mode == "None") setCursor("pointer");
}

//paint the block at position mouseX, mouseY colorSelect
function drawOnGrid()
{
	setCursor("crosshair");

	for(let i = 0; i < project.maxUsers; i++)
    {
		//Do not allow drawing on other people's blocks
    	if(userID == project.grids[i].connectedUserID)
    	{
			var blockSize = project.grids[i].size / project.grids[i].blocksPerSide;
		    let x = Math.floor((mouseX - project.grids[i].x) / blockSize);
		    let y = Math.floor((mouseY - project.grids[i].y) / blockSize);
		    if (x < 0 || x >=  project.grids[i].blocksPerSide || y < 0 || y>= project.grids[i].blocksPerSide) continue;
		    project.grids[i].colors[x][y]  = colorSelect;   //update model information

		}
    }

    redraw();
}


//execute when zoomInButton pressed
function zoomInPressed()
{
	for(let i = 0; i < project.maxUsers; i++)
    {
		project.grids[i].scale(1.1);
    }

    redraw();
}

//execute when zommOutButton pressed
function zoomOutPressed()
{
	for(let i = 0; i < project.maxUsers; i++)
    {
		project.grids[i].scale(0.9);
    }

    redraw();
}

//On scroll wheel
document.onwheel = function(event)
{
    var y = event.deltaY;

    //Zoom in
    if(y == -100)
    {
    	for(let i = 0; i < project.maxUsers; i++)
    	{
			project.grids[i].scale(1.1);
    	}

        redraw();
    }

    //Zoom out
    if(y == 100)
    {
    	for(let i = 0; i < project.maxUsers; i++)
    	{
			project.grids[i].scale(0.9);
    	}

        redraw();
    }
}


//execute when clearButton pressed
function clearPressed()
{
    setMode("None");
    if (confirm('Are you sure you want to clear the canvas?'))
    {
    	for(let i = 0; i < project.maxUsers; i++)
    	{
        	project.grids[i].colors = grid.newColors();
    	}

        redraw();
    }

    else
    {
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
	let xCenter = 0;
	let yCenter = 0;

	//First, find the correct grid to center around
	for(let i = 0; i < project.maxUsers; i++)
    {
		project.grids[i].setSize(defaultSize);	//Helps hone in

    	//(CURRENTLY GOES TO TOP LEFT AKA offsetBase = 0, 0)
    	//Center around corresponding grid
    	if(userID == project.grids[i].connectedUserID)
		{


			xCenter = (canvas.width / 2) - project.grids[i].offsetBase[0] - ( project.grids[i].size / 2 );
			yCenter = (canvas.height / 2) - project.grids[i].offsetBase[1] - ( project.grids[i].size / 2 );

			//xCenter = (canvas.width / 2) /*- ( project.grids[i].offsetBase[0] / 2)*/;
			//yCenter = (canvas.height / 2) /*- ( project.grids[i].offsetBase[1] / 2)*/;
		}
	}

	//Then, actually set the values to every grid
	for(let i = 0; i < project.maxUsers; i++)
    {
    	project.grids[i].transfer(xCenter, yCenter);
	    //project.grids[i].setSize(defaultSize);
    }

    //grid.transfer((canvas.width-grid.size)/2, (canvas.height-grid.size)/2)
    //grid.setSize(defaultSize);
    redraw();
}


function colorPicked(jscolor)
{
    colorSelect = jscolor.toRGBString();
}

var save_id;

var getQueryString = function ( field, url ) {
	var href = url ? url : window.location.href;
	var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
	var string = reg.exec(href);
	return string ? string[1] : null;
};

var previous_save = null;

function saveButtonPressed() {
	console.log("Save Button Pressed");
	var n = 0;
	var isNew = false;
	if (linkWhenSaved != false) {
		save_id = getQueryString('test', linkWhenSaved)
	} else {
		isNew = true;
		save_id = generateUID();
		previous_save = Date.now();
	}
	console.log("Save ID for Database: " + save_id + " (isNew: " + isNew + ")");
	var urlS = [location.protocol, '//', location.host, location.pathname].join('');
	if (isNew || save_id == undefined || Date.now() - previous_save > 2000) {
		$.ajax({
			type : "POST",
			contentType : "application/json",
			url : urlS + "/savegrid",
			data : JSON.stringify(
				{
					"new": isNew,
					"user": user,
					"userid": userID,
					"data": {"name": save_id, "data": project}
				}
			),
			dataType : 'json',
			error : function(e) {
				console.log("ERROR: ", e);
			}
		});
		linkWhenSaved = urlS + "?test=" + save_id;
		console.log("Alert to: " + linkWhenSaved);
		window.alert("The link to this page is: " + linkWhenSaved)
	}
}

// alphabet size of 10 + 26 * 2 = 62. 62^8 is a sufficiently large number
var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var UID_LENGTH = 8;

function generateUID(length) {
	var rtn = '';
	  for (var i = 0; i < UID_LENGTH; i++) {
	    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
	  }
	  return rtn;
}
