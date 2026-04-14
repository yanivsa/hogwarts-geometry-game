const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const code = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock context 2D
window.HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => {
      return  { data: new Array(w*h*4) };
    },
    putImageData: () => {},
    createImageData: () => { return [] },
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => { return { width: 0 }; },
    transform: () => {},
    rect: () => {},
    clip: () => {},
    createLinearGradient: () => {
      return { addColorStop: () => {} };
    }
  };
};

try {
    window.eval(code);
    window.eval(`
        // Call initialization manually
        initialize();
        // Start stage 1
        startStage(0);
        console.log("Stage started, question loaded.");
    `);
} catch(e) {
    console.error(e);
}
