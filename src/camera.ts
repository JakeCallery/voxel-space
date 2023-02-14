export interface Camera  {
    x: number,
    y: number,
    altitude: number,
    altitudeSpeed: number,
    targetAltitudeSpeed: number,
    zFar: number,
    angle: number, //Radians, clockwise
    angleSpeed: number,
    targetAngleSpeed: number,
    horizon: number, //offset to pitch up and down
    targetHorizon: number,
    rollFactor: number,
    targetRollFactor: number,
    fbSpeed: number,

    lrSpeed: number,
    isMovingForward: boolean,
    isMovingLeft: boolean,

    targetFBSpeed: number,
    targetLRSpeed: number,

}