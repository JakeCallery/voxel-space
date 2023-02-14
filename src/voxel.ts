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

    const keyState = <KeyState>{
        arrowUp: false,
        arrowDown: false,
        arrowLeft: false,
        arrowRight: false,
        elevationDown: false,
        elevationUp: false,
        rotateLeft: false,
        rotateRight: false
    }

    let isRunning = true;

    const camera = <Camera>{
        x: 500,
        y: 512,
        altitude: 150,
        zFar: 400,
        angle: 1.5 * Math.PI,
        horizon: 50
    }

    colorMap.onload = (evt) => {
        let canvas = document.createElement('canvas');
        canvas.width = colorMap.naturalWidth;
        canvas.height = colorMap.naturalHeight;
        let context = canvas.getContext('2d');
        context!.drawImage(colorMap, 0, 0);
        colorMapData = context!.getImageData(0, 0, canvas.width, canvas.height).data;
        init(evt);
    }

    heightMap.onload = (evt) => {
        let canvas = document.createElement('canvas');
        canvas.width = heightMap.naturalWidth;
        canvas.height = heightMap.naturalHeight;
        let context = canvas.getContext('2d');
        context!.drawImage(heightMap, 0, 0);
        heightMapData = context!.getImageData(0, 0, canvas.width, canvas.height).data;
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
                case "a":
                    keyState.rotateLeft = true;
                    break;
                case "d":
                    keyState.rotateRight = true;
                    break;
                case "r":
                    keyState.tiltDown = true;
                    break;
                case "f":
                    keyState.tiltUp = true;
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
                case "a":
                    keyState.rotateLeft = false;
                    break;
                case "d":
                    keyState.rotateRight = false;
                    break;
                case "r":
                    keyState.tiltDown = false;
                    break;
                case "f":
                    keyState.tiltUp = false;
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

        if (keyState.arrowUp) {
            console.log(camera.angle);
            camera.x += Math.cos(camera.angle);
            camera.y -= Math.sin(camera.angle);
        }

        if (keyState.arrowDown) {
            camera.x -= Math.cos(camera.angle);
            camera.y += Math.sin(camera.angle);
        }

        if (keyState.arrowLeft) {
            camera.x += Math.cos(camera.angle - (Math.PI/2));
            camera.y -= Math.sin(camera.angle - (Math.PI/2));
        }

        if (keyState.arrowRight) {
            camera.x -= Math.cos(camera.angle - (Math.PI/2));
            camera.y += Math.sin(camera.angle - (Math.PI/2));
        }

        if (keyState.elevationUp) {
            camera.altitude++;
        }

        if (keyState.elevationDown) {
            camera.altitude--;
        }
        if (keyState.rotateLeft) {
            camera.angle -= 0.01;
        }
        if (keyState.rotateRight) {
            camera.angle += 0.01;
        }

        if(keyState.tiltUp) {
            camera.horizon += 1.5;
        }

        if(keyState.tiltDown) {
            camera.horizon -= 1.5
        }

    }

    const updateStates = (camera: Camera, ds: DrawState) => {

        let sinAngle = Math.sin(camera.angle);
        let cosAngle = Math.cos(camera.angle);

        //Draw State update
        ds.plx = cosAngle * camera.zFar + sinAngle * camera.zFar;
        ds.ply = sinAngle * camera.zFar - cosAngle * camera.zFar;

        ds.prx = cosAngle * camera.zFar - sinAngle * camera.zFar;
        ds.pry = sinAngle * camera.zFar + cosAngle * camera.zFar

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
                let mapOffset = ((colorMap.width * Math.floor(ry & (colorMap.height - 1))) + Math.floor(rx & (colorMap.width - 1))) * 4;

                let projectedHeight = Math.floor((camera.altitude - heightMapData[mapOffset]) / z * scalingFactor + camera.horizon) ;

                if (projectedHeight < 0) {
                    projectedHeight = 0;
                }

                if (projectedHeight > canvasHeight) {
                    projectedHeight = canvasHeight - 1;
                }

                if (projectedHeight < maxHeightOnScreen) {
                    for (let y = projectedHeight; y < maxHeightOnScreen; y++) {
                        let index = ((canvasWidth * y) + i) * 4;

                        data[index] = colorMapData[mapOffset];
                        data[index + 1] = colorMapData[mapOffset + 1];
                        data[index + 2] = colorMapData[mapOffset + 2];

                        //Alpha
                        data[index + 3] = 255;
                    }
                    maxHeightOnScreen = projectedHeight;
                }

            }
        }


        ctx.putImageData(imageData, 0, 0);

    }

    const clearImageData = (data: Uint8ClampedArray) => {
        for (let i = 0; i < data.length; i++) {
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