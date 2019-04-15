//Canvas object for displaying/drawing necessary features
class canvasModel {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

new p5();           // DO NOT CHANGE THIS, KEEP IT ON TOP OF OTHER DECLARATIONS.
var canvas;

//Buttons and inputs need to be global so we can dynamically show/hide
var newProjectButton;
var oldProjectButton;
var projCodeInput;
var backButton;

//First function called on initialization
function setup() {
    //Create canvas object to place buttons and other features on
    canvas = new canvasModel(windowWidth, windowHeight);

    // Adding background image
    $('body').css('width', '1%');
    $('body').css('height', '1%');
    $('body').css('background-image', 'url(../source/background.png)');
    $('body').css('background-repeat', 'repeat');

    //Draw that canvas
    createCanvas(canvas.width, canvas.height);

    //Place logo in center of screen
    logo = createImg("../source/logo3.png");
    logo.position(windowWidth / 2 - 85, windowHeight / 2 - 225);

    //create "Create New Project" (newProject) Button. Program will then ask user for some information (ie max number users) to create a new project.
    newProjectButton = createButton("Create New Project");
    newProjectButton.position(windowWidth / 2, windowHeight / 2);
    newProjectButton.mousePressed(newProject);

    //Create "Join Existing Project" (oldProject) Button for users who want to join/rejoin a preexisting project.
    oldProjectButton = createButton("Join Existing Project");
    oldProjectButton.position(windowWidth / 2, windowHeight / 2 + 50 );
    oldProjectButton.mousePressed(oldProject);

    //Create and hide "Project Code" Input (To connect to specific projects)
    projCodeInput = createInput();
    projCodeInput.position(windowWidth / 2, windowHeight / 2 - 50);
    projCodeInput.hide();

    joinExistingButton = createButton("Join Project");
    joinExistingButton.position(windowWidth / 2, windowHeight / 2);
    joinExistingButton.mousePressed(joinExisting);
    joinExistingButton.hide();

    //Create and hide "Back" Button (to return to starting screen later after clicking new or old project buttons).
    backButton = createButton("Back");
    backButton.position(windowWidth / 2, windowHeight / 2 + 100);
    backButton.mousePressed(back);
    backButton.hide();

    //Create and hide "4 Max Users" Button (To create project with maximum of 4 users)
    fourUsersButton = createButton("4 Max Users");
    fourUsersButton.position(windowWidth / 2, windowHeight / 2 - 50);
    fourUsersButton.mousePressed(fourUsers);
    fourUsersButton.hide();

    //Create and hide "8 Max Users" Button (To create project with maximum of 8 users)
    nineUsersButton = createButton("9 Max Users");
    nineUsersButton.position(windowWidth / 2, windowHeight / 2);
    nineUsersButton.mousePressed(eightUsers);
    nineUsersButton.hide();

    //Create and hide "64 Max Users" Button (To create project with maximum of 64 users)
    sixtyFourUsersButton = createButton("64 Max Users");
    sixtyFourUsersButton.position(windowWidth / 2, windowHeight / 2 + 50);
    sixtyFourUsersButton.mousePressed(sixtyFourUsers);
    sixtyFourUsersButton.hide();

    noLoop();   //Prevents infinitely drawing canvas
}

function draw() {
    //Get rid of previous artifacts in drawing
    clear(draw);
}

function newProject() {
    //Show buttons that correspond to creating a new project
    backButton.show();
    fourUsersButton.show();
    nineUsersButton.show();
    sixtyFourUsersButton.show();

    //Hide buttons of start screen
    newProjectButton.hide();
    oldProjectButton.hide();

    redraw();
}

function oldProject() {
    //Show buttons that correspond to creating a new project
    backButton.show();
    projCodeInput.show();
    joinExistingButton.show();

    //Hide buttons of start screen
    newProjectButton.hide();
    oldProjectButton.hide();

    redraw();
}

//Make a PixelPass project with four max users
function fourUsers() {
    localStorage['usersPerSide'] = 2; // 2x2
    document.location.href = "/game.html";
}

//Make a PixelPass project with nine max users
function eightUsers() {
    localStorage['usersPerSide'] = 3; // 3x3
    document.location.href = "/game.html";
}

//Make a PixelPass project with sixty-four max users
function sixtyFourUsers() {
    localStorage['usersPerSide'] = 8; // 8x8
    document.location.href = "/game.html";
}

function joinExisting() {
    // value will be the link that we want to redirect to
    value = "/game.html?project=" + projCodeInput.value();
    console.log("Redirecting to " + value);
    document.location.href = value; // Redirecting
}

function back() {
    //Hide backButton and other inputs
    backButton.hide();
    projCodeInput.hide();
    fourUsersButton.hide();
    nineUsersButton.hide();
    sixtyFourUsersButton.hide();
    joinExistingButton.hide();

    //Show front page buttons we previously hid
    newProjectButton.show();
    oldProjectButton.show();

    redraw();
}

//Ensure window stays at size of user's browser window
function windowResized() {
   resizeCanvas(windowWidth, windowHeight);

   //Reposition all images on screen, buttons, and inputs. Active or otherwise

   logo.position(windowWidth / 2 - 100, windowHeight / 2 - 250);

   //Main Screen Buttons
   newProjectButton.position(windowWidth / 2, windowHeight / 2);
   oldProjectButton.position(windowWidth / 2, (windowHeight / 2) + 50 );


   //New or Old Project Buttons and Inputs
   projCodeInput.position(windowWidth / 2, windowHeight / 2 - 50);
   joinExistingButton.position(windowWidth / 2, windowHeight / 2);

   backButton.position(windowWidth / 2, windowHeight / 2 + 100);

   fourUsersButton.position(windowWidth / 2, windowHeight / 2 - 50);
   nineUsersButton.position(windowWidth / 2, windowHeight / 2);
   sixtyFourUsersButton.position(windowWidth / 2, windowHeight / 2 + 50);

   redraw();
}
