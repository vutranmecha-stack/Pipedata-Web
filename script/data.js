import { state } from './state.js';
import { initStandard } from './ui.js';

export function loadStandardData(fileName, groupKey) {
    document.getElementById("svgContainer").innerHTML = "<p>Đang tải Menu tiêu chuẩn...</p>";
    
    // Tải file trực tiếp từ thư mục data/ (ví dụ: ./data/data.json)
    fetch(`./data/${fileName}.json`)
        .then(response => { if (!response.ok) throw new Error("JSON Error"); return response.json(); })
        .then(data => { state.currentStandardData = data; initStandard(groupKey); })
        .catch(error => { document.getElementById("svgContainer").innerHTML = `<p style="color:red;">Lỗi tải menu JSON.</p>`; });
}

export async function loadTypeData(type) {
    const data = state.currentStandardData[state.currentGroup];

    // Xác định tên file nhỏ cần tải dựa vào fileMapping
    let fileName = type; 
    if (data.fileMapping && data.fileMapping[type]) { 
        fileName = data.fileMapping[type]; 
    }

    try {
        // Tải file trực tiếp từ thư mục data/ (ví dụ: ./data/Elbow.json hoặc ./data/Flange.json)
        const response = await fetch(`./data/${fileName}.json`);
        if (!response.ok) throw new Error("File not found");
        state.currentTypeData = await response.json();
        return true;
    } catch (error) {
        state.currentTypeData = null;
        return false;
    }
}