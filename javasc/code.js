document.addEventListener('DOMContentLoaded', () => {
    // Componente menu
    const tabButtons = document.querySelector('.menu');
    const tabButtonsCount = tabButtons.childElementCount;

    // Componente tab-content
    const tabContent = document.querySelector('.tab-content');
    const tabContentCount = tabContent.childElementCount;

    // Asignando eventos a cada Tab Button
    for (let i = 0; i < tabButtonsCount; i++) {
        tabButtons.children[i].addEventListener('click', event => {
            let tabContentId = tabButtons.children[i].getAttribute('tab');
            mostrarContenido(i, tabContentId);
        });
    }

    function mostrarContenido(tabButtonIndex, tabContentId) {
        ocultarContenido(tabButtonIndex, tabContentId);

        let tabContentElement = document.querySelector(tabContentId);
        tabContentElement.classList.add('active');
        tabButtons.children[tabButtonIndex].classList.add('active');
    }

    function ocultarContenido(tabButtonIndex, id) {
        for (let i = 0; i < tabContentCount; i++) {
            let tabContentId = '#' + tabContent.children[i].id;
            let tabButtonInList = tabButtons.children[i];
            let tabButton = tabButtons.children[tabButtonIndex];

            if (tabButton.getAttribute('tab') != tabButtonInList.getAttribute('tab')) {
                tabButtonInList.classList.remove('active');
            }

            if (id != tabContentId) {
                let tabContentElement = document.querySelector(tabContentId);
                tabContentElement.classList.remove('active');
            }
        }
    }

});