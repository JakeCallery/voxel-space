import {Camera} from "./camera";
import {DrawState} from "./drawstate";
import {KeyState} from "./keystate";

export function setupCanvas(canvas: HTMLCanvasElement) {

    const scalingFactor = 100;

    let imagesLoaded = 0;
    const colorMap = new Image();
    colorMap.crossOrigin = "anonymous";
    const heightMap = new Image();
    heightMap.crossOrigin = "anonymous";

    let colorMapData: Uint8ClampedArray;
    let heightMapData: Uint8ClampedArray;

    colorMap.src = './assets/colorMap.png';
    heightMap.src = './assets/heightMap.png';

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ctx = canvas.getContext("2d")!;

    const imageData = ctx!.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;

    const drawState = <DrawState>{
        plx: 0,
        ply: 0,
        prx: 0,
        pry: 0
    }

    const keyState = <KeyState> {
        arrowUp: false,
        arrowDown: false,
        arrowLeft: false,
        arrowRight: false
    }

    let isRunning = true;

    const camera = <Camera>{
        x: 500,
        y: 512,
        altitude: 150,
        zFar: 400
    }

    colorMap.onload = (evt) => {
        let canvas = document.createElement('canvas');
        canvas.width = colorMap.naturalWidth;
        canvas.height = colorMap.naturalHeight;
        let context = canvas.getContext('2d');
        context!.drawImage(colorMap, 0, 0);
        colorMapData = context!.getImageData(0,0, canvas.width, canvas.height).data;
        init(evt);
    }

    heightMap.onload = (evt) => {
        let canvas = document.createElement('canvas');
        canvas.width = heightMap.naturalWidth;
        canvas.height = heightMap.naturalHeight;
        let context = canvas.getContext('2d');
        context!.drawImage(heightMap, 0, 0);
        heightMapData = context!.getImageData(0,0, canvas.width, canvas.height).data;
        init(evt);
    }

    const start = () => {
        console.log("Start");

        //Register keyboard events
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
               case "ArrowUp":
                    keyState.arrowUp = true;
                    break;
                case "ArrowDown":
                    keyState.arrowDown = true;
                    break;
                case "ArrowLeft":
                    keyState.arrowLeft = true;
                    break;
                case "ArrowRight":
                    keyState.arrowRight = true;
                    break;
                case "w":
                    keyState.elevationUp = true;
                    break;
                case "s":
                    keyState.elevationDown = true;
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
          switch (event.key) {
              case "ArrowUp":
                  keyState.arrowUp = false;
                  break;
              case "ArrowDown":
                  keyState.arrowDown = false;
                  break;
              case "ArrowLeft":
                  keyState.arrowLeft = false;
                  break;
              case "ArrowRight":
                  keyState.arrowRight = false;
                  break;
              case "w":
                  keyState.elevationUp = false;
                  break;
              case "s":
                  keyState.elevationDown = false;
                  break;

          }
        });

        //Start the game loop
        step()

    }

    const step = () => {

        processInputs();
        updateStates(camera, drawState);
        drawScreen(camera, drawState);

        if (isRunning) {
            window.requestAnimationFrame(step)
        }
    }

    const processInputs = () => {

        if(keyState.arrowUp) {
            camera.y--;
        }

        if(keyState.arrowDown) {
            camera.y++;
        }

        if(keyState.arrowLeft) {
            camera.x--
        }

        if(keyState.arrowRight) {
            camera.x++;
        }

        if(keyState.elevationUp) {
            camera.altitude++;
        }

        if(keyState.elevationDown) {
            camera.altitude--;
        }

    }

    const updateStates = (camera: Camera, ds: DrawState) => {
        //Draw State update
        ds.plx = -camera.zFar;
        ds.ply = camera.zFar;
        ds.prx = camera.zFar
        ds.pry = camera.zFar;

    }

    const drawScreen = (camera: Camera, ds: DrawState) => {

        clearImageData(data);

        let xSegment = (ds.prx - ds.plx) / canvasWidth;
        let ySegment = (ds.pry - ds.ply) / canvasWidth;

        for (let i = 0; i < canvasWidth; i++) {
            //Calc slope from camera to far point at zfar length
            let dx = (ds.plx + (xSegment * i)) / camera.zFar;
            let dy = (ds.ply + (ySegment * i)) / camera.zFar;

            //Ray Base
            let rx = camera.x;
            let ry = camera.y;

            let maxHeightOnScreen = canvasHeight;

            for (let z = 1; z < camera.zFar; z++) {
                rx += dx;
                ry -= dy;

                //Find the offset that we can use to fetch color and height data from
                let mapOffset = ((colorMap.width * Math.floor(ry & (colorMap.height-1))) + Math.floor(rx & (colorMap.width-1))) * 4;

                let heightOnScreen = Math.floor((camera.altitude - heightMapData[mapOffset]) / z * scalingFactor);

                if(heightOnScreen < 0) {
                    heightOnScreen = 0;
                }

                if(heightOnScreen > canvasHeight) {
                    heightOnScreen = canvasHeight -1;
                }

                if(heightOnScreen < maxHeightOnScreen) {
                    for(let y = heightOnScreen; y < maxHeightOnScreen; y++) {
                        let index = ((canvasWidth * y) + i) * 4;

                        data[index] = colorMapData[mapOffset];
                        data[index + 1] = colorMapData[mapOffset + 1];
                        data[index + 2] = colorMapData[mapOffset + 2];

                        //Alpha
                        data[index + 3] = 255;
                    }
                    maxHeightOnScreen = heightOnScreen;
                }

            }
        }


        ctx.putImageData(imageData, 0, 0);

    }

    const clearImageData = (data: Uint8ClampedArray) => {
        for(let i = 0; i < data.length; i++) {
            data[i] = 0;
        }
    }

    const init = (e: Event) => {
        console.log("Init: ", e.target);
        imagesLoaded++;

        if (imagesLoaded >= 2) {
            start();
        }
    }


}