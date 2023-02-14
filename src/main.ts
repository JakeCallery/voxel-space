import './style.css'
import {setupCanvas } from './voxel'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="voxelCanvas" width="320" height="200"></canvas>
`
setupCanvas(document.querySelector<HTMLCanvasElement>('#voxelCanvas')!)
