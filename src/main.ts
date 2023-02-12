import './style.css'
import {setupCanvas } from './voxel'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="voxelCanvas" width="320" height="200"></canvas>
  </div>
`
setupCanvas(document.querySelector<HTMLCanvasElement>('#voxelCanvas')!)
