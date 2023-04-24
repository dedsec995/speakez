<script setup>
// https://www.studytonight.com/post/javascript-speech-recognition-example-speech-to-text

import { ref } from 'vue'
import { useAVCircle, useAVLine } from 'vue-audio-visual'
import axios from 'axios'

const player = ref(null)
const canvas = ref(null)
let mySource = ref(null)
let action = ref('')
let output = ref('')

useAVLine(player, canvas, { src: mySource, canvHeight: 300, canvWidth: 1000, lineColor: 'teal' })

const runSpeechRecognition = () => {
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();

  recognition.onstart = () => { action.value = "listening, please ask your question..." };

  recognition.onspeechend = () => {
    action.value = "stopped listening...";
    recognition.stop();
  }

  recognition.onresult = async (event) => {
    var transcript = event.results[0][0].transcript;
    output.value = transcript
    const myCommands = ["turn on the light", "turn off the light", "turn on the fan", "turn off the fan"];
    var uthub = "youtube";
    var youthub = transcript.split(" ");
    if (myCommands.includes(transcript.toLowerCase()) ||  youthub[youthub.length - 1].toLowerCase() == uthub.toLowerCase()) {
      try {
        let res = await axios.post('/api/aws-iot', {
          text: event.results[0][0].transcript.toLowerCase()
        })

        if (res.data) {
          mySource.value = '/voice/' + res.data + '.mp3'
          setTimeout(() => { player.value.play() }, 500)
        }
      } catch (err) {
        console.log(err)
      }
    }
    else {
      try {
        let res = await axios.post('/api/text-to-audio-file', {
          text: event.results[0][0].transcript
        })

        if (res.data) {
          mySource.value = '/voice/' + res.data + '.mp3'
          setTimeout(() => { player.value.play() }, 500)
        }
      } catch (err) {
        console.log(err)
      }
    }
  };
  recognition.start();
}



var hexagon_radius = 50;
var hexagon_max_absolute_speed = 0.05;
var hexagon_space_between = 5;
var hexagon_line_width = 1;
var hexagon_color = "cyan";


var canvasTemp, ctx;

var hexagons = [];

var s3p3 = Math.sqrt(3);

function init() {
	canvasTemp = document.getElementById("c");
	canvasTemp.width = window.innerWidth;
	canvasTemp.height = window.innerHeight;
	canvasTemp.style.width = canvasTemp.width + "px";
	canvasTemp.style.height = canvasTemp.height + "px";
	ctx = canvasTemp.getContext("2d");

	ctx.globalCompositeOperation = "source-over";

	var hw =
		Math.ceil(canvasTemp.width / (1.5 * hexagon_radius + hexagon_space_between * 2)) +
		1;
	var hh =
		Math.ceil(
			canvasTemp.height / (s3p3 * hexagon_radius + hexagon_space_between * 2)
		) + 1;

	for (var x = 0; x < hw; x++)
		for (var y = 0; y < hh; y++)
			addHexagon(
				hexagon_radius +
					hexagon_space_between +
					(1.5 * hexagon_radius + hexagon_space_between * 2) * x,
				(s3p3 * hexagon_radius) / 2 +
					hexagon_space_between +
					(s3p3 * hexagon_radius + hexagon_space_between * 2) * y -
					(x % 2 ? (s3p3 * hexagon_radius) / 2 : 0),
				{
					l: 0
				}
			);

	ctx.lineWidth = hexagon_line_width;

	loop();
}

function loop() {
	requestAnimFrame(loop);

	ctx.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvasTemp.width, canvasTemp.height);

	ctx.beginPath();

	for (var i = 0; i < hexagons.length; i++) drawHexagonPath(i);

	ctx.shadowColor = hexagon_color;
	ctx.shadowBlur = 20;
	ctx.strokeStyle = hexagon_color;
	ctx.stroke();
}

function addHexagon(x, y, opts) {
	var l = Math.floor(Math.random() * 6),
		p = Math.random();

	if (!opts) opts = {};

	hexagons.push({
		sl: opts.l || opts.l === 0 ? opts.l : l,
		p: opts.p || opts.p === 0 ? opts.p : p,
		x: x,
		y: y,
		speed:
			opts.speed || opts.speed === 0
				? opts.speed
				: Math.random() * hexagon_max_absolute_speed * 2 -
				  hexagon_max_absolute_speed
	});
}

function drawHexagonPath(hex_index) {
	var hex = hexagons[hex_index];

	ctx.moveTo(
		hex.x +
			Math.cos((Math.PI / 3) * hex.sl) * hexagon_radius +
			Math.cos((Math.PI / 3) * (hex.sl + 2)) * hexagon_radius * hex.p,
		hex.y +
			Math.sin((Math.PI / 3) * hex.sl) * hexagon_radius +
			Math.sin((Math.PI / 3) * (hex.sl + 2)) * hexagon_radius * hex.p
	);

	//ctx.moveTo(hex.x, hex.y);

	ctx.lineTo(
		hex.x + Math.cos((Math.PI / 3) * (hex.sl + 1)) * hexagon_radius,
		hex.y + Math.sin((Math.PI / 3) * (hex.sl + 1)) * hexagon_radius
	);

	ctx.lineTo(
		hex.x + Math.cos((Math.PI / 3) * (hex.sl + 2)) * hexagon_radius,
		hex.y + Math.sin((Math.PI / 3) * (hex.sl + 2)) * hexagon_radius
	);

	ctx.lineTo(
		hex.x + Math.cos((Math.PI / 3) * (hex.sl + 3)) * hexagon_radius,
		hex.y + Math.sin((Math.PI / 3) * (hex.sl + 3)) * hexagon_radius
	);

	ctx.lineTo(
		hex.x +
			Math.cos((Math.PI / 3) * (hex.sl + 3)) * hexagon_radius +
			Math.cos((Math.PI / 3) * (hex.sl + 5)) * hexagon_radius * hex.p,
		hex.y +
			Math.sin((Math.PI / 3) * (hex.sl + 3)) * hexagon_radius +
			Math.sin((Math.PI / 3) * (hex.sl + 5)) * hexagon_radius * hex.p
	);

	hex.p += hex.speed;
	if (hex.p > 1 || hex.p < 0) {
		hex.p = hex.speed < 0 ? 1 : 0;
		hex.sl += hex.speed < 0 ? -1 : 1;
		hex.sl = hex.sl % 6;
		hex.sl = hex.sl < 0 ? 4 - hex.sl : hex.sl;
	}

	hexagons[hex_index] = hex;
}

window.onload = function () {
	init();
};

window.requestAnimFrame = (function () {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();

</script>

<template>
  <canvas id="c"></canvas>
  <div class="tint"></div>
  <div class="mainButtonLayout">
    <center class="mainTextHere"><h1>SPEAK EZ</h1></center>
    <div class="btn-section">
      <button type="button" @click="runSpeechRecognition()">ASK ME ANYTHING</button>
    </div>
    <div class="display-section">
      <div class="action action1">Press the Button to<br>Ask Questions or give Commands</div>
      <div class="action" v-if="action">{{ action }}</div>
      <div class="output" v-if="output"><b>Question</b>: {{ output }}</div>
    </div>
    <div>
      <audio id="player" ref="player" :src="mySource" type="audio/mpeg" controls hidden></audio>
      <canvas id="audioWave" ref="canvas"></canvas>
    </div>
  </div>
</template>

<style>

@font-face {
    font-family: roboFonts;
    src: url(/src/roboFont.ttf);
}

@font-face {
    font-family: mainFont;
    src: url(/src/mainFont.ttf);
}

html,
body {
	margin: 0;
	overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: rgb(23, 23, 23);
  font-family: roboFonts;
}

#c {
  padding: 0;
  margin: auto;
  display: block;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.mainButtonLayout {
  padding: 0;
  margin: auto;
  display: block;
  width: 50%;
  position: absolute;
  top: 150px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index:99;
}

#audioWave{
  width: 100%;
  margin-top: 50px;
}

.tint{
  padding: 8px 13px;
  border-radius: 5px;
  background-color: rgb(0, 0, 0);
  opacity: 75%;
  color: white;
  border: none;
  cursor: pointer;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index:98;
}

.btn-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

button {
  padding: 8px 13px;
  border-radius: 5px;
  background-color: rgb(0, 129, 129);
  width: 200px;
  height: 50px;
  background-size: cover;
  color: white;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  font-family: mainFont;
}

.mainTextHere{
  width: 100%;
}

h1{
  align-items: center;
  justify-content: space-around;
  margin: auto;
  color: white;
  font-size: 55px;
  border: none;
  margin: none;
  padding: none;
  font-family: mainFont;
}

.display-section {
  width: 100%;
  text-align: center;
  color: white;
}

.action {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 10px;
}

.output {
  max-width: 500px;
  padding: 20px;
  border-radius: 10px;
  border: 1px dotted white;
  display: inline-block;
}


/* Use a media query to add a breakpoint at 800px: */
@media screen and (max-width: 800px) {

  .mainButtonLayout{
    width: 100%;
  }

  h1{
    font-size: 35px;
  }

  button {
    padding: 8px 13px;
    width: 170px;
    font-size: 13px;
  }

  #audioWave{
    width: 100%;
    margin-top: 50px;
  }

  .output {
    margin: 10px;
    max-width: 95%;
    font-size: 15px;
    padding: 15px;
  }

}

</style>