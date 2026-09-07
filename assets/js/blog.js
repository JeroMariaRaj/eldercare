document.addEventListener('DOMContentLoaded', () => {
    
    const blogItems = document.querySelectorAll('.blog-item');
    const searchInputs = [document.getElementById('desktopSearchInput'), document.getElementById('mobileSearchInput')];
    const categoryLinks = document.querySelectorAll('.category-list a');
    const mobileCategoryFilter = document.getElementById('mobileCategoryFilter');

    function filterBlogs(searchTerm, category) {
        searchTerm = searchTerm.toLowerCase();
        
        blogItems.forEach(item => {
            const title = item.getAttribute('data-title').toLowerCase();
            const itemCategory = item.getAttribute('data-category');
            const textContent = item.textContent.toLowerCase();
            
            const matchesSearch = title.includes(searchTerm) || textContent.includes(searchTerm);
            const matchesCategory = (category === 'all' || itemCategory === category);

            if (matchesSearch && matchesCategory) {
                item.style.display = 'block';
                // For flex items to retain their layout
                if (item.classList.contains('flex-col')) {
                    item.style.display = 'flex';
                }
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Search Events
    searchInputs.forEach(input => {
        if(input) {
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                // Sync inputs
                searchInputs.forEach(syncInput => { if(syncInput && syncInput !== e.target) syncInput.value = searchTerm; });
                
                // Get active category
                let activeCategory = 'all';
                const activeLink = document.querySelector('.category-list a.active');
                if(activeLink) activeCategory = activeLink.getAttribute('data-filter');
                if(mobileCategoryFilter && mobileCategoryFilter.value !== 'all') activeCategory = mobileCategoryFilter.value;
                
                filterBlogs(searchTerm, activeCategory);
            });
        }
    });

    // Category Click Events (Desktop)
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            categoryLinks.forEach(l => {
                l.classList.remove('active');
                l.querySelector('span:first-child').classList.remove('text-primary', 'font-medium');
            });
            link.classList.add('active');
            link.querySelector('span:first-child').classList.add('text-primary', 'font-medium');
            
            const category = link.getAttribute('data-filter');
            
            // Sync mobile select
            if(mobileCategoryFilter) {
                mobileCategoryFilter.value = category;
            }
            
            // Get search term
            const searchTerm = searchInputs[0] ? searchInputs[0].value : '';
            
            filterBlogs(searchTerm, category);
        });
    });

    // Category Change Events (Mobile)
    if(mobileCategoryFilter) {
        mobileCategoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            
            // Sync desktop links
            categoryLinks.forEach(link => {
                link.classList.remove('active');
                link.querySelector('span:first-child').classList.remove('text-primary', 'font-medium');
                if(link.getAttribute('data-filter') === category) {
                    link.classList.add('active');
                    link.querySelector('span:first-child').classList.add('text-primary', 'font-medium');
                }
            });

            // Get search term
            const searchTerm = searchInputs[1] ? searchInputs[1].value : '';
            
            filterBlogs(searchTerm, category);
        });
    }

});
