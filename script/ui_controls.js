import { state } from './state.js';

// =====================================================================
// HÀM 1: ĐỔ DỮ LIỆU VÀO Ô CHỌN (DROPDOWN)
// Nhiệm vụ: Nhận mảng dữ liệu (ví dụ [2, 4, 6]) và tạo các thẻ <option>
// =====================================================================
export function configureSelect(selectId, groupId, values) {
    const sel = document.getElementById(selectId);
    const group = document.getElementById(groupId);
    
    // Kiểm tra xem dữ liệu có bị trống không
    const isEmpty = !values || (Array.isArray(values) && values.length === 0) || (typeof values === 'object' && Object.keys(values).length === 0);

    if (isEmpty) { 
        group.style.display = "none"; 
        sel.innerHTML = ""; 
    } else {
        group.style.display = "flex"; 
        sel.innerHTML = "";
        if(Array.isArray(values)){ 
            values.forEach(v => sel.add(new Option(v, v))); 
        } else { 
            Object.entries(values).forEach(([k, v]) => sel.add(new Option(v, k))); 
        }
    }
}

// =====================================================================
// HÀM 2: CÔNG TẮC ĐIỀU KHIỂN ẨN/HIỆN DỨT KHOÁT
// Nhiệm vụ: Ép các ô (Class, Sch, Small Size) phải Tuân Lệnh theo Loại (Type)
// =====================================================================
export function updateDropdownVisibility(type) {
    const classGroup = document.getElementById("classGroup");
    const schGroup = document.getElementById("schGroup");
    const smallsizeGroup = document.getElementById("smallsizeGroup");

    // Chuyển tên Type sang IN HOA để so sánh (tránh lỗi viết hoa/thường)
    // Ví dụ: "BW-90LR-Elbow" sẽ thành "BW-90LR-ELBOW"
    const safeType = type ? type.toUpperCase() : "";

    // ----------------------------------------------------------
    // [KHU VỰC CỦA ANH] - TỪ ĐIỂN CẤU HÌNH ĐIỀU KIỆN
    // Anh có thể thêm từ khóa của vật tư mới vào 2 danh sách này:
    // ----------------------------------------------------------
    
    // Danh sách 1: Các loại phụ kiện BẮT BUỘC PHẢI HIỆN "Small Size"
    const tuKhoaCanSmallSize = ["REDUCER", "TEE"]; 
    
    // Danh sách 2: Các loại Mặt bích KHÔNG CẦN hiện độ dày "Sch"
    const tuKhoaKhongCanSch = ["SO", "BLIND"];

    // Máy tính tự dò tìm xem Type hiện tại có chứa các từ khóa trên không (Trả về true/false)
    const isNeedSmallSize = tuKhoaCanSmallSize.some(tuKhoa => safeType.includes(tuKhoa));
    const isKhongCanSch = tuKhoaKhongCanSch.some(tuKhoa => safeType.includes(tuKhoa));

    // ----------------------------------------------------------
    // THỰC THI LỆNH ẨN / HIỆN LÊN MÀN HÌNH
    // ----------------------------------------------------------

    // NẾU ĐANG Ở MENU MẶT BÍCH (FLANGES)
    if (state.currentCategory === "flg") {
        classGroup.style.display = "flex";     // Mặt bích luôn dùng Class
        smallsizeGroup.style.display = "none"; // Mặt bích KHÔNG BAO GIỜ có Small Size -> ÉP ẨN NGAY
        document.getElementById("smallsizeSel").innerHTML = "";

        // Kiểm tra xem bích này có nằm trong danh sách cấm dùng Sch không
        if (isKhongCanSch) schGroup.style.display = "none"; 
        else schGroup.style.display = "flex"; 
    } 
    
    // NẾU ĐANG Ở MENU PHỤ KIỆN (FITTINGS)
    else if (state.currentCategory === "fits") {
        classGroup.style.display = "none"; // Phụ kiện hàn không dùng Class -> ÉP ẨN NGAY
        schGroup.style.display = "flex";   // Phụ kiện hàn luôn phải có Sch

        // Kiểm tra xem Phụ kiện này có nằm trong danh sách được phép dùng Small Size không
        if (isNeedSmallSize) {
            smallsizeGroup.style.display = "flex"; // Cho phép HIỆN
        } else {
            smallsizeGroup.style.display = "none"; // ÉP ẨN DỨT KHOÁT (Giải quyết triệt để lỗi của anh)
            document.getElementById("smallsizeSel").innerHTML = ""; // Quét sạch dữ liệu cũ
        }
    }
}