import {Camera} from "./camera";
import {DrawState} from "./drawstate";
import {KeyState} from "./keystate";

export function setupCanvas(canvas: HTMLCanvasElement) {

    const SCALING_FACTOR = 100;
    const SKEW_FACTOR = 6;
    const BYTES_PER_PIXEL = 4;
    const HORIZON_DEFAULT = 50;
    const HORIZON_MIN = 30;
    const HORIZON_MAX = 70;
    const MAX_ROLL_FACTOR = 0.5;
    const PITCH_RATE = 2;
    const ROLL_RATE = 0.1;
    const SPEED_RATE = 0.1;
    const MAX_SPEED = 5;
    const ANGLE_RATE = 0.001;
    const MAX_ANGLE_SPEED = 0.02;
    const ALTITUDE_RATE = 0.2;
    const MAX_ALTITUDE_SPEED = 5;
    const HALF_PI = Math.PI/2;

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
    console.log("CanvasWidth: ", canvasWidth);
    console.log("CanvasHeight", canvasHeight);

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
        altitudeSpeed: 0,
        targetAltitudeSpeed: 0,
        zFar: 400,
        angle: 1.5 * Math.PI,
        angleSpeed: 0,
        targetAngleSpeed: 0,
        horizon: 50,
        targetHorizon: 50,
        rollFactor: 0,
        fbSpeed: 0,
        targetFBSpeed: 0,
        lrSpeed: 0,
        targetLRSpeed: 0,
        isMovingForward: true,
        isMovingLeft: true,
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
            camera.targetFBSpeed = MAX_SPEED;

            camera.targetHorizon = HORIZON_MIN;
        }

        if (keyState.arrowDown) {
            camera.targetFBSpeed = -MAX_SPEED;
            camera.targetHorizon = HORIZON_MAX;

        }

        if(!keyState.arrowUp && !keyState.arrowDown) {
            camera.targetFBSpeed = 0;
            camera.targetHorizon = HORIZON_DEFAULT;
        }

        if (keyState.arrowLeft) {
            camera.targetLRSpeed = MAX_SPEED;
            camera.targetRollFactor = MAX_ROLL_FACTOR;
        }

        if (keyState.arrowRight) {
            camera.targetLRSpeed = -MAX_SPEED;
            camera.targetRollFactor = -MAX_ROLL_FACTOR;
        }

        if(!keyState.arrowLeft && !keyState.arrowRight) {
            camera.targetLRSpeed = 0;
            camera.targetRollFactor = 0;
        }

        if (keyState.elevationUp) {
            camera.targetAltitudeSpeed = MAX_ALTITUDE_SPEED;
        }

        if (keyState.elevationDown) {
            camera.targetAltitudeSpeed = -MAX_ALTITUDE_SPEED;
        }
        if(!keyState.elevationUp && !keyState.elevationDown) {
            camera.targetAltitudeSpeed = 0;
        }

        if (keyState.rotateLeft) {
            camera.targetAngleSpeed = -MAX_ANGLE_SPEED;
        }
        if (keyState.rotateRight) {
            camera.targetAngleSpeed = MAX_ANGLE_SPEED;
        }

        if(!keyState.rotateLeft && !keyState.rotateRight) {
            camera.targetAngleSpeed = 0;
        }

    }

    const updateStates = (camera: Camera, ds: DrawState) => {

        let sinAngle = Math.sin(camera.angle);
        let cosAngle = Math.cos(camera.angle);

        //Handle Foward/Back Speed
        if(camera.fbSpeed < camera.targetFBSpeed) {
            camera.fbSpeed += SPEED_RATE;
            if(camera.fbSpeed > camera.targetFBSpeed) camera.fbSpeed = camera.targetFBSpeed;
        }
        if(camera.fbSpeed > camera.targetFBSpeed) {
            camera.fbSpeed -= SPEED_RATE;
            if(camera.fbSpeed < camera.targetFBSpeed) camera.fbSpeed = camera.targetFBSpeed;
        }
        camera.x += (cosAngle * camera.fbSpeed);
        camera.y += -(sinAngle * camera.fbSpeed);

        //Handle Forward/Backward tilt (horizon)
        if(camera.horizon < camera.targetHorizon) {
            camera.horizon += PITCH_RATE;
            if(camera.horizon > camera.targetHorizon) camera.horizon = camera.targetHorizon;
        }
        if(camera.horizon > camera.targetHorizon) {
            camera.horizon -= PITCH_RATE;
            if(camera.horizon < camera.targetHorizon) camera.horizon = camera.targetHorizon;
        }

        //Handle Left/Right Speed
        if(camera.lrSpeed > camera.targetLRSpeed) {
            camera.lrSpeed -= SPEED_RATE;
            if(camera.lrSpeed < camera.targetLRSpeed) camera.lrSpeed = camera.targetLRSpeed;
        }
        if(camera.lrSpeed < camera.targetLRSpeed) {
            camera.lrSpeed += SPEED_RATE;
            if(camera.lrSpeed > camera.targetLRSpeed) camera.lrSpeed = camera.targetLRSpeed;
        }
        camera.x += (Math.cos(camera.angle - HALF_PI) * camera.lrSpeed);
        camera.y += -(Math.sin(camera.angle - HALF_PI) * camera.lrSpeed);

        //Handle Roll
        if(camera.rollFactor < camera.targetRollFactor) {
            camera.rollFactor += ROLL_RATE;
            if(camera.rollFactor > camera.targetRollFactor) camera.rollFactor = camera.targetRollFactor;
        }
        if(camera.rollFactor > camera.targetRollFactor) {
            camera.rollFactor -= ROLL_RATE;
            if(camera.rollFactor < camera.targetRollFactor) camera.rollFactor = camera.targetRollFactor;
        }

        //Handle Angle/Spin
        if(camera.angleSpeed > camera.targetAngleSpeed) {
            camera.angleSpeed -= ANGLE_RATE;
            if(camera.angleSpeed < camera.targetAngleSpeed) camera.angleSpeed = camera.targetAngleSpeed;
        }
        if(camera.angleSpeed < camera.targetAngleSpeed) {
            camera.angleSpeed += ANGLE_RATE;
            if(camera.angleSpeed > camera.targetAngleSpeed) camera.angleSpeed = camera.targetAngleSpeed;
        }
        camera.angle += camera.angleSpeed;

        //Handle Altitude
        if(camera.altitudeSpeed > camera.targetAltitudeSpeed) {
            camera.altitudeSpeed -= ALTITUDE_RATE;
            if(camera.altitudeSpeed < camera.targetAltitudeSpeed) camera.altitudeSpeed = camera.targetAltitudeSpeed;
        }
        if(camera.altitudeSpeed < camera.targetAltitudeSpeed) {
            camera.altitudeSpeed += ALTITUDE_RATE;
            if(camera.altitudeSpeed > camera.targetAltitudeSpeed) camera.altitudeSpeed = camera.targetAltitudeSpeed;
        }
        camera.altitude += camera.altitudeSpeed;

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
                let mapOffset = ((colorMap.width * Math.floor(ry & (colorMap.height - 1))) + Math.floor(rx & (colorMap.width - 1))) * BYTES_PER_PIXEL;

                let projectedHeight = Math.floor((camera.altitude - heightMapData[mapOffset]) / z * SCALING_FACTOR + camera.horizon) ;

                if (projectedHeight < 0) {
                    projectedHeight = 0;
                }

                if (projectedHeight > canvasHeight) {
                    projectedHeight = canvasHeight - 1;
                }

                if (projectedHeight < maxHeightOnScreen) {
                    let lean = Math.floor((camera.rollFactor *(i / canvasWidth - 0.5) + 0.5) * canvasHeight / SKEW_FACTOR);
                    for (let y = (projectedHeight + lean); y < (maxHeightOnScreen + lean); y++) {
                        let index = ((canvasWidth * y) + i) * BYTES_PER_PIXEL;

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
        for (let i = 0; i < data.length; i+=BYTES_PER_PIXEL) {
            data[i] = 4;
            data[i+1] = 45;
            data[i+2] = 101;
            data[i+3] = 255;
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