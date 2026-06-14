import { state } from './state.js';
import { updateSVGBySelection } from './svg.js';
import { loadTypeData } from './data.js';
import { configureSelect, updateDropdownVisibility } from './ui_controls.js';

// =====================================================================
// HÀM: NẠP DỮ LIỆU LẦN ĐẦU KHI CHỌN TIÊU CHUẨN MỚI
// =====================================================================
export async function initStandard(groupKey) {
    const data = state.currentStandardData[groupKey];
    if(!data) return;

    // Nạp các danh sách mặc định từ file data.json (Menu chính)
    configureSelect("typeSel", "typeGroup", data.types);
    configureSelect("classSel", "classGroup", data.classes);
    configureSelect("faceSel", "faceGroup", data.faces);
    configureSelect("schSel", "schGroup", data.schedules);

    const firstType = document.getElementById("typeSel").value;
    if (firstType) await fetchAndApplyTypeData(firstType);
}

// =====================================================================
// HÀM: TẢI FILE JSON CỦA TỪNG LOẠI VÀ CẬP NHẬT GIAO DIỆN
// =====================================================================
export async function fetchAndApplyTypeData(type) {
    const success = await loadTypeData(type);
    if (success) { 
        updateDynamicDropdowns(); // Tính toán lại các ô Size
        updateSVGBySelection();   // Gọi bản vẽ hiển thị
    } else { 
        document.getElementById("svgContainer").innerHTML = `<p style="color:red;">Thiếu file dữ liệu chi tiết.</p>`; 
    }
}

// =====================================================================
// HÀM: LỌC DANH SÁCH SIZE TỪ BẢNG DỮ LIỆU EXCEL/JSON
// =====================================================================
export function updateDynamicDropdowns() {
    const type = document.getElementById("typeSel").value;
    const tableData = state.currentTypeData; 
    
    // Nếu bảng dữ liệu chưa tải xong hoặc bị lỗi thì dừng lại
    if (!tableData || !Array.isArray(tableData)) return;

    // Lọc lấy danh sách các Size của Type đang chọn, loại bỏ trùng lặp bằng new Set()
    const availableSizes = [...new Set(tableData
        .filter(row => row.Type === type)
        .map(row => String(row.NPS))
    )];

    configureSelect("sizeSel", "sizeGroup", availableSizes);

    // BƯỚC 1: Gọi hàm từ ui_controls.js để quét xem cấu kiện này có được hiện Small Size không
    updateDropdownVisibility(type);

    // BƯỚC 2: Kiểm tra lại giao diện
    const smallsizeGroup = document.getElementById("smallsizeGroup");
    
    if (smallsizeGroup.style.display !== "none") {
        // Nếu Bảng điều khiển cho phép hiện -> Bắt đầu lọc dữ liệu Small Size đổ vào
        updateSmallSizeDropdown(tableData, type);
    } else {
        // Nếu Bảng điều khiển cấm hiện (như đang chọn Elbow) -> Xóa sạch rác dữ liệu cũ trong ô
        document.getElementById("smallsizeSel").innerHTML = "";
    }
}

// =====================================================================
// HÀM: LỌC DANH SÁCH SMALL SIZE RIÊNG CHO BẦU GIẢM/TÊ GIẢM
// =====================================================================
export function updateSmallSizeDropdown(tableData, type) {
    const size = document.getElementById("sizeSel").value;
    if (!tableData) tableData = state.currentTypeData;

    // Quét bảng dữ liệu, tìm dòng nào khớp cả Type và Size (NPS) đang chọn
    const availableSmallSizes = [...new Set(tableData
        .filter(row => row.Type === type && String(row.NPS) === String(size))
        .map(row => String(row.Small_NPS))
    )];

    // Nếu tìm thấy kích thước nhỏ thì đổ vào giao diện, không thì xóa trắng
    if (availableSmallSizes.length > 0) {
        configureSelect("smallsizeSel", "smallsizeGroup", availableSmallSizes);
    } else {
        document.getElementById("smallsizeSel").innerHTML = "";
    }
}