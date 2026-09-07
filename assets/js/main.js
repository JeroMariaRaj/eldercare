document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtns = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    const htmlElement = document.documentElement;
    
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    const toggleTheme = () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };
    themeToggleBtns.forEach(btn => btn.addEventListener('click', toggleTheme));

    // RTL Toggle
    const rtlToggleBtns = document.querySelectorAll('#rtl-toggle, #mobile-rtl-toggle');
    if (localStorage.getItem('dir') === 'rtl') {
        htmlElement.setAttribute('dir', 'rtl');
    } else {
        htmlElement.setAttribute('dir', 'ltr');
    }
    
    const toggleRtl = () => {
        if (htmlElement.getAttribute('dir') === 'rtl') {
            htmlElement.setAttribute('dir', 'ltr');
            localStorage.setItem('dir', 'ltr');
        } else {
            htmlElement.setAttribute('dir', 'rtl');
            localStorage.setItem('dir', 'rtl');
        }
    };
    rtlToggleBtns.forEach(btn => btn.addEventListener('click', toggleRtl));

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Modal Logic
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] hidden flex items-center justify-center p-4 transition-opacity';
    overlay.innerHTML = `
        <div id="modal-box" class="bg-white dark:bg-cardDark rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform scale-95 transition-transform">
            <button id="modal-close" class="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl"><i class="fa-solid fa-times"></i></button>
            <div id="modal-content" class="text-center"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const showModal = (htmlContent) => {
        document.getElementById('modal-content').innerHTML = htmlContent;
        overlay.classList.remove('hidden');
        setTimeout(() => document.getElementById('modal-box').classList.remove('scale-95'), 10);
        
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) closeBtn.addEventListener('click', hideModal);
    };

    const hideModal = () => {
        document.getElementById('modal-box').classList.add('scale-95');
        setTimeout(() => overlay.classList.add('hidden'), 200);
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideModal();
    });

    const successContent = `
        <i class="fa-solid fa-circle-check text-5xl text-secondary mb-4"></i>
        <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Success!</h3>
        <p class="text-gray-600 dark:text-gray-400">Your details have been submitted successfully. We will get back to you shortly.</p>
        <button class="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90" onclick="document.querySelector('#modal-close').click()">Close</button>
    `;

    // Intercept Forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Ignore search and login/register
            if (form.id !== 'search-form' && form.id !== 'loginForm' && form.id !== 'registerForm') {
                e.preventDefault();
                showModal(successContent);
                form.reset();
            }
        });
    });

    // Special logic for Pricing Buttons
    const pricingBtns = document.querySelectorAll('.pricing-btn');
    pricingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const planName = btn.getAttribute('data-plan') || 'Plan';
            const pricingFormHtml = `
                <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Choose ${planName}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">Please enter your details to proceed.</p>
                <form id="pricing-modal-form" class="space-y-3 text-left max-h-[70vh] overflow-y-auto px-1">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Full Name</label>
                        <input type="text" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="John Doe">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Email Address</label>
                        <input type="email" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="john@example.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Phone Number</label>
                        <input type="tel" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="(555) 000-0000">
                    </div>
                    
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <h4 class="text-md font-bold mb-3 dark:text-white">Payment Information</h4>
                        <div class="mb-3">
                            <label class="block text-sm font-medium mb-1 dark:text-gray-200">Card Number</label>
                            <div class="relative">
                                <input type="text" required class="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="0000 0000 0000 0000">
                                <i class="fa-regular fa-credit-card absolute left-3 top-3.5 text-gray-400"></i>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-1/2">
                                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Expiry Date</label>
                                <input type="text" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="MM/YY">
                            </div>
                            <div class="w-1/2">
                                <label class="block text-sm font-medium mb-1 dark:text-gray-200">CVV</label>
                                <input type="text" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="123">
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-md mt-4">Confirm Payment</button>
                </form>
            `;
            showModal(pricingFormHtml);
            
            // Attach listener to new dynamically added form
            setTimeout(() => {
                document.getElementById('pricing-modal-form').addEventListener('submit', (ev) => {
                    ev.preventDefault();
                    const paymentSuccessContent = `
                        <i class="fa-solid fa-circle-check text-5xl text-secondary mb-4"></i>
                        <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                        <p class="text-gray-600 dark:text-gray-400">Thank you! Your payment has been processed successfully and your account is updated.</p>
                        <button class="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90" onclick="document.querySelector('#modal-close').click()">Close</button>
                    `;
                    showModal(paymentSuccessContent);
                });
            }, 100);
        });
    });
});