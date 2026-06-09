import { state } from './state.js';
import { updateUI } from './ui.js';

export function updateSVGBySelection() {
    const typeVisible = document.getElementById("typeGroup").style.display !== "none";
    const faceVisible = document.getElementById("faceGroup").style.display !== "none";

    const type = typeVisible ? document.getElementById("typeSel").value : "";
    const face = faceVisible ? document.getElementById("faceSel").value : "";
    if (!type) return;

    let svgPath = "";
    if (state.currentCategory === "flg") {
        svgPath = `./svg/flg/FL-${type}`;
        if (face) svgPath += `-${face}`;
        svgPath += `.svg`;
    } else if (state.currentCategory === "fits") {
        svgPath = `./svg/fits/${type}.svg`;
    }
    loadSVG(svgPath);
}

export async function loadSVG(url){
    const container = document.getElementById("svgContainer");
    if(state.svgCache[url]){
        container.innerHTML = state.svgCache[url];
        state.svgElement = container.querySelector("svg");
        prepareSVG(); updateUI(); return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        const svgText = await response.text();
        state.svgCache[url] = svgText;
        container.innerHTML = svgText;
        state.svgElement = container.querySelector("svg");
        prepareSVG(); updateUI();
    } catch(err) {
        container.innerHTML = `<p style="color:red;">Chưa có file SVG tại: ${url}</p>`;
        state.svgElement = null;
    }
}

export function prepareSVG(){
    if (!state.svgElement) return;
    const validKeys = ["HDSE","PID","LEN","RFD","BCD","FDIA","BHD","FTHK","RFLEN","THK","CENTER_TO_FACE","OD","BOLT_HOLE_INFO","DAN","RTJD","RTJDE"];
    state.svgElement.querySelectorAll("text,tspan").forEach(el => {
        const txt = el.textContent.trim();
        if(validKeys.includes(txt)){ el.setAttribute("data-key", txt); }
        el.style.fontSize = state.BASE_FONT_SIZE + "px";
        el.style.fontWeight = "bold";
    });
}