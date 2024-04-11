import services from './services.js';

const cardContainer = document.getElementById('cardContainer');

const sortByNameButton = document.getElementById('sortByName');
const sortByStatusButton = document.getElementById('sortByStatus');
const sortByCategoryButton = document.getElementById('sortByCategory');
const addServiceButton = document.getElementById('addServiceButton');

const filterOptions = document.getElementById('filterOptions');

const overlay = document.getElementById('overlay');
const closeOverlayButton = document.getElementById('closeOverlay');

const addServiceOverlay = document.getElementById('addServiceOverlay');
const closeAddServiceOverlayButton = document.getElementById('closeAddServiceOverlay');

const addServiceForm = document.getElementById('addServiceForm');

let activeSortField = localStorage.getItem('activeSortField') || 'status';

const serviceNameInput = document.getElementById('serviceName');
const serviceLinkInput = document.getElementById('serviceLink');
const serviceImageInput = document.getElementById('serviceImage');
const serviceStatusInput = document.getElementById('serviceStatus');
const serviceCategoryInput = document.getElementById('serviceCategory');

serviceNameInput.addEventListener('input', updatePreview);
serviceLinkInput.addEventListener('input', updatePreview);
serviceImageInput.addEventListener('input', updatePreview);
serviceStatusInput.addEventListener('change', updatePreview);
serviceCategoryInput.addEventListener('input', updatePreview);

const settingsButton = document.getElementById('dropdownButton');
const settingsDropdown = document.getElementById('dropdownMenu');
settingsButton.addEventListener('click', () => {
    settingsDropdown.classList.toggle('hidden');
});

document.body.addEventListener('click', (event) => {
    if (!event.target.closest('#dropdownButton') && !event.target.closest('#dropdownMenu')) {
        settingsDropdown.classList.add('hidden');
    }
});

sortByNameButton.addEventListener('click', () => sortServices('name'));
sortByStatusButton.addEventListener('click', () => sortServices('status'));
sortByCategoryButton.addEventListener('click', () => sortServices('category'));

addServiceButton.addEventListener('click', toggleAddServiceOverlay);
closeAddServiceOverlayButton.addEventListener('click', toggleAddServiceOverlay);
addServiceOverlay.addEventListener('click', event => {
    if (event.target === addServiceOverlay) {
        toggleAddServiceOverlay();
    }
});
addServiceForm.addEventListener('submit', addNewService);
document.getElementById('filterButton').addEventListener('click', toggleOverlay);
closeOverlayButton.addEventListener('click', toggleOverlay);

function loadCustomServices() {
    return JSON.parse(localStorage.getItem('customServices')) || [];
}

function sortServices(sortField) {
    activeSortField = sortField;
    localStorage.setItem('activeSortField', sortField);
    renderAllServices();
}

function renderAllServices() {
    const allServices = services.concat(loadCustomServices());
    applyFilterPreferences(allServices);
}

function applyFilterPreferences(servicesToFilter) {
    const preferences = JSON.parse(localStorage.getItem('filterPreferences')) || {};
    const visibleServices = servicesToFilter.filter(service => preferences[service.id] !== false);
    sortAndRenderCards(visibleServices);
}

function sortAndRenderCards(servicesToDisplay) {
    const sortedServices = servicesToDisplay.sort((a, b) => {
        if (activeSortField === 'name') {
            return a.name.localeCompare(b.name);
        } else if (activeSortField === 'status') {
            if (a.status === 'Official' && b.status !== 'Official') {
                return -1;
            } else if (a.status !== 'Official' && b.status === 'Official') {
                return 1;
            } else {
                return a.status.localeCompare(b.status);
            }
        } else if (activeSortField === 'category') {
            return a.category.localeCompare(b.category);
        }
    });

    renderCards(sortedServices);
}

function renderCards(servicesToDisplay) {
    cardContainer.innerHTML = '';

    servicesToDisplay.forEach(service => {
        const card = createServiceCard(service);
        cardContainer.appendChild(card);
    });

    sortByNameButton.classList.remove('sort-active');
    sortByStatusButton.classList.remove('sort-active');
    sortByCategoryButton.classList.remove('sort-active');

    if (activeSortField === 'name') {
        sortByNameButton.classList.add('sort-active');
    } else if (activeSortField === 'status') {
        sortByStatusButton.classList.add('sort-active');
    } else if (activeSortField === 'category') {
        sortByCategoryButton.classList.add('sort-active');
    }
}

function createServiceCard(service) {
    const card = document.createElement('a');
    card.href = service.link;
    card.classList.add('shadow', 'border-4', `border-${service.status === 'Official' ? 'blue-500' : 'red-500'}`, 'rounded-lg', 'p-4', 'flex', 'items-center', 'justify-center', 'space-y-4', 'h-48', 'w-full', 'hover:animate-pulse', 'hover:scale-105', 'hover:border-white', 'transition-all', 'duration-300');
    card.style.backgroundImage = `url('${service.image}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const badge = document.createElement('div');
    badge.classList.add(`bg-${service.status === 'Official' ? 'blue-500' : 'red-500'}`, 'rounded-full', 'px-4', 'py-2');
    const stitle = document.createElement('p');
    stitle.textContent = service.name;
    stitle.classList.add('text-lg', 'font-bold', 'text-white');
    badge.appendChild(stitle);

    card.appendChild(badge);
    return card;
}

function addNewService(event) {
    event.preventDefault();
    const serviceName = document.getElementById('serviceName').value;
    let serviceLink = document.getElementById('serviceLink').value.trim();
    let serviceImage = document.getElementById('serviceImage').value;
    const serviceStatus = document.getElementById('serviceStatus').value;
    let serviceCategory = document.getElementById('serviceCategory').value;

    if (serviceName === '' || serviceLink === '') {
        alert('Service Name and Service Link cannot be empty!');
        return;
    }

    if (!serviceLink.startsWith('http://') && !serviceLink.startsWith('https://')) {
        serviceLink = 'https://' + serviceLink;
    }

    if (serviceImage === '') {
        serviceImage = 'https://github.com/Frietvorkje69/DeckHub/blob/master/src/img/capsule.png?raw=true';
    }


    if (serviceCategory === '') {
        serviceCategory = 'Uncatergorized';
    }

    serviceCategory = serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1);

    const customService = {
        name: serviceName,
        link: serviceLink,
        image: serviceImage,
        status: serviceStatus,
        category: serviceCategory,
        isCustom: true,
        id: generateRandomId()
    };

    const customServices = loadCustomServices();
    customServices.push(customService);
    localStorage.setItem('customServices', JSON.stringify(customServices));

    document.getElementById('addServiceForm').reset();
    toggleAddServiceOverlay();
    renderAllServices();
    renderFilterOptions();
    updatePreview();

}

function generateRandomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function renderCustomServices() {
    const customServices = loadCustomServices();
    const customServicesSection = document.getElementById('customServicesSection');
    customServicesSection.innerHTML = '';

    if (customServices.length > 0) {
        const title = document.createElement('h3');
        title.textContent = 'Custom Services:';
        title.classList.add('text-lg', 'font-semibold', 'text-white', 'mb-4');
        customServicesSection.appendChild(title);

        customServices.forEach(service => {
            const serviceNameElement = document.createElement('p');
            serviceNameElement.textContent = service.name;
            serviceNameElement.classList.add('text-white', 'text-base');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('px-2', 'py-1', 'bg-red-500', 'text-white', 'rounded', 'hover:bg-red-600', 'transition', 'duration-300');
            deleteButton.addEventListener('click', () => deleteCustomService(service.id));

            const container = document.createElement('div');
            container.classList.add('flex', 'items-center', 'justify-between');
            container.appendChild(serviceNameElement);
            container.appendChild(deleteButton);

            customServicesSection.appendChild(container);
        });
    }
}

function deleteCustomService(serviceId) {
    const customServices = loadCustomServices();
    const updatedServices = customServices.filter(service => service.id !== serviceId);
    localStorage.setItem('customServices', JSON.stringify(updatedServices));
    renderCustomServices();
    renderFilterOptions()
    renderAllServices()
}

function toggleOverlay() {
    overlay.classList.toggle('hidden');
    settingsDropdown.classList.add('hidden');

    if (!overlay.classList.contains('hidden')) {
        renderCustomServices();
    }
}

function toggleAddServiceOverlay() {
    updatePreview();
    addServiceOverlay.classList.toggle('hidden');
    settingsDropdown.classList.add('hidden');
}

function renderFilterOptions() {
    filterOptions.innerHTML = '';
    const categoriesMap = new Map();
    services.concat(loadCustomServices()).forEach(service => {
        if (!categoriesMap.has(service.category)) {
            categoriesMap.set(service.category, []);
        }
        categoriesMap.get(service.category).push(service);
    });

    categoriesMap.forEach((categoryServices, categoryName) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category');

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = categoryName;
        categoryTitle.classList.add('text-lg', 'font-semibold', 'text-white', 'mb-2');
        categoryContainer.appendChild(categoryTitle);

        categoryServices.forEach(service => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = service.name;
            checkbox.setAttribute('data-id', service.id);
            checkbox.checked = !isServiceHidden(service.id);
            checkbox.classList.add('filter-checkbox', 'text-indigo-600', 'h-8', 'w-8', 'sm:h-6', 'sm:w-6');
            checkbox.addEventListener('change', () => {
                updateFilterPreferences();
                applyFilterPreferences(services.concat(loadCustomServices()));
            });

            const label = document.createElement('label');
            label.textContent = service.name;
            label.classList.add('text-white', 'text-base');

            const div = document.createElement('div');
            div.classList.add('flex', 'items-center', 'flex', 'flex-row', 'space-x-2', 'space-y-2');
            div.appendChild(checkbox);
            div.appendChild(label);
            categoryContainer.appendChild(div);
        });

        filterOptions.appendChild(categoryContainer);
    });
}

function isServiceHidden(serviceId) {
    const preferences = JSON.parse(localStorage.getItem('filterPreferences')) || {};
    return preferences[serviceId] === false;
}

function updateFilterPreferences() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const preferences = {};
    checkboxes.forEach(checkbox => {
        preferences[checkbox.getAttribute('data-id')] = checkbox.checked;
    });
    localStorage.setItem('filterPreferences', JSON.stringify(preferences));
}

function createPreviewCard(service) {
    const card = document.createElement('div');
    card.classList.add('shadow', 'border-4', `border-${service.status === 'Official' ? 'blue-500' : 'red-500'}`, 'rounded-lg', 'p-4', 'flex', 'items-center', 'justify-center', 'space-y-4', 'h-48', 'w-full', 'transition-all', 'duration-300');
    card.style.backgroundImage = `url('${service.image ? service.image : 'https://github.com/Frietvorkje69/DeckHub/blob/master/src/img/capsule.png?raw=true'}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const badge = document.createElement('div');
    badge.classList.add(`bg-${service.status === 'Official' ? 'blue-500' : 'red-500'}`, 'rounded-full', 'px-4', 'py-2');
    const stitle = document.createElement('p');

    stitle.textContent = service.name ? service.name : 'Preview';

    stitle.classList.add('text-lg', 'font-bold', 'text-white');
    badge.appendChild(stitle);

    card.appendChild(badge);
    return card;
}

function updatePreview() {
    const serviceName = serviceNameInput.value;
    const serviceLink = serviceLinkInput.value.trim();
    const serviceImage = serviceImageInput.value;
    const serviceStatus = serviceStatusInput.value;
    const serviceCategory = serviceCategoryInput.value;

    const previewSection = document.getElementById('previewSection');
    previewSection.innerHTML = '';

    const previewCard = createPreviewCard({
        name: serviceName,
        link: serviceLink,
        image: serviceImage,
        status: serviceStatus,
        category: serviceCategory
    });

    previewSection.appendChild(previewCard);
}

sortServices(activeSortField);
renderFilterOptions();
