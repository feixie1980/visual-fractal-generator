import React, { Component, useState } from 'react';
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo } from "@fortawesome/free-solid-svg-icons";
import * as math from "mathjs";

let chaos = {};

let currentPoint,
  scale = 100,
  pointSize = 10,// .5 / scale,
  interval;

function sierpinski_triangle(width, height) {
  const XOffset = width * .5, YOffset = height * .5;
  return [
    { p: 1/3,
      fn: (x, y) => {
        return { x: .5 * x, y: .5 * y };
      }},
    { p: 1/3,
      fn: (x, y) => {
        return { x: .5 * x + XOffset, y: .5 * y };
      }},
    { p: 1/3,
      fn: (x, y) => {
        return { x: .5 * x, y: .5 * y + YOffset };
      }}
  ];
}

function toTransformMatrix({scale, translate, rotate, flip}) {
  const FS = math.matrix([
    [-1, 0,  0],
    [0,  1,  0],
    [0,  0,  1]
  ]);

  const FT = math.matrix([
    [1, 0, 1],
    [0, 1, 0],
    [0, 0, 1]
  ]);

  const T = math.matrix([
    [1, 0, translate.x],
    [0, 1, translate.y],
    [0, 0, 1]
  ]);

  const S = math.matrix([
    [scale.x, 0, 0],
    [0, scale.y, 0],
    [0, 0, 1]
  ]);

  const theta = math.unit(rotate, 'deg');
  const R = math.matrix([
    [math.cos(theta),  math.sin(theta), 0],
    [-math.sin(theta), math.cos(theta), 0],
    [0, 0, 1]
  ]);

  if(flip) {
    return math.multiply(T, R, S, FT, FS);
  }
  else {
    return math.multiply(T, R, S);
  }
}

function genTransforms(templates, width, height) {
  return templates.map(template => {
    const matrix = toTransformMatrix(template);
    const fn = (x, y) => {
      const a = matrix.subset(math.index(0, 0));
      const b = matrix.subset(math.index(1, 0));
      const c = matrix.subset(math.index(0, 1));
      const d = matrix.subset(math.index(1, 1));
      const tx = width * matrix.subset(math.index(0, 2));
      const ty = height * matrix.subset(math.index(1, 2));
      return {
        x: x * a + y * b + tx,
        y: x * c + y * d + ty,
      }
    };
    return {
      fn, p: 1 / templates.length
    }
  });
}

function genRandomPoints(x, y) {
  const r = Math.random();
  const { transforms } = chaos; //sierpinski_triangle(chaos.width, chaos.height);

  let index = 0, sum = 0;
  for(const transform of transforms) {
    if(r > sum + transform.p && index + 1 < transforms.length) {
      sum += transform.p;
      index++;
    }
  }

  console.debug(`r:${r}, transform select: ${index}`);
  return transforms[index].fn(x, y);
}

function setPoint(p) {
  const {x, y} = p;
  console.debug(`x:${(x / chaos.width).toPrecision(2)}, y:${(y / chaos.height).toPrecision(2)}`);
  chaos.context.save();
  chaos.context.fillStyle = 'black';
  chaos.context.beginPath();
  chaos.context.arc(x, y, 0.1, 0, Math.PI * 2, false);
  chaos.context.fill();
  chaos.context.closePath();
  chaos.context.restore();
}

function nextPoint() {
  const {x, y} = genRandomPoints(currentPoint.x, currentPoint.y);
  currentPoint.x = x;
  currentPoint.y = y;
  setPoint(currentPoint);
}

export default class FractalDisplay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false
    }
  }

  componentDidMount() {
    this.initDrawing();
    currentPoint = {
      x: chaos.width * .8, y : chaos.height * .9
    };
    setPoint(currentPoint);

    document.body.addEventListener("keyup", function(event) {
      switch(event.keyCode) {
        case 32: // space
          chaos.nextPoint();
          break;

        case 187: // +
          clearInterval(interval);
          interval = setInterval(function() {
            for(let i = 0; i < 10; i += 1) {
              chaos.nextPoint();
            }
          }, 0);
          break;

        case 189: // -
          clearInterval(interval);
          break;

        case 80: // p
          chaos.popImage();
          break;

        default:
          break;
      }
    });
  }

  initDrawing() {
    const { clientWidth, clientHeight } = document.getElementById("template-display");
    const canvas = document.getElementById("fractal-canvas");
    const context = canvas.getContext("2d");
    const size = Math.min(clientWidth * 0.7, clientHeight * 0.9);
    const width = size;
    const height = size;
    canvas.width = width;
    canvas.height = height;

    chaos = {
      canvas, context, width, height,
      transforms: []
    };
  }

  clear(color) {
    if(color) {
      chaos.context.fillStyle = color;
      chaos.context.fillRect(0, 0, chaos.width, chaos.height);
    }
    else {
      chaos.context.clearRect(0, 0, chaos.width, chaos.height);
    }
  }

  popImage() {
    const win = window.open("", "Canvas Image"),
      src = chaos.canvas.toDataURL("image/png");

    win.document.write("<img src='" + src
      + "' width='" + chaos.width
      + "' height='" + chaos.height + "'/>");
  }

  onPlay = () => {
    clearInterval(interval);
    interval = setInterval(function() {
      for(let i = 0; i < 10; i += 1) {
        nextPoint();
      }
    }, 0);
  };

  onPause = () => {
    clearInterval(interval);
  };

  onRestart = () => {
    clearInterval(interval);
    this.clear();
  };

  render() {
    const { playing } = this.state;
    const { templates } = this.props;
    chaos.transforms = genTransforms(templates, chaos.width, chaos.height);

    return (
      <div id="fractal-display" className="fractal-display">
        <div className="fractal-display-control">
          { playing ?
            <Button variant="link" size="sm" onClick={()=>{
              this.onPause();
              this.setState({playing:false});
            }}>
              <FontAwesomeIcon icon={faPause} />
            </Button>
            :
            <Button variant="link" size="sm" onClick={() => {
              this.onPlay();
              this.setState({playing:true});
            }}>
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          }
          <Button variant="link" size="sm" onClick={() => this.onRestart()}>
            <FontAwesomeIcon icon={faRedo} />
          </Button>
        </div>
        <canvas id="fractal-canvas"/>
      </div>
    );
  }
}