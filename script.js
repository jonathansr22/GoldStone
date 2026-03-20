// Efeito de mudança no Header ao rolar a página
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = '#000';
        header.style.padding = '10px 5%';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.padding = '15px 5%';
    }
});

// Catálogo de pedras (imagens da pasta Imagens)
const catalogItems = [
    // coleção de área gourmet em Taj Mahal
    { fileName: 'areagourmettajmahal1.jpeg', model: 'área gourmet', stoneType: 'taj mahal' },
    { fileName: 'areagourmettajmahal2.jpeg', model: 'área gourmet', stoneType: 'taj mahal' },

    // coleção de bancada em Marrom Imperador
    { fileName: 'bancadamarromimperador1.jpeg', model: 'bancada', stoneType: 'marrom imperador' },
    { fileName: 'bancadamarromimperador2.jpeg', model: 'bancada', stoneType: 'marrom imperador' },

    // coleção de champanheira em Taj Mahal
    { fileName: 'champanheiratajmahal1.jpeg', model: 'champanheira', stoneType: 'taj mahal' },

    // coleção churrasqueira em Preto São Gabriel
    { fileName: 'churrasqueirapretosaogabriel1.jpeg', model: 'churrasqueira', stoneType: 'preto são gabriel' },
    { fileName: 'churrasqueirapretosaogabriel2.jpeg', model: 'churrasqueira', stoneType: 'preto são gabriel' },
    { fileName: 'churrasqueirapretosaogabriel3.jpeg', model: 'churrasqueira', stoneType: 'preto são gabriel' },
    { fileName: 'churrasqueirapretosaogabriel4.jpeg', model: 'churrasqueira', stoneType: 'preto são gabriel' },
    { fileName: 'churrasqueirapretosaogabriel5.jpeg', model: 'churrasqueira', stoneType: 'preto são gabriel' },

    // coleção cozinha em Preto São Gabriel
    { fileName: 'cozinhapretosaogabriel1.jpeg', model: 'cozinha', stoneType: 'preto são gabriel' },
    { fileName: 'cozinhapretosaogabriel2.jpeg', model: 'cozinha', stoneType: 'preto são gabriel' },

    // coleção lavabo em Quartzo Verde Guatemala
    { fileName: 'lavaboquartzitoverdeguatemala1.jpeg', model: 'lavabo', stoneType: 'quartzo verde guatemala' },
    { fileName: 'lavaboquartzitoverdeguatemala2.jpeg', model: 'lavabo', stoneType: 'quartzo verde guatemala' },
    { fileName: 'lavaboquartzitoverdeguatemala3.jpeg', model: 'lavabo', stoneType: 'quartzo verde guatemala' }
];

const getImagePath = (fileName) => encodeURI(`Imagens/${fileName}`);

const normalizeFileName = (fileName) => {
    // Remove incremental suffixes como " (1)", " (2)" do nome do arquivo, para agrupar pela base
    const match = fileName.match(/^(.*?)(?: \(\d+\))?\.(jpe?g|png|webp)$/i);
    return match ? match[1] : fileName;
};

const getSequenceNumber = (fileName) => {
    const match = fileName.match(/\((\d+)\)\.(jpe?g|png|webp)$/i);
    return match ? Number(match[1]) : 0;
};

const buildGroupedCatalog = () => {
    const groups = {};

    catalogItems.forEach(item => {
        const bucketKey = `${item.model}__${item.stoneType}`;
        if (!groups[bucketKey]) {
            groups[bucketKey] = {
                key: bucketKey,
                items: [],
                model: item.model,
                stoneType: item.stoneType,
            };
        }
        groups[bucketKey].items.push(item);
    });

    const grouped = Object.values(groups);

    grouped.forEach(group => {
        group.items.sort((a, b) => {
            const seqA = getSequenceNumber(a.fileName);
            const seqB = getSequenceNumber(b.fileName);
            if (seqA !== seqB) return seqA - seqB;
            return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
        });
    });

    return grouped;
};

let groupedCatalog = buildGroupedCatalog();

const refreshGroupedCatalog = () => {
    groupedCatalog = buildGroupedCatalog();
    renderCatalog();
};

let currentGroup = null;
let currentIndex = 0;

const openModal = (groupKey, index) => {
    const group = groupedCatalog.find(g => g.key === groupKey);
    if (!group) return;

    currentGroup = group;
    currentIndex = index;
    const modal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    const item = group.items[currentIndex];
    modalImage.src = getImagePath(item.fileName);
    modalImage.alt = `${item.stoneType} - ${item.model}`;
    modalCaption.textContent = `${item.model.charAt(0).toUpperCase() + item.model.slice(1)} • ${item.stoneType.charAt(0).toUpperCase() + item.stoneType.slice(1)} — ${currentIndex + 1}/${group.items.length}`;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
};

const navigateModal = (direction) => {
    if (!currentGroup) return;
    currentIndex = (currentIndex + direction + currentGroup.items.length) % currentGroup.items.length;
    openModal(currentGroup.key, currentIndex);
};

const createCard = (group) => {
    const card = document.createElement('div');
    card.className = 'stone-card';

    const zoom = document.createElement('div');
    zoom.className = 'zoom-container';

    const img = document.createElement('img');
    img.src = getImagePath(group.items[0].fileName);
    img.alt = `${group.stoneType} - ${group.model}`;

    zoom.appendChild(img);
    card.appendChild(zoom);

    const info = document.createElement('div');
    info.className = 'stone-info';

    const title = document.createElement('h3');
    title.textContent = `${group.model.charAt(0).toUpperCase() + group.model.slice(1)} • ${group.stoneType.charAt(0).toUpperCase() + group.stoneType.slice(1)}`;

    const desc = document.createElement('p');
    desc.textContent = `${group.items.length} foto(s) similares. Clique para ver a coleção.`;

    info.appendChild(title);
    info.appendChild(desc);
    card.appendChild(info);

    card.addEventListener('click', () => openModal(group.key, 0));

    return card;
};

const renderCatalog = () => {
    const modelFilter = document.getElementById('modelFilter').value;
    const stoneTypeFilter = document.getElementById('stoneTypeFilter').value;
    const grid = document.getElementById('catalogGrid');

    grid.innerHTML = '';

    const filteredGroups = groupedCatalog.filter(group => {
        const modelMatch = modelFilter === 'all' || group.model === modelFilter;
        const stoneMatch = stoneTypeFilter === 'all' || group.stoneType === stoneTypeFilter;
        return modelMatch && stoneMatch;
    });

    if (!filteredGroups.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nenhuma pedra encontrada para os filtros selecionados.';
        emptyMessage.style.color = '#ddd';
        grid.appendChild(emptyMessage);
        return;
    }

    filteredGroups.forEach(group => grid.appendChild(createCard(group)));
};

window.addEventListener('DOMContentLoaded', () => {
    const modelFilter = document.getElementById('modelFilter');
    const stoneTypeFilter = document.getElementById('stoneTypeFilter');

    modelFilter.addEventListener('change', renderCatalog);
    stoneTypeFilter.addEventListener('change', renderCatalog);

    const modal = document.getElementById('galleryModal');
    const closeBtn = modal.querySelector('.modal-close');
    const prevBtn = modal.querySelector('.modal-prev');
    const nextBtn = modal.querySelector('.modal-next');

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', () => navigateModal(-1));
    nextBtn.addEventListener('click', () => navigateModal(1));
    modal.addEventListener('click', (event) => {
        if (event.target.dataset.close === 'true') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (modal.classList.contains('open')) {
            if (event.key === 'Escape') closeModal();
            if (event.key === 'ArrowRight') navigateModal(1);
            if (event.key === 'ArrowLeft') navigateModal(-1);
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a');

    const toggleMenu = () => {
        const isOpen = header.classList.toggle('nav-open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    hamburger.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', () => {
        if (header.classList.contains('nav-open')) {
            toggleMenu();
        }
    }));

    renderCatalog();
});

// Mensagem personalizada para o WhatsApp (opcional)
const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
whatsappButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Você pode customizar a mensagem aqui se quiser
        const whatsappMessage = encodeURIComponent("Olá! Tenho interesse em orçamento para pedras e projetos de alto padrão.");
        const base = button.href.split('?')[0];
        button.href = `${base}?text=${whatsappMessage}`;
    });
});