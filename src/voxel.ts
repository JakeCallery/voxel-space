import {Camera} from "./camera";

export function setupCanvas(canvas: HTMLCanvasElement) {

    let imagesLoaded = 0;
    const colorMap = new Image();
    const heightMap = new Image();

    colorMap.src = './assets/colorMap.png';
    heightMap.src = './assets/heightMap.png';

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ctx = canvas.getContext("2d")!;

    const imageData = ctx!.getImageData(0,0, canvasWidth, canvasHeight);
    const data = imageData.data;

    let isDone = false;
    let gVal = 0;

    const camera = <Camera> {
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

        updateInputs();
        updateState();
        drawScreen();

        if(!isDone) {
            window.requestAnimationFrame(step)
        }
    }

    const updateInputs = () => {

    }

    const updateState = () => {
        // gVal = (gVal + 1) % 255
        gVal = 255;
    }

    const drawScreen = () => {
        for(let i = 0; i < data.length; i+=4) {

            data[i] = 0;
            data[i+1] = gVal;
            data[i+2] = 0;
            data[i+3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

    }

    const init = (e: Event) => {
        console.log("Init: ", e.target);
        imagesLoaded++;

        if(imagesLoaded >= 2) {
            start();
        }
    }


}