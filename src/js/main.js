import services from './services.js';

const cardContainer = document.getElementById('cardContainer');

const sortByNameButton = document.getElementById('sortByName');
const sortByStatusButton = document.getElementById('sortByStatus');
const sortByCategoryButton = document.getElementById('sortByCategory');

let activeSortField = localStorage.getItem('activeSortField') || 'status';
sortServices(activeSortField);

function loadCustomServices() {
    return JSON.parse(localStorage.getItem('customServices')) || [];
}

let allServices = [...services, ...loadCustomServices()];

function sortServices(sortField) {
    const sortedServices = services.sort((a, b) => {
        if (sortField === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortField === 'status') {
            if (a.status === 'legal' && b.status !== 'legal') {
                return -1;
            } else if (a.status !== 'legal' && b.status === 'legal') {
                return 1;
            } else {
                return a.status.localeCompare(b.status);
            }
        } else if (sortField === 'category') {
            return a.category.localeCompare(b.category);
        }
    });

    sortByNameButton.classList.remove('sort-active');
    sortByStatusButton.classList.remove('sort-active');
    sortByCategoryButton.classList.remove('sort-active');

    if (sortField === 'name') {
        sortByNameButton.classList.add('sort-active');
    } else if (sortField === 'status') {
        sortByStatusButton.classList.add('sort-active');
    } else if (sortField === 'category') {
        sortByCategoryButton.classList.add('sort-active');
    }

    activeSortField = sortField;
    renderCards(sortedServices);
    applyFilterPreferences();
    localStorage.setItem('activeSortField', sortField);
}

function renderCards(servicesToDisplay) {
    cardContainer.innerHTML = '';

    servicesToDisplay.forEach(service => {
        if (!isServiceHidden(service.name)) {
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
            cardContainer.appendChild(card);
        }
    });
}

sortByNameButton.addEventListener('click', () => sortServices('name'));
sortByStatusButton.addEventListener('click', () => sortServices('status'));
sortByCategoryButton.addEventListener('click', () => sortServices('category'));

const filterOptions = document.getElementById('filterOptions');
const overlay = document.getElementById('overlay');
const closeOverlayButton = document.getElementById('closeOverlay');

function toggleOverlay() {
    overlay.classList.toggle('hidden');
}

//NEW ADD SERVICE LOGIC
const addServiceButton = document.getElementById('addServiceButton');
const addServiceOverlay = document.getElementById('addServiceOverlay');
const closeAddServiceOverlayButton = document.getElementById('closeAddServiceOverlay');

function toggleAddServiceOverlay() {
    addServiceOverlay.classList.toggle('hidden');
}

addServiceButton.addEventListener('click', () => {
    toggleAddServiceOverlay();
});

closeAddServiceOverlayButton.addEventListener('click', () => {
    toggleAddServiceOverlay();
});

addServiceOverlay.addEventListener('click', (event) => {
    if (event.target === addServiceOverlay) {
        toggleAddServiceOverlay();
    }
});

const addServiceForm = document.getElementById('addServiceForm');

addServiceForm.addEventListener('submit', (event) => {
    console.log('Creating new service..')
    event.preventDefault();

    const serviceName = document.getElementById('serviceName').value;
    const serviceLink = document.getElementById('serviceLink').value;
    const serviceImage = document.getElementById('serviceImage').value;
    const serviceStatus = document.getElementById('serviceStatus').value;
    const serviceCategory = document.getElementById('serviceCategory').value;

    const customService = {
        name: serviceName,
        link: serviceLink,
        image: serviceImage,
        status: serviceStatus,
        category: serviceCategory
    };


    const customServices = JSON.parse(localStorage.getItem('customServices')) || [];
    customServices.push(customService);
    localStorage.setItem('customServices', JSON.stringify(customServices));

    toggleAddServiceOverlay();

    const allServices = [...services, ...loadCustomServices()];
    renderCards(allServices);

});

function updateFilterPreferences() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const preferences = {};
    checkboxes.forEach(checkbox => {
        preferences[checkbox.value] = checkbox.checked;
    });
    localStorage.setItem('filterPreferences', JSON.stringify(preferences));
}

function renderFilterOptions() {
    filterOptions.innerHTML = '';
    const categoriesMap = new Map();
    services.forEach(service => {
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
            checkbox.checked = !isServiceHidden(service.name);
            checkbox.classList.add('filter-checkbox', 'text-indigo-600', 'h-8', 'w-8', 'sm:h-6', 'sm:w-6');
            checkbox.addEventListener('change', () => {
                updateFilterPreferences();
                applyFilterPreferences();
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

function isServiceHidden(serviceName) {
    const preferences = JSON.parse(localStorage.getItem('filterPreferences')) || {};
    return preferences[serviceName] === false;
}

function applyFilterPreferences() {
    const preferences = JSON.parse(localStorage.getItem('filterPreferences')) || {};
    const visibleServices = services.filter(service => preferences[service.name] !== false);
    renderCards(visibleServices);
}

document.getElementById('filterButton').addEventListener('click', () => {
    toggleOverlay();
});

closeOverlayButton.addEventListener('click', () => {
    toggleOverlay();
});

renderFilterOptions();
applyFilterPreferences();
