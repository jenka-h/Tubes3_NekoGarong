// Background worker mas brooo
// Cari tahu sendiri ini apaan
// Yang jelas selalu aktif
// Digunakan untuk passing data

chrome.action.onClicked.addListener((tab) => {
    console.log(`[Background] Action icon clicked on tab: ${tab.id}`);
});