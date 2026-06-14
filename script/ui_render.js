import { state } from './state.js';

// =====================================================================
// HÀM: TÌM SỐ LIỆU VÀ ĐỔ VÀO GIAO DIỆN / BẢN VẼ
// =====================================================================
export function updateUI() {
    if(!state.currentGroup || !state.svgElement) return;

    // Lấy thông tin người dùng đang chọn trên giao diện
    const data = state.currentStandardData[state.currentGroup];
    const type = document.getElementById("typeSel").value;
    const size = document.getElementById("sizeSel").value;
    const cls = document.getElementById("classSel").value;
    const sch = document.getElementById("schSel").value;
    
    // Kiểm tra xem ô Small Size có đang mở không, nếu có thì lấy giá trị của nó
    const isSmallSizeVisible = document.getElementById("smallsizeGroup").style.display !== "none";
    const smallsize = isSmallSizeVisible ? document.getElementById("smallsizeSel").value : "";
    const typeName = document.getElementById("typeSel").selectedOptions[0]?.text || "";

    // Cập nhật dòng Tiêu đề lớn (Ví dụ: ASME B16.9 - 90° Elbow (Size: 4"))
    let titleText = `${data.title} - ${typeName} (Size: ${size}`;
    if (isSmallSizeVisible && smallsize) titleText += ` x ${smallsize}`; // Thêm x đuôi cho Bầu giảm
    document.getElementById("mainTitle").innerText = titleText + `")`;

    const tableData = state.currentTypeData;
    let dims = null; // dims sẽ chứa dòng dữ liệu tìm được

    // ==========================================
    // THUẬT TOÁN TÌM KIẾM ĐA ĐIỀU KIỆN (VLOOKUP)
    // ==========================================
    if (Array.isArray(tableData)) {
        // Quét từng dòng (row) trong bảng JSON
        dims = tableData.find(row => {
            // Điều kiện 1: Type và Size phải khớp
            let match = (row.Type === type) && (String(row.NPS) === String(size));
            
            // Điều kiện 2: Nếu có ô Class thì Class phải khớp
            if (document.getElementById("classGroup").style.display !== "none" && cls) {
                match = match && (String(row.Class) === String(cls));
            }
            // Điều kiện 3: Nếu có ô Small Size thì Small Size phải khớp
            if (isSmallSizeVisible && smallsize) {
                match = match && (String(row.Small_NPS) === String(smallsize));
            }
            
            return match; // Trả về dòng thỏa mãn tất cả điều kiện
        });
    }

    // ==========================================
    // IN DỮ LIỆU RA BẢN VẼ (NẾU TÌM THẤY DÒNG ĐÓ)
    // ==========================================
    if(dims){
        // 1. In vào các Dim (Kích thước) trên bản vẽ SVG
        state.svgElement.querySelectorAll("[data-key]").forEach(el => {
            const key = el.getAttribute("data-key");
            
            // Đọc độ dày theo giá trị Sch (ví dụ lấy cột "STD" hoặc "XS")
            if (key === "THK" && dims[sch] !== undefined) {
                el.textContent = dims[sch];
            } 
            // Đọc các giá trị kích thước tĩnh khác
            else if(dims[key] !== undefined){
                el.textContent = dims[key];
            }
        });

        // 2. In vào các Góc hiển thị (Lớp phủ thông tin thêm)
        const topInfo = document.getElementById("infoTopLeft");
        const botLeftInfo = document.getElementById("infoBottomLeft");
        const botRightInfo = document.getElementById("infoBottomRight");
        
        // Reset góc chữ
        topInfo.innerHTML = ""; botLeftInfo.innerHTML = ""; botRightInfo.innerHTML = "";

        if(dims["WEIGHT"] !== undefined) topInfo.innerHTML += `<div>Flange Wt = ${dims["WEIGHT"]} kg</div>`;
        if(dims["BOLT_WEIGHT"] !== undefined) topInfo.innerHTML += `<div>S/Bolts and Nuts = ${dims["BOLT_WEIGHT"]} kg</div>`;
        if(dims["PAINT_AREA"] !== undefined) topInfo.innerHTML += `<div>Paint Area = ${dims["PAINT_AREA"]} m²</div>`;
        
        if(dims["BOLT_HOLE_INFO"] !== undefined) botLeftInfo.innerHTML += `<div>Bolt Hole : ${dims["BOLT_HOLE_INFO"]}</div>`;
        if(dims["BOLT_SIZE_RF"] !== undefined) botLeftInfo.innerHTML += `<div>StudBolt Size : ${dims["BOLT_SIZE_RF"]}</div>`;
        if(dims["BOLT_SIZE_RTJ"] !== undefined) botLeftInfo.innerHTML += `<div>StudBolt Size : ${dims["BOLT_SIZE_RTJ"]}</div>`;
        
        
        if(data.title) botRightInfo.innerHTML = data.title;
    }
}