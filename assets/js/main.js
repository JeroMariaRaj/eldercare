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

    // --- COMPREHENSIVE FORM VALIDATION ENGINE ---

    // 1. Disable native HTML5 validation globally but keep the attributes for logic
    document.querySelectorAll("form").forEach(form => form.setAttribute("novalidate", true));
    
    // Also use MutationObserver for dynamically added forms to set novalidate
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === "FORM") node.setAttribute("novalidate", true);
                    const forms = node.querySelectorAll("form");
                    forms.forEach(f => f.setAttribute("novalidate", true));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Validation rules
    const validateField = (field) => {
        let errorMsg = "";
        const value = field.value.trim();
        
        if (field.required && !value) {
            errorMsg = "This field is required.";
        } else if (value) {
            if (field.type === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) errorMsg = "Please enter a valid email address.";
            } else if (field.type === "tel") {
                const telRegex = /^[0-9+\-\s()]{7,20}$/;
                if (!telRegex.test(value)) errorMsg = "Please enter a valid phone number.";
            } else if (field.type === "password" || field.name.toLowerCase().includes("password") || field.id.toLowerCase().includes("password")) {
                if (field.form && field.form.id === "loginForm") {
                    if (value.length < 3) errorMsg = "Please enter your password.";
                } else {
                    if (value.length < 8) errorMsg = "Password must be at least 8 characters.";
                    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) errorMsg = "Password must contain uppercase, lowercase, and a number.";
                    
                    // Confirm password check - check if it's the second password field in the form
                    if (field.form) {
                        const passFields = Array.from(field.form.querySelectorAll("input[type=\"password\"]"));
                        if (passFields.length >= 2 && field === passFields[1]) {
                            if (passFields[0].value !== value) errorMsg = "Passwords do not match.";
                            else if (!errorMsg && passFields[0].value) errorMsg = ""; // Clear if match and valid
                        }
                    }
                }
            } else if (field.type === "number") {
                if (field.min && Number(value) < Number(field.min)) errorMsg = `Minimum value is ${field.min}.`;
                if (field.max && Number(value) > Number(field.max)) errorMsg = `Maximum value is ${field.max}.`;
            } else if (field.name.toLowerCase().includes("name") && field.type === "text") {
                if (value.length < 2) errorMsg = "Name must be at least 2 characters.";
                if (/[0-9_!?"/\\\\+=@#$%&*(){}|~<>;:\\[\\]]/.test(value)) errorMsg = "Name contains invalid characters.";
            } else if (field.tagName === "SELECT" && (!value || value === "0" || value === "default" || (field.selectedIndex === 0 && field.options[0].disabled))) {
                errorMsg = "Please select an option.";
            }
        }
        
        // Update UI
        showFieldError(field, errorMsg);
        return !errorMsg;
    };

    const showFieldError = (field, message) => {
        field.classList.remove("border-red-500", "dark:border-red-500", "focus:ring-red-500");
        let errorEl = field.parentNode.querySelector(".validation-error");
        if (errorEl) errorEl.remove();
        
        if (message) {
            field.classList.add("border-red-500", "dark:border-red-500", "focus:ring-red-500");
            errorEl = document.createElement("p");
            errorEl.className = "validation-error text-red-500 text-xs mt-1 font-medium";
            errorEl.innerText = message;
            
            // Append after field or field`s wrapper (like for password/icon fields)
            if (field.nextElementSibling && (field.nextElementSibling.tagName === "I" || field.nextElementSibling.tagName === "BUTTON")) {
                field.parentNode.parentNode.appendChild(errorEl); // wrapper div
            } else {
                field.parentNode.appendChild(errorEl);
            }
        }
    };

    // Real-time validation
    document.addEventListener("blur", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
            if (e.target.form) validateField(e.target);
        }
    }, true);
    
    document.addEventListener("input", (e) => {
        // If field already has error, clear it as user types
        if (e.target.classList && e.target.classList.contains("border-red-500")) {
            validateField(e.target);
        }
    }, true);

    // Intercept form submissions globally via delegation
    document.addEventListener("submit", async (e) => {
        const form = e.target;
        if (form.tagName !== "FORM") return;
        
        e.preventDefault();
        
        let isValid = true;
        const fields = form.querySelectorAll("input, textarea, select");
        let firstInvalidField = null;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });
        
        if (!isValid) {
            if (firstInvalidField) firstInvalidField.focus();
            return;
        }

        // --- Loading State ---
        const submitBtn = form.querySelector("button[type=\"submit\"]") || form.querySelector("button");
        let originalBtnHtml = "";
        if (submitBtn) {
            originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<i class=\"fa-solid fa-circle-notch fa-spin mr-2\"></i> Submitting...";
            submitBtn.classList.add("opacity-70", "cursor-not-allowed");
        }

        // Simulate API / Network Request delay
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Random simulated API error for robustness test (5% chance), except for specific forms
            if (Math.random() > 0.95 && form.id !== "loginForm" && form.id !== "registerForm") {
                throw new Error("Server disconnected. Please try again later.");
            }

            // Success UI
            if (form.id === "loginForm") {
                window.location.href = "family-dashboard.html";
            } else if (form.id === "registerForm") {
                window.location.href = "login.html";
            } else if (form.id === "pricing-modal-form") {
                showModal(`
                    <i class="fa-solid fa-circle-check text-5xl text-secondary mb-4"></i>
                    <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                    <p class="text-gray-600 dark:text-gray-400">Thank you! Your payment has been processed successfully and your account is updated.</p>
                    <button class="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90" onclick="document.querySelector(\"#modal-close\").click()">Close</button>
                `);
            } else {
                showModal(successContent);
                form.reset();
            }
        } catch (error) {
            // Error UI
            showModal(`
                <i class="fa-solid fa-triangle-exclamation text-5xl text-red-500 mb-4"></i>
                <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Submission Failed</h3>
                <p class="text-gray-600 dark:text-gray-400">${error.message}</p>
                <button class="mt-6 w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-opacity-90" onclick="document.querySelector(\"#modal-close\").click()">Try Again</button>
            `);
        } finally {
            // Restore button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
            }
        }
    });

    // Special logic for Pricing Buttons
    const pricingBtns = document.querySelectorAll(".pricing-btn");
    pricingBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const planName = btn.getAttribute("data-plan") || "Plan";
            const pricingFormHtml = `
                <h3 class="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Choose ${planName}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">Please enter your details to proceed.</p>
                <form id="pricing-modal-form" class="space-y-3 text-left max-h-[70vh] overflow-y-auto px-1" novalidate>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Full Name</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="John Doe">
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
                                <input type="number" required minlength="16" maxlength="16" class="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="0000 0000 0000 0000">
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
                                <input type="number" required minlength="3" maxlength="4" class="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-secondary dark:text-white" placeholder="123">
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-md mt-4 transition-all">Confirm Payment</button>
                </form>
            `;
            showModal(pricingFormHtml);
        });
    });
});
