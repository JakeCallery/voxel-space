export interface Camera  {
    x: number,
    y: number,
    altitude: number,
    zFar: number,
    angle: number, //Radians, clockwise
    horizon: number, //offset to pitch up and down
    rollFactor: number,
    fbSpeed: number,

    lrSpeed: number,
}