var mine_positions = [];
var game_size = 8;
var num_tiles = Math.pow(game_size, 2);
var num_mines = 10;
var tiles_left = num_tiles - num_mines;
var the_timer;
var time = 0;
var flagging = true;
var first_click = false;
var game_running = false;
var num_clicks = replicate(num_tiles, 0);
var marked_tiles = [];

//Helper Functions

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function $(x) {return document.getElementById(x);}

//Create an array with default values
function replicate (n, x) {
  var xs = [];
  for (var i = 0; i < n; ++i) {
    xs.push (x);
  }
  return xs;
};

//Randomly sets the positions of the mines
//Create array, randomize numbers, slice amount needed
function set_mines() {
  num_tiles = Math.pow(game_size, 2);
  tiles_left = num_tiles - num_mines;
  temp_arr = [];
  for (var i = 1; i <= num_tiles; i++) temp_arr[temp_arr.length] = i;
  mine_positions = shuffle(temp_arr).slice(0, num_mines);
};

//Reset
function new_game() {
  delete_gameboard();
  set_mines();
  create_gameboard();
  clearInterval(the_timer);
  $("message").innerHTML = "New Game";
  var radio = document.getElementsByName;
  first_click = false;
  game_running = false;
  time = 0;
  num_clicks = replicate(num_tiles, 0);
  marked_tiles = [];
  flagging ? radio[0].checked = true : radio[1].checked = true;
};

function solution() {
  $("message").innerHTML = "You lost";
  //Reveal mines
  if (tiles_left != 0) {
    for(var i=0; i<mine_positions.length; i++){
         var button = $(mine_positions[i]);
      if (button.innerHTML != "X") {
          button.innerHTML = "X";
          button.style.color = "red";
          }
    }
  }
  //Check for false flags
  for(var i=0; i<marked_tiles.length; i++) {
    var index = marked_tiles[i];
    if (mine_positions.indexOf(marked_tiles[i]) == -1) {
      $(marked_tiles[i]).style.border = "1px solid red";
    }
  }
};

//Removes the button and adds the number of mines found
function remove_tile(id, numMines) {
  var button = $(id);
  var cell = button.parentNode;
  cell.removeChild(button);
  var colors = ["blue", "green", "red", "DarkBlue", "HotPink", "DarkGreen", "Crimson", "Purple", "DarkCyan"];
  cell.style.color = colors[numMines - 1];
  cell.style.borderColor = "black";
  if (numMines != 0) cell.appendChild(document.createTextNode(numMines));
  tiles_left--;
};

//Removes onclick features for all buttons
function deactivate() {
  clearInterval(the_timer);
  for (var i = 1; i <= num_tiles; i++) {
    var element = $(i);
    if (element) {
      element.onclick = null;
      element.oncontextmenu = null;
    }
  }
  game_running = false;
};

//Sets up the timer for print out
function timer(){
  time += 1;
  var mins = parseInt(time / 60);
  var secs = parseInt(time % 60);
  var timer = $("timer");
  (secs < 10) ? timer.innerHTML = mins + ":0" + secs : timer.innerHTML = mins + ":" + secs;
};

//setup for neighbor search
function neighborSetUp(id){
  var row = Math.ceil(id / game_size);
  var column = id % game_size;
  if (column == 0) column = game_size;
  var start = column;
  var end = column;
  if (start != 1) start--;
  if (end != game_size) end++;
  return [row, start, end];
};

//Check neighbors for mines
function check_neighbors(id){
  var mines_found = 0;
  var setup = neighborSetUp(id);
  //Removing the button and displaying the number of mines found
  for (var i = setup[0]-1; i <= setup[0]+1; i++) {
    for (var j = setup[1]; j <= setup[2]; j++) {
      if (mine_positions.indexOf((i-1) * game_size + j) != -1) {
        mines_found++;
      }
    }
  }
  return mines_found;
};

//checks for mines, calls for neighbor count, removes tiles, recursively check neighbors if 0
function check(clicked_id) {
  //starts timer
  if (first_click === false) {
    the_timer = setInterval(timer, 1000);
    first_click = true;
    game_running = true;
  }
  //Checks if mine was clicked
  if (mine_positions.indexOf(parseInt(clicked_id)) != -1) {
    deactivate();
    solution();
  } else {
    var mines_found = check_neighbors(clicked_id);
    if ($(clicked_id)) {
      remove_tile(clicked_id, mines_found);
    }
    //Clicking dudes that have no mine buddies
    var setup = neighborSetUp(clicked_id);
    if (mines_found == 0) {
      for (var i = setup[0]-1; i <= setup[0]+1; i++) {
        for (var j = setup[1]; j <= setup[2]; j++) {
          var index = (i-1) * game_size + j
          if ($(index)) {
            var neighbor_mines = check_neighbors(index);
            remove_tile(index, neighbor_mines);
            if (neighbor_mines == 0) {
              check(index)
            }
          }
        }
      }
    }
  }
};

//Controls flagging of mines
function flag(id) {
  function click1(){
    tile.onclick = null;
    tile.innerHTML="X";
    marked_tiles.push(parseInt(id));
  };

  num_clicks[id-1] += 1;
  var clicks = num_clicks[id-1];
  var tile = $(id);
  //Check if game is running
  if (game_running) {
    //If there is ? flagging
    if (flagging) {
      clicks = clicks % 4;

      //Symbol decision based on num of clicks
      if (clicks == 1) {
        click1();
      } else if (clicks == 2) {
        tile.innerHTML="?";
        tile.onclick = check.bind(tile, tile.id);
        marked_tiles.splice(marked_tiles.indexOf(id),1)
       } else if (clicks == 3) {
        tile.innerHTML = "";
      }
    } else {
        clicks = clicks % 3;
        //Symbol decision based on num of clicks
      if (clicks == 1) {
        click1();
      } else if (clicks == 2) {
        tile.innerHTML = "";
      if(!tile.onclick){
        tile.onclick = check.bind(tile, tile.id)
        marked_tiles.splice(marked_tiles.indexOf(id),1)
        }
      }
    }
  }
  return false;	
};

//Set up rows of table and buttons with ids
function create_gameboard() {
  //Create headers
  var table = $("gameboard");
  var header = table.createTHead();
  var rowH = header.insertRow(0);
  var cell = rowH.insertCell(0);
  cell.id = "timer";
  cell.innerHTML = "0:00";
  cell.colSpan = game_size/4;
  cell = rowH.insertCell(1);
  cell.id = "message";
  cell.colSpan = game_size/2;
  cell = rowH.insertCell(2);
  cell.id = "numMines";
  cell.colSpan = game_size/4;
  cell.innerHTML = num_mines;

  //Create cells with buttons
  for (var i = 0; i < game_size; i++) {
    var row = table.insertRow(i+1);
    for (var j = 0; j < game_size; j++) {
      var cell = row.insertCell(j);
      var button = document.createElement("button");
      button.id = game_size*i + j+1;
      button.onclick = check.bind(button, button.id);
      button.oncontextmenu = flag.bind(button, button.id);
      cell.appendChild(button);
    }
  }
};

//Remove rows of table
function delete_gameboard(){
  var table = $("gameboard");
  var rowCount = table.rows.length;
  while(table.rows[0]) table.deleteRow(0);
};

//Retrieves user input and sets up gameboard accordingly
function set_difficulty() {
  var dropbox = $("select_difficulty");
  var level = dropbox.options[dropbox.selectedIndex].value;
  if (level == "easy") {
    game_size = 8;
    num_mines = 10;
  } else if (level == "medium") {
    game_size = 16;
    num_mines = 40;
  } else {
    game_size = 32;
    num_mines = 199;
  }
  new_game();
  set_mines();
};

//Check if all mineless tiles have been clicked
function validate() {
  deactivate();
  var message = $("message");
  if (tiles_left == 0) {
    message.innerHTML = "You won!";
  } else {
    solution();
  }
};

//Finds an unchecked mine and marks it
function cheat() {
  if (game_running === true) {
    var i = 0;
    time += 10;
    for (var i; i < 10; i++) {
      var button = $(mine_positions[i]);
      if (button.innerHTML != "X") {
        $("message").innerHTML = "Psst! Mine!";
        button.innerHTML = "X";
        button.style.color = "red";
        break;
      }
    }
  }
};

//Set flagging preference
function changeFlagging(myR) {
  flagging = myR.value;
};


function init() {
  create_gameboard();
  set_mines();
};

