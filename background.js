// По умолчанию скрываем кнопку
chrome.action.disable();

// При обновлении вкладки включаем кнопку только на нужных страницах
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.startsWith("https://apimonster.ru/ozon/orders/")) {
        chrome.action.enable(tabId);
    } else {
        chrome.action.disable(tabId);
    }
});

// Обработка клика по кнопке расширения
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            try {
                const rows = document.querySelectorAll("tr");
                let selectedCount = 0;
                let alreadyCheckedCount = 0;

                rows.forEach((row) => {
                    const statusCell = row.querySelector("td:nth-child(4)");
                    const barcodeCell = row.querySelector("td:nth-child(6)");
                    const checkbox = row.querySelector("input.ozon_order_checkbox");

                    const hasBarcodeLink = barcodeCell?.querySelector("a");
                    const wasRequested = barcodeCell?.innerText.includes("Был запрос");

                    if (
                        statusCell &&
                        barcodeCell &&
                        checkbox &&
                        !checkbox.disabled &&
                        statusCell.textContent.trim() === "awaiting_deliver" &&
                        hasBarcodeLink &&
                        !wasRequested
                    ) {
                        if (!checkbox.checked) {
                            checkbox.click(); // Эмуляция клика
                            selectedCount++;
                        } else {
                            alreadyCheckedCount++;
                        }
                    }
                });

                const total = selectedCount + alreadyCheckedCount;

                alert(
                    `✅ Галочки установлены для ${selectedCount} заказов.\n` +
                    `ℹ️ Уже были установлены: ${alreadyCheckedCount} заказов.\n` +
                    `📦 Общее количество отмеченных заказов: ${total}`
                );
            } catch (error) {
                alert(`❌ Произошла ошибка: ${error.message}`);
            }
        }
    });
});
