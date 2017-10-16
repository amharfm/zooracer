var turtle = null;
var logo = null;
var canvas;
var form;
var sprite;
var textOutput;
var oldcode;
var fast;
var out;
var DelayTurtle;

function setup() {
    logo = new Logo();

    fast = 5;
    turtle = new DelayTurtle(canvas, sprite, fast, false);
    logo.setTurtle(turtle);
    logo.setTextOutput(textOutput);
}

function init(canvas_id, turtle_id, form_id, oldcode_id, textoutput_id) {
    // console.info(canvas_id, turtle_id, form_id, oldcode_id, textoutput_id)
    canvas = document.getElementById(canvas_id);
    form = document.getElementById(form_id);
    textOutput = document.getElementById(textoutput_id);
    sprite = document.getElementById(turtle_id);

    // I hate opera, I hate firefox.
    canvas.style.width =500;
    canvas.width = 500;

    canvas.style.height = 500;
    canvas.height = 500;

    oldcode = document.getElementById(oldcode_id);
    setup();
    Game.init();
}

function run(speed, drawbits) {
    turtle.stop();
    if (speed !== fast) {
        fast = speed;
        var newturtle = null;
        // newturtle = new Turtle(canvas);

        newturtle = new DelayTurtle(canvas, sprite, fast, drawbits);
        logo.setTurtle(newturtle);
        turtle = newturtle;
    }

    oldcode.innerHTML += "\n" + form.code.value;
    //form.code.value = ""

    out = logo.run(form.code.value);

    if (out && out.type === "error") {
        alert(out.data);
        setup();
    }
}

function stop() {
    turtle.stop();
}

function canvasPixelColor(ev, context) {
  // var x = ev.offsetX || ev.layerX;
  // var y = ev.offsetY || ev.layerY;
  // var data = context.getImageData(x, y, 1, 1).data;
  // console.log(ev.x, Math.floor(ev.x))
  var data = context.getImageData(ev.x, ev.y, 1, 1).data;

  var r = data[0];
  var g = data[1];
  var b = data[2];
  var a = data[3];

  return {
    hex: rgbToHex(r, g, b),
    rgba: [r,g,b,a]
  }
}

function rgbToHex(r, g, b) {
  return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
}

function clearcanvas(track) {
  //give the picture

  // var canvas = document.getElementById('viewport'),
  // context = canvas.getContext('2d');

  // make_base();

  // function make_base()
  // {
  // }
    var base_image = new Image();
    base_image.src = 'img/track/'+track;

    var ctx = canvas.getContext('2d');
    base_image.onload = function(){
      ctx.drawImage(base_image, 0, 0);
    }

    textOutput.innerHTML = "";

    canvas.onclick = function(e){
        console.log(canvasPixelColor(e, ctx))
    }
}