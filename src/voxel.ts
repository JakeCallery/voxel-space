import {Camera} from "./camera";
import {DrawState} from "./drawstate";

export function setupCanvas(canvas: HTMLCanvasElement) {

    let imagesLoaded = 0;
    const colorMap = new Image();
    const heightMap = new Image();

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

    let isRunning = false;
    let gVal = 0;

    const camera = <Camera>{
        x: 512,
        y: 512,
        zFar: 400
    }

    colorMap.onload = (evt) => {
        init(evt);
    }

    heightMap.onload = (evt) => {
        init(evt);
    }

    const start = () => {
        console.log("Start");

        //Start the game loop
        step()

    }

    const step = () => {

        console.log("Step");
        updateInputs();
        updateStates(camera, drawState);
        drawScreen(camera, drawState);

        isRunning = false;
        if (isRunning) {
            window.requestAnimationFrame(step)
        }
    }

    const updateInputs = () => {

    }

    const updateStates = (camera: Camera, ds: DrawState) => {
        // gVal = (gVal + 1) % 255
        gVal = 255;

        //Draw State update
        ds.plx = -camera.zFar;
        ds.ply = camera.zFar;
        ds.prx = camera.zFar
        ds.pry = camera.zFar;

    }

    const drawScreen = (camera: Camera, ds: DrawState) => {
        // for(let i = 0; i < data.length; i+=4) {
        //     data[i] = 0;
        //     data[i+1] = gVal;
        //     data[i+2] = 0;
        //     data[i+3] = 255;
        // }

        let xSegment = (ds.prx - ds.plx) / canvasWidth;
        let ySegment = (ds.pry - ds.ply) / canvasWidth;

        for (let i = 0; i < canvasWidth; i++) {
            //Calc slope from camera to far point at zfar length
            let dx = (ds.plx + (xSegment * i)) / camera.zFar;
            let dy = (ds.ply + (ySegment * i)) / camera.zFar;

            //Ray Base
            let rx = camera.x;
            let ry = camera.y;

            for (let z = 1; z < camera.zFar; z++) {
                rx += dx;
                ry -= dy;

                let index = (canvasWidth * Math.floor(ry/4) + Math.floor(rx/4)) * 4;
                data[index] = 0;
                data[index + 1] = gVal;
                data[index + 2] = 0;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

    }

    const init = (e: Event) => {
        console.log("Init: ", e.target);
        imagesLoaded++;

        if (imagesLoaded >= 2) {
            start();
        }
    }


}