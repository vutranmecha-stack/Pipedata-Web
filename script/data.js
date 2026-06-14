import { state } from './state.js';
import { initStandard } from './ui_dropdowns.js';

export function loadStandardData(fileName, groupKey) {
    document.getElementById("svgContainer").innerHTML = "<p>Đang tải Menu tiêu chuẩn...</p>";
    fetch(`./data/${fileName}.json`)
        .then(response => { if (!response.ok) throw new Error("JSON Error"); return response.json(); })
        .then(data => { state.currentStandardData = data; initStandard(groupKey); })
        .catch(error => { document.getElementById("svgContainer").innerHTML = `<p style="color:red;">Lỗi tải menu JSON.</p>`; });
}

export async function loadTypeData(type) {
    const data = state.currentStandardData[state.currentGroup];
    let fileName = type; 
    if (data.fileMapping && data.fileMapping[type]) fileName = data.fileMapping[type]; 

    try {
        const response = await fetch(`./data/${fileName}.json`);
        if (!response.ok) throw new Error("File not found");
        state.currentTypeData = await response.json();
        return true;
    } catch (error) {
        state.currentTypeData = null;
        return false;
    }
}