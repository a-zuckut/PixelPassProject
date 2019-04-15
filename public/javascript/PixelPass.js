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
.model for drawing grid, you create it by giving a canvas model, a size in pixel unit
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
class projectModel {
  constructor(canvasModelProject, gridSize, gridBlocksPerSide, maxUsers, maxUsersPerRow) {
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

  newGrids() {
    let grids = [];

    let columnCount = 0;
    let rowCount = 0;

    let currentID = 0;    //Should increment with each grid, and tie to a specific user

    for (let i = 0; i < this.maxUsers; i++) {
      grids.push( new gridModel(this.canvas, this.gridSize, this.gridBlocksPerSide, currentID) );

      //We are "out of bounds", reset columns and increment row
      if(columnCount > this.maxUsersPerRow - 1) {
        rowCount = rowCount + 1;
        columnCount = 0;   //Reset this
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

      //Increment column as we move right
      columnCount = columnCount + 1;

      //Also increment user ID each time
      currentID = currentID + 1;
    }

    return grids;
  }
}

class gridModel {
  constructor(canvasModel, size, blocksPerSide, connectedUserID) {
    this.canvas = canvasModel;
    this.size = size;

    //x and y is the coordinate of upperleft corner of the grid
    this.x = (canvasModel.width - size) / 2;
    this.y = (canvasModel.height - size) / 2;
    this.blocksPerSide = blocksPerSide;
    this.blockStrokeWeight = 0.5;
    this.colors = this.newColors();


    this.offset = [0, 0];      //This represents displayed offset, includes
    this.offsetBase = [0, 0];    //this remains "normalized" offset, remains
                //constant for read only (DO NOT MODIFY)

    //User ID
    this.connectedUserID = connectedUserID;
    this.user = null;
  }

  newColors() {
    let result = [];
    for (let i = 0; i < this.blocksPerSide; i++) {
      let temp = Array(this.blocksPerSide).fill("rgb(255,255,255)");
      result.push(temp);
    }
    return result;
  }

  scale(n) {
    this.size *= n;
    this.x = n * this.x + (1-n) * canvas.width/2;
    this.y = n * this.y + (1-n) * canvas.height/2;

    //Also scale offset with new size
    this.offset[0] = this.offset[0] * n;
    this.offset[1] = this.offset[1] * n;
  }

  setSize(newSize) {
    let scale = newSize / this.size;
    this.scale(scale);
  }

  setBlocksPerSide(n) {
    this.blocksPerSide = n;
    this.colors = this.newColors();
  }

  transfer(newx, newy) {
    this.x = newx + this.offset[0];
    this.y = newy + this.offset[1];
  }
}
//****************************** End Models *****************************************

//****************************** View Controllers *****************************************

new p5(); // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var canvas;
var project;
var grid;

var projectSize; //number of grids per side of a project
var userID; //0 to projectSize^2-1

var zoomInButton;
var zoomOutButton;

var currentCursor;  //"crosshair" for Draw mode
                    //"move" for Move mode
                    //"pointer" for default mode

var defaultSize = 500;        // Size of canvas
var defaultBlocksPerSide = 8; // Number of pixels per side

// default value is 2 making a 2x2 square with 4 max users
var users_per_side = 2;

//Mode variable
var currentMode = "None";       //Draw = enables user to draw
                                //Move = enables mover to pan image around screen
                                //None = default mode
                                //Erase = erase

//Draw variables
var colorSelect = "rgb(0,0,0)";    //Initially, black is colorSelect

//Move variables
var mouseProjectOffset = [0, 0];  //Difference between mouse x and y, and "project" (all grids)

//User identification
var userID = -1;        //Should increment with each user, and tie to a specific grid
              //Corresponds to INDEX of the grid

// User identification for database, first check for existence as cached value,
// then user prompt
var user = null;

// Boolean to check if mouse is down
var mouseDown = false;

// Text fields that will be set as data becomes avaliable
var user_textfield = null;
var link_textfield = null;

// Boolean to check if webpage data has loaded
var start = false;

var linkWhenSaved = false;
var previous_save = null;
var save_id;

//********************************functions*****************************

// This method accepts project data and fills in a new project with that data.
// np: new project to copy into project
//     (copy variables so that methods still accessible)
function setupProject(np) {
  project = new projectModel(canvas, defaultSize, defaultBlocksPerSide, np.maxUsers, np.maxUsersPerRow);
  // Specific project data
  project.canvas = np.canvasModelProject;
  project.gridSize = np.gridSize;
  project.gridBlocksPerSide = np.gridBlocksPerSide;
  project.maxUsers = np.maxUsers;
  project.maxUsersPerRow = np.maxUsersPerRow;

  // Fill in grid data
  for (let i = 0; i < project.grids.length; i++) {
    project.grids[i].blocksPerSide = np.grids[i].blocksPerSide;
    project.grids[i].blockStrokeWeight = np.grids[i].blockStrokeWeight;
    project.grids[i].colors = np.grids[i].colors;
    project.grids[i].connectedUserID = np.grids[i].connectedUserID;
    project.grids[i].user = np.grids[i].user;
  }
}

//this is the very first function executed by the script
function setup() {
  // check if there is a variable for number of users (if so we are making a new screen)
  if (localStorage['usersPerSide']) {
    users_per_side = localStorage['usersPerSide']
    localStorage.removeItem('usersPerSide')
  }

  //initialize models
  canvas = new canvasModel(windowWidth,windowHeight);
  project = new projectModel(canvas, defaultSize, defaultBlocksPerSide, users_per_side * users_per_side, users_per_side);
  grid = new gridModel(canvas, defaultSize, defaultBlocksPerSide);
  setCursor("pointer");

  //draw canvas
  createCanvas(canvas.width, canvas.height);
  background(200);

  // user identification
  var isThisNewUser = false;
  user = localStorage['userkey'] || null; // if we already have an userid, else create a new one
  if (user === null) {
    // If no local user, either input a preexisting user or generate a new one
    var input = window.prompt("Please enter your user id for this image if you already have edited before. (Leave blank if this is your first time using)","");
    if (input === null || input === "" || input === "userid") {
      user = generateUID();
      isThisNewUser = true;
    } else {
      user = input;
      if (!checkDuplicateUserIds(user)) {
        user = generateUID();
        isThisNewUser = true;
      }
    }
    localStorage['userkey'] = user;
  }

  // where we want to check for query paramterss
  var urlParams = new URLSearchParams(window.location.search);
  var myParam = urlParams.get('project');
  var url = [location.protocol, '//', location.host, location.pathname].join('') + "/get?project=" + myParam;

  // Obtain old project data only if existance
  if (myParam != null) {
    linkWhenSaved = url;
    $.get(url, function(data) {
      if (data == null) {
        document.location.href="/game.html"; // redirecting
      }
      linkWhenSaved = url;
      setupProject(data.data); // since we have a project, load data

      // Based on a new user, assign new grid
      if (isThisNewUser) {
        for (let i = 0; i < project.grids.length; i++) {
          if (project.grids[i].user === null) {
            project.grids[i].user = user;
            userID = i;
            redraw();
            break; // so that we don't assign another grid
          }
        }
        $.notify("No remaining space in-board, downloading and redirecting to main page.");
        DownloadPressed();
        document.location.href = "/";
      } else {
        // Old User therefore Assigning Previous Grid
        for (let i = 0; i < project.grids.length; i++) {
          if (project.grids[i].user === user) {
            console.log("Found user:", user);
            userID = i;
            redraw();
            break;
          }
        }
        if (userID === -1) {
          // invalid id - assign new board
          window.alert("Invalid user id, assigning new grid.");
          for (let i = 0; i < project.grids.length; i++) {
            if (project.grids[i].user === null) {
              project.grids[i].user = user;
              userID = i;
              redraw();
              break;
            }
          }
          $.notify("No remaining space in-board, downloading and redirecting to main page.");
          DownloadPressed();
          document.location.href = "/";
        }
      }
    });
  } else {
    for (let i = 0; i < project.grids.length; i++) {
      if (project.grids[i].user === null) {
        project.grids[i].user = user; // since this is a new grid, should just assign first grid
        userID = i;
        redraw();
        break;
      }
    }
  }

  console.log("User:", userID)

  //create functional buttons
  let buttonX = 20;
  let buttonY = 0;

  //initialize buttons
  logo = createImg("source/logo3.png");
  logo.position(window.width-350,buttonY);
  logo.attribute('title', 'Pixel Pass');

  let saveButton = document.getElementById("save-btn");
  saveButton.addEventListener("click", saveButtonPressed);

  let loadButton = document.getElementById("load-btn");
  loadButton.addEventListener("click", loadButtonPressed);

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

  eraserButton = createImg("source/eraser.png");
  eraserButton.position(buttonX, buttonY + 300);
  eraserButton.mousePressed(EraserPressed);
  eraserButton.attribute('title', 'eraser');

  moveButton = createImg("source/move.png");
  moveButton.position(buttonX, buttonY + 400);
  moveButton.mousePressed(MovePressed);
  moveButton.attribute('title', 'move grid');

  centerButton = createImg("source/center.png");
  centerButton.position(buttonX, buttonY + 450);
  centerButton.mousePressed(CenterPressed);
  centerButton.attribute('title', 'center');

  showAllButton = createImg("source/showAll.png");
  showAllButton.position(buttonX, buttonY + 500);
  showAllButton.mousePressed(ShowAllPressed);
  showAllButton.attribute('title', 'show all');

  shareButton = createImg("source/share.png");
  shareButton.position(buttonX, buttonY + 600);
  shareButton.mousePressed(SharePressed);
  shareButton.attribute('title', 'share');

  downloadButton = createImg("source/download.png");
  downloadButton.position(buttonX, buttonY + 650);
  downloadButton.mousePressed(DownloadPressed);
  downloadButton.attribute('title', 'download');

  // All buttons have associated function to call.

  // Creating Text fields for User ID and Project link for user
  var user_default = document.createElement('output');
  user_default.style.position = 'absolute';
  user_default.style.left = '20px';
  user_default.style.bottom = '50px';
  user_default.value = "USER ID:";
  document.body.appendChild(user_default);

  var link_default = document.createElement('output');
  link_default.style.position = 'absolute';
  link_default.style.left = '20px';
  link_default.style.bottom = '25px';
  link_default.value = "LINK:";
  document.body.appendChild(link_default);

  // Making sure not creating twice
  if (user_textfield === null) {
    user_textfield = document.createElement('output');
    user_textfield.style.position = 'absolute';
    user_textfield.style.left = '90px';
    user_textfield.style.bottom = '50px';
    user_textfield.value = user;
    document.body.appendChild(user_textfield);
  }

  // Making sure not creating twice
  if (link_textfield === null) {
    link_textfield = document.createElement('output');
    link_textfield.style.position = 'absolute';
    link_textfield.style.left = '90px';
    link_textfield.style.bottom = '25px';
    link_textfield.value = linkWhenSaved;
    document.body.appendChild(link_textfield);
  }

  start = true;

  /*
  If you delete 'noLoop();', the script would automatically execute draw() indefinately.
  With 'noLoop();', draw() would be excecuted only once, after setup() and everytime you call redraw()
  */
  noLoop();
  setTimeout(function() {
    CenterPressed();
  }, 200);
}

//draw everything -- all the blocks. The Controller of the project
function draw() {
  //Get rid of previous artifacts in drawing
  clear(draw);

  //Set background to gray color (stands out)
  background(200);

  for(let i = 0; i < project.maxUsers; i++) {
    stroke(51);//color in grayscale of lines delimiting blocks.
    strokeWeight(project.grids[i].blockStrokeWeight);//set line weight

    //draw individual blocks
    var blockSize = project.grids[i].size / project.grids[i].blocksPerSide;

    //draw only blocks within the canvas
    function adjustIndex(index) {
      if(index < 0) return 0;

      if(index >= project.grids[i].blocksPerSide) return project.grids[i].blocksPerSide-1;
      return index;
    }

    var drawIndexUpperLeftX = adjustIndex(Math.floor(-project.grids[i].x / blockSize));
    var drawIndexUpperLeftY = adjustIndex(Math.floor(-project.grids[i].y / blockSize));
    var drawIndexBottomRightX = adjustIndex(Math.floor((canvas.width-project.grids[i].x) / blockSize));
    var drawIndexBottomRightY = adjustIndex(Math.floor((canvas.height-project.grids[i].y) / blockSize));

    for(let k = drawIndexUpperLeftX; k <= drawIndexBottomRightX; k++) {
      for(let j = drawIndexUpperLeftY; j <= drawIndexBottomRightY; j++) {
        fill(project.grids[i].colors[k][j]);

        //DO NOT USE square(), it may cause some unknown bugs.
        rect(project.grids[i].x + k * blockSize, project.grids[i].y + j * blockSize, blockSize , blockSize);
      }
    }
  }


  ////////////////////////// At very end, redo the draw for "OUR GRID" only //////////////////////////
  if (userID === -1) return;

  stroke(0);
  strokeWeight(15 * project.grids[userID].blockStrokeWeight);

  //draw individual blocks
  var blockSize = project.grids[userID].size / project.grids[userID].blocksPerSide;

  //draw only blocks within the canvas
  function adjustIndex(index) {
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

  for(let k = drawIndexUpperLeftX; k <= drawIndexBottomRightX; k++) {
    for(let j = drawIndexUpperLeftY; j <= drawIndexBottomRightY; j++) {
      fill(project.grids[userID].colors[k][j]);

      //DO NOT USE square(), it may cause some unknown bugs.
      rect(project.grids[userID].x + k * blockSize, project.grids[userID].y + j * blockSize, blockSize , blockSize);
    }
  }

  if (start) {
    saveButtonPressed()
  }
}

//when mouse is pressed down and moving
//DO NOT CHANGE THIS NAME
function mouseDragged() {
  if(currentMode === "Draw" || currentMode === "Erase") drawOnGrid();

  if(currentMode === "Move") {
    console.log("MOVE")
    for(let i = 0; i < project.maxUsers; i++) {
      project.grids[i].transfer(mouseX + mouseProjectOffset[0], mouseY + mouseProjectOffset[1]);
    }
    redraw();
  }
}

//when mouse is pressed
//DO NOT CHANGE THIS NAME
function mousePressed() {
  //Only need this in terms of absolute center (grid[0])
  mouseProjectOffset = [project.grids[0].x - mouseX, project.grids[0].y - mouseY];
  if (currentMode === "Draw" || currentMode === "Erase") drawOnGrid();
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

  if (keyCode === 32)
  { //space
    CenterPressed();
  }
}

//********************************custom functions**********************

function setCursor(mode) {
  document.body.style.cursor = mode;
  currentCursor = mode;
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById("mode").innerHTML = "Mode: "+ currentMode;
  if(mode === "Draw" || mode === "Erase") setCursor("crosshair");
  if(mode === "Move") setCursor("move");
  if(mode === "None") setCursor("pointer");
}

//paint the block at position mouseX, mouseY colorSelect
function drawOnGrid() {
  setCursor("crosshair");

  for(let i = 0; i < project.maxUsers; i++) {
    //Do not allow drawing on other people's blocks
    if(userID === project.grids[i].connectedUserID) {
      var blockSize = project.grids[i].size / project.grids[i].blocksPerSide;
      let x = Math.floor((mouseX - project.grids[i].x) / blockSize);
      let y = Math.floor((mouseY - project.grids[i].y) / blockSize);
      if (x < 0 || x >=  project.grids[i].blocksPerSide || y < 0 || y>= project.grids[i].blocksPerSide) continue;
      project.grids[i].colors[x][y]  = currentMode == "Erase"? "rgb(255,255,255)" : colorSelect;   //update model information
    }
  }

  redraw();
}


//execute when zoomInButton pressed
function zoomInPressed() {
  for(let i = 0; i < project.maxUsers; i++) {
    project.grids[i].scale(1.1);
  }

  redraw();
}

//execute when zommOutButton pressed
function zoomOutPressed() {
  for(let i = 0; i < project.maxUsers; i++) {
    project.grids[i].scale(0.9);
  }

  redraw();
}

//On scroll wheel
document.onwheel = function(event) {
  var y = event.deltaY;

  //Zoom in
  if(y === -100) {
    for(let i = 0; i < project.maxUsers; i++) {
      project.grids[i].scale(1.1);
    }

    redraw();
  }

  //Zoom out
  if(y === 100) {
    for(let i = 0; i < project.maxUsers; i++) {
      project.grids[i].scale(0.9);
    }

    redraw();
  }
}


//execute when clearButton pressed
function clearPressed() {
  setMode("None");
  if (confirm('Are you sure you want to clear the canvas?')) {
    for(let i = 0; i < project.maxUsers; i++) {
      //Do not allow clearing on other people's blocks
      if(userID === project.grids[i].connectedUserID) {
        project.grids[i].colors = grid.newColors();
      }
    }

    redraw();
  } else {
    // Do nothing!
  }
}

function DrawPressed() {
  setMode("Draw");
}

function EraserPressed() {
  setMode("Erase");
}

function MovePressed() {
  setMode("Move");
}

function CenterPressed() {
  let xCenter = 0;
  let yCenter = 0;

  //First, find the correct grid to center around
  for(let i = 0; i < project.maxUsers; i++) {
    project.grids[i].setSize(defaultSize);  //Helps hone in

    //(CURRENTLY GOES TO TOP LEFT AKA offsetBase = 0, 0)
    //Center around corresponding grid
    if(userID === project.grids[i].connectedUserID) {
      xCenter = (canvas.width / 2) - project.grids[i].offsetBase[0] - ( project.grids[i].size / 2 );
      yCenter = (canvas.height / 2) - project.grids[i].offsetBase[1] - ( project.grids[i].size / 2 );
    }
  }

  //Then, actually set the values to every grid
  for(let i = 0; i < project.maxUsers; i++) {
    project.grids[i].transfer(xCenter, yCenter);
  }

  redraw();
}

function ShowAllPressed() {
  size = 800;
  gridSize = size/project.maxUsersPerRow;
  upperLeftX = (windowWidth-size)/2;
  upperLeftY = (windowHeight-size)/2;
  for(let i = 0; i < project.maxUsers; i++) {
    project.grids[i].setSize(gridSize);
  }
  for(let i = 0; i < project.maxUsersPerRow; i++) {
    for(let j = 0; j < project.maxUsersPerRow; j++) {
      project.grids[i*project.maxUsersPerRow+j].transfer(upperLeftX,upperLeftY);
    }
  }
  redraw();
}

function SharePressed() {
  window.prompt("Copy to clipboard and share it with your friend!\n Ctrl+C, Enter", window.location.href);
}

function DownloadPressed() {
  var scale = 8;
	var pixelsPerGrid = 8;
  var width    = project.maxUsersPerRow * pixelsPerGrid * scale,
      height   = project.maxUsersPerRow * pixelsPerGrid * scale;

  var grids    = project.grids;
  var perRow   = project.maxUsersPerRow;
  let img = createImage(width, height); // same as new p5.Image(100, 100);
  img.loadPixels();

  // helper for writing color to array
  function writeColor(image, x, y, red, green, blue, alpha) {
    let index = (x + y * width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
    image.pixels[index + 3] = alpha;
  }

  let x, y;
  // fill with associated colors to index in grid
  for (y = 0; y < img.height; y++) {
    for (x = 0; x < img.width; x++) {
      // Computing the correct grid
      var m = int(y / scale), n = int(x / scale);
      // Determining the color at the grid location
      var color = parseRGB(project.grids[int(m / 8) * perRow + int(n / 8)].colors[n % 8][m % 8]);
      let red = color[0];
      let green = color[1];
      let blue = color[2];
      let alpha = 255;
      writeColor(img, x, y, red, green, blue, alpha);
    }
  }
  img.updatePixels();
  img.save(getQueryString('project', linkWhenSaved));
}

function colorPicked(jscolor) {
  colorSelect = jscolor.toRGBString();
}

// Function for getting query string from a url
var getQueryString = function(field, url) {
  let href = url ? url : window.location.href;
  let reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
  let string = reg.exec(href);
  return string ? string[1] : null;
};

function checkDuplicateUserIds(user_id_input) {
  console.log("Checking for duplicates");
  $.get([location.protocol,'//', location.host].join('') + "/getusers", function(data) {
    console.log("In here?", data.indexOf(user_id_input) >= 0);
    return data.indexOf(user_id_input) >= 0;
  });
  return true;
}

// If save button is pressed, determine if we need to save a new project or
// update an old project. With respect to save_id and user_id.
function saveButtonPressed() {
  var n = 0;
  var isNew = false;
  if (linkWhenSaved) {
    save_id = getQueryString('project', linkWhenSaved)
  } else {
    isNew = true;
    save_id = generateUID();
    previous_save = Date.now();
  }
  var urlS = [location.protocol, '//', location.host, location.pathname].join('');

  // Only allow saving every 2000 milliseconds
  if (isNew || save_id === undefined || Date.now() - previous_save > 3000) {
    // Ajax call to API to save grid with correct data.
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
      dataType : 'json'
    });
    linkWhenSaved = urlS + "?project=" + save_id;
    if (link_textfield.value === 'false') {
      if (history.pushState) {
        history.pushState({}, null, "game.html?project="+save_id);
      } else {
        // Set location for easy refreshing for user
        site = "/game.html?project=" + save_id;
        document.location.href = site;
      }
    }
    // Set textfield for user to know where they can reaccess current project.
    link_textfield.value = linkWhenSaved;
  }
}

// If loadButton pressed, saves and then updates other players' grids.
function loadButtonPressed() {
  let url = [location.protocol, '//', location.host, "/game.html/get?project=", save_id].join('');
  $.get(url, function(data) {
    if (data === null) {
      document.location.href = "/game.html";
    }
    setupProject(data.data);
  });
}

// alphabet size of 10 + 26 * 2 = 62. 62^8 is a sufficiently large number
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const UID_LENGTH = 8;

// Generates UID based on above ALPHABET and UID_LENGTH
function generateUID(length) {
  var rtn = '';
  for (let i = 0; i < UID_LENGTH; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
}

// For parsing color values in downloading method
// example input: color(0,0,0) -> output: [0,0,0]
// example input: color(255,255,255) -> output: [255,255,255]
// This is meant to be called correctly as there is no error checking.
// (assuming user correctness is ok as the only values could be correct color values)
function parseRGB(rgb) {
  let x = rgb.replace(/[A-Za-z$-()]/g, "");
  return x.split(",").map(function(t) {
    return parseInt(t);
  });
}
