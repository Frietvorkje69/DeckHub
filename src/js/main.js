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
            if (a.status === 'legal' && b.status !== 'legal') {
                return -1;
            } else if (a.status !== 'legal' && b.status === 'legal') {
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
    card.classList.add('shadow', 'border-4', `border-${service.status === 'legal' ? 'blue-500' : 'red-500'}`, 'rounded-lg', 'p-4', 'flex', 'items-center', 'justify-center', 'space-y-4', 'h-48', 'w-full', 'hover:animate-pulse', 'hover:scale-105', 'hover:border-white', 'transition-all', 'duration-300');
    card.style.backgroundImage = `url('${service.image}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const badge = document.createElement('div');
    badge.classList.add(`bg-${service.status === 'legal' ? 'blue-500' : 'red-500'}`, 'rounded-full', 'px-4', 'py-2');
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

    console.log(customService.id)

    const customServices = loadCustomServices();
    customServices.push(customService);
    localStorage.setItem('customServices', JSON.stringify(customServices));

    toggleAddServiceOverlay();
    renderAllServices();
    renderFilterOptions();

}

function generateRandomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function toggleOverlay() {
    overlay.classList.toggle('hidden');
    settingsDropdown.classList.add('hidden');
}

function toggleAddServiceOverlay() {
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

sortServices(activeSortField);
renderFilterOptions();
