import { state } from './state.js';
import { loadStandardData } from './data.js';
import { updateSVGBySelection } from './svg.js';
import { updateUI, updateSmallSizeDropdown, fetchAndApplyTypeData } from './ui.js';

window.toggleMenu = function(btn) {
    btn.nextElementSibling.classList.toggle("show");
};

document.querySelectorAll(".submenu-item").forEach(item => {
    item.addEventListener("click", () => {
        const fileName = item.getAttribute("data-file");
        state.currentGroup = item.getAttribute("data-group");
        state.currentCategory = item.getAttribute("data-category"); 
        loadStandardData(fileName, state.currentGroup);
    });
});

document.querySelectorAll(".toolbar select").forEach(sel => {
    sel.addEventListener("change", () => {
        if (sel.id === "typeSel") {
            fetchAndApplyTypeData(sel.value); 
            return; 
        } 
        else if (sel.id === "sizeSel") {
            if (document.getElementById("smallsizeGroup").style.display !== "none") {
                updateSmallSizeDropdown();
            }
        }

        if(sel.id === "faceSel"){ updateSVGBySelection(); } 
        else { updateUI(); }
    });
});