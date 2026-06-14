import { state } from './state.js';
import { loadStandardData } from './data.js';
import { updateSVGBySelection } from './svg.js';
import { fetchAndApplyTypeData, updateSmallSizeDropdown } from './ui_dropdowns.js';
import { updateUI } from './ui_render.js';
import { updateDropdownVisibility } from './ui_controls.js'; // Nhập hàm điều khiển

window.toggleMenu = function(btn) {
    btn.nextElementSibling.classList.toggle("show");
};

// 1. Xử lý khi click vào Menu trái
document.querySelectorAll(".submenu-item").forEach(item => {
    item.addEventListener("click", () => {
        const fileName = item.getAttribute("data-file");
        state.currentGroup = item.getAttribute("data-group");
        state.currentCategory = item.getAttribute("data-category"); 
        loadStandardData(fileName, state.currentGroup);
    });
});

// 2. Xử lý khi anh đổi các ô Dropdown phía trên Toolbar
document.querySelectorAll(".toolbar select").forEach(sel => {
    sel.addEventListener("change", () => {
        
        // NẾU ANH VỪA ĐỔI LOẠI CẤU KIỆN (TYPE)
        if (sel.id === "typeSel") {
            // ---> KÍCH HOẠT ÉP ẨN/HIỆN NGAY LẬP TỨC <---
            updateDropdownVisibility(sel.value); 
            
            // Sau khi giao diện đã sạch sẽ mới đi lấy dữ liệu JSON
            fetchAndApplyTypeData(sel.value); 
            return; 
        } 
        
        // NẾU ANH VỪA ĐỔI KÍCH THƯỚC CHÍNH (SIZE)
        else if (sel.id === "sizeSel") {
            // Nếu ô Small Size đang hiển thị thì mới cập nhật dữ liệu cho nó
            if (document.getElementById("smallsizeGroup").style.display !== "none") {
                updateSmallSizeDropdown();
            }
        }

        // Nếu đổi Face thì vẽ lại hình, còn lại thì in lại số
        if(sel.id === "faceSel"){ 
            updateSVGBySelection(); 
        } else { 
            updateUI(); 
        }
    });
});

// 3. Tự động load tiêu chuẩn đầu tiên khi vừa mở trang
window.addEventListener('DOMContentLoaded', () => {
    state.currentGroup = "ASME_B16_5";
    state.currentCategory = "flg";
    loadStandardData("data", state.currentGroup);
});