import { state } from './state.js';
import { updateSVGBySelection } from './svg.js';
import { loadTypeData } from './data.js';

export async function initStandard(groupKey) {
    const data = state.currentStandardData[groupKey];
    if(!data) return;

    // Tải các menu cố định từ Sổ tay (data.json)
    configureSelect("typeSel", "typeGroup", data.types);
    configureSelect("classSel", "classGroup", data.classes);
    configureSelect("faceSel", "faceGroup", data.faces);
    configureSelect("schSel", "schGroup", data.schedules);

    const firstType = document.getElementById("typeSel").value;
    if (firstType) await fetchAndApplyTypeData(firstType);
}

export async function fetchAndApplyTypeData(type) {
    const success = await loadTypeData(type);
    if (success) { 
        updateDynamicDropdowns(); 
        updateSVGBySelection(); 
    } else { 
        document.getElementById("svgContainer").innerHTML = `<p style="color:red;">Thiếu file dữ liệu chi tiết.</p>`; 
    }
}

// LỌC DANH SÁCH SIZE TỪ BẢNG DỮ LIỆU
export function updateDynamicDropdowns() {
    const type = document.getElementById("typeSel").value;
    const tableData = state.currentTypeData; 
    
    // Đảm bảo dữ liệu là dạng Mảng (Bảng phẳng)
    if (!tableData || !Array.isArray(tableData)) return;

    // Lọc ra các dòng đúng Type, sau đó gom các Size (NPS) lại, loại bỏ trùng lặp
    const availableSizes = [...new Set(tableData
        .filter(row => row.Type === type)
        .map(row => String(row.NPS))
    )];

    configureSelect("sizeSel", "sizeGroup", availableSizes);

    // Xử lý hiện Small Size cho Bầu giảm / Tê giảm
    const smallsizeGroup = document.getElementById("smallsizeGroup");
    if (state.currentCategory === "fits" && (type.includes("Reducer") || type.includes("TEE"))) {
        smallsizeGroup.style.display = "flex";
        updateSmallSizeDropdown(tableData, type);
    } else {
        smallsizeGroup.style.display = "none";
        document.getElementById("smallsizeSel").innerHTML = "";
    }
    
    updateDropdownVisibility(type);
}

// LỌC DANH SÁCH SMALL SIZE TỪ BẢNG DỮ LIỆU
export function updateSmallSizeDropdown(tableData, type) {
    const size = document.getElementById("sizeSel").value;
    if (!tableData) tableData = state.currentTypeData;

    // Lọc ra các dòng đúng Type & đúng NPS -> Gom các Small_NPS lại
    const availableSmallSizes = [...new Set(tableData
        .filter(row => row.Type === type && String(row.NPS) === String(size))
        .map(row => String(row.Small_NPS))
    )];

    if (availableSmallSizes.length > 0) {
        configureSelect("smallsizeSel", "smallsizeGroup", availableSmallSizes);
    } else {
        document.getElementById("smallsizeSel").innerHTML = "";
    }
}

export function updateDropdownVisibility(type) {
    const schGroup = document.getElementById("schGroup");
    const classGroup = document.getElementById("classGroup");

    if (state.currentCategory === "flg") {
        classGroup.style.display = "flex"; // Flange luôn có Class
        if (type === "SO" || type === "BLIND") schGroup.style.display = "none"; 
        else schGroup.style.display = "flex"; 
    } else if (state.currentCategory === "fits") {
        classGroup.style.display = "none"; // Fittings B16.9 không dùng Class
        schGroup.style.display = "flex";
    }
}

export function configureSelect(selectId, groupId, values) {
    const sel = document.getElementById(selectId);
    const group = document.getElementById(groupId);
    const isEmpty = !values || (Array.isArray(values) && values.length === 0) || (typeof values === 'object' && Object.keys(values).length === 0);

    if (isEmpty) { group.style.display = "none"; sel.innerHTML = ""; } 
    else {
        group.style.display = "flex"; sel.innerHTML = "";
        if(Array.isArray(values)){ values.forEach(v => sel.add(new Option(v, v))); } 
        else { Object.entries(values).forEach(([k, v]) => sel.add(new Option(v, k))); }
    }
}

// TÌM KIẾM THEO ĐIỀU KIỆN (VLOOKUP) VÀ HIỂN THỊ
export function updateUI() {
    if(!state.currentGroup || !state.svgElement) return;

    const data = state.currentStandardData[state.currentGroup];
    const type = document.getElementById("typeSel").value;
    const size = document.getElementById("sizeSel").value;
    const cls = document.getElementById("classSel").value;
    const sch = document.getElementById("schSel").value;
    
    const isSmallSizeVisible = document.getElementById("smallsizeGroup").style.display !== "none";
    const smallsize = isSmallSizeVisible ? document.getElementById("smallsizeSel").value : "";
    const typeName = document.getElementById("typeSel").selectedOptions[0]?.text || "";

    // Cập nhật tiêu đề hiển thị
    let titleText = `${data.title} - ${typeName} (Size: ${size}`;
    if (isSmallSizeVisible && smallsize) titleText += ` x ${smallsize}`;
    document.getElementById("mainTitle").innerText = titleText + `")`;

    // TRUY VẤN BẢNG DỮ LIỆU: Tìm dòng thỏa mãn TẤT CẢ điều kiện
    const tableData = state.currentTypeData;
    let dims = null;

    if (Array.isArray(tableData)) {
        dims = tableData.find(row => {
            // Điều kiện cơ bản bắt buộc: Type và Size
            let match = (row.Type === type) && (String(row.NPS) === String(size));
            
            // Điều kiện mở rộng: Class (Chỉ xét nếu cột Class có tồn tại trên giao diện)
            if (document.getElementById("classGroup").style.display !== "none" && cls) {
                match = match && (String(row.Class) === String(cls));
            }
            
            // Điều kiện mở rộng: Small Size (Chỉ xét nếu đang chọn Bầu giảm)
            if (isSmallSizeVisible && smallsize) {
                match = match && (String(row.Small_NPS) === String(smallsize));
            }
            
            return match;
        });
    }

    // NẾU TÌM THẤY DÒNG DỮ LIỆU ĐÓ -> ĐỔ VÀO BẢN VẼ
    if(dims){
        state.svgElement.querySelectorAll("[data-key]").forEach(el => {
            const key = el.getAttribute("data-key");
            
            // Nếu là độ dày Sch (như STD, XS), lấy cột tương ứng
            if (key === "THK" && dims[sch] !== undefined) {
                el.textContent = dims[sch];
            } else if(dims[key] !== undefined){
                el.textContent = dims[key];
            }
        });

        // Đổ thông số phụ trợ vào các góc màn hình
        const topInfo = document.getElementById("infoTopLeft");
        const botLeftInfo = document.getElementById("infoBottomLeft");
        const botRightInfo = document.getElementById("infoBottomRight");
        topInfo.innerHTML = ""; botLeftInfo.innerHTML = ""; botRightInfo.innerHTML = "";

        if(dims["WEIGHT"] !== undefined) topInfo.innerHTML += `<div>Flange Wt = ${dims["WEIGHT"]} kg</div>`;
        if(dims["BOLT_WEIGHT"] !== undefined) topInfo.innerHTML += `<div>S/Bolts and Nuts = ${dims["BOLT_WEIGHT"]} kg</div>`;
        if(dims["PAINT_AREA"] !== undefined) topInfo.innerHTML += `<div>Paint Area = ${dims["PAINT_AREA"]} m²</div>`;
        if(dims["BOLT_SIZE"] !== undefined) botLeftInfo.innerHTML += `<div>StudBolt Size : ${dims["BOLT_SIZE"]}</div>`;
        if(dims["BOLT_HOLE_INFO"] !== undefined) botLeftInfo.innerHTML += `<div>Bolt Hole : ${dims["BOLT_HOLE_INFO"]}</div>`;
        if(data.title) botRightInfo.innerHTML = data.title;
    }
}