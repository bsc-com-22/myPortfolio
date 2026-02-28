/* 
===============================================
    Blessings Chidazi - Custom Scripts
===============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && closeMenu && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });

        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 2. Sticky Navbar & Scroll Styling
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Set Current Year in Footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 4. Smooth Scrolling for Anchor Links (fallback for CSS scroll-behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Contact Form Submission Handler (Mock)
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Loading state
            btn.innerHTML = 'Sending... <i class="ri-loader-4-line"></i>';
            btn.disabled = true;

            try {
                if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                    const { error } = await supabaseClient.from('messages').insert([
                        { name, email, subject, message }
                    ]);
                    if (error) throw error;
                } else {
                    // Simulate API request if no Supabase configured
                    await new Promise(r => setTimeout(r, 1000));
                }

                formStatus.style.display = 'block';
                formStatus.style.color = 'var(--primary-color)';
                formStatus.style.marginTop = '1rem';
                formStatus.style.fontWeight = '600';
                formStatus.innerHTML = '<i class="ri-checkbox-circle-line"></i> Message sent successfully! I will get back to you soon.';

                contactForm.reset();

                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            } catch (err) {
                formStatus.style.display = 'block';
                formStatus.style.color = '#FF3366';
                formStatus.style.marginTop = '1rem';
                formStatus.style.fontWeight = '600';
                formStatus.innerHTML = `<i class="ri-error-warning-line"></i> Error: ${err.message}`;
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // 6. Reveal on Scroll Animation (Simple intersection observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation to sections and cards
    const animElements = document.querySelectorAll('.section-title, .about-card, .portfolio-card, .repo-card, .skill-icon-box');

    animElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        observer.observe(el);
    });

    // 7. Dark Mode Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('ri-moon-line');
            themeIcon.classList.add('ri-sun-line');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let targetTheme = 'light';

            if (currentTheme === 'dark') {
                targetTheme = 'light';
                themeIcon.classList.remove('ri-sun-line');
                themeIcon.classList.add('ri-moon-line');
            } else {
                targetTheme = 'dark';
                themeIcon.classList.remove('ri-moon-line');
                themeIcon.classList.add('ri-sun-line');
            }

            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
        });
    }

    // 8. Dynamically Load Projects from Supabase
    async function loadPublicProjects() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

        const publicDesignGrid = document.getElementById('publicDesignGrid');
        const publicCodeGrid = document.getElementById('publicCodeGrid');

        let allDesignProjects = [];
        let displayedDesignCount = 0;
        const BATCH_SIZE = 3; // For expandable list

        try {
            const { data, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const designProjects = data.filter(p => p.type === 'design');
            const codeProjects = data.filter(p => p.type === 'code');

            allDesignProjects = designProjects;

            // Render Function for Design
            function renderDesignProjects(projects, clearContainer = false) {
                if (!publicDesignGrid) return;

                if (clearContainer) {
                    publicDesignGrid.innerHTML = '';
                    if (projects.length === 0) {
                        publicDesignGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">No design projects published yet.</div>';
                        return;
                    }
                }

                let addedEls = [];

                projects.forEach(proj => {
                    const article = document.createElement('article');
                    article.className = 'portfolio-card';

                    const imgUrl = proj.image_url || './assets/img/project1.png';

                    // The anchor wraps the image overlay and opens the image directly in a new page/tab per request
                    article.innerHTML = `
                        <div class="portfolio-img-wrap">
                            <img src="${imgUrl}" alt="${proj.title}" class="portfolio-img">
                            <div class="portfolio-overlay">
                                <a href="${imgUrl}" target="_blank" class="view-btn"><i class="ri-eye-line"></i></a>
                            </div>
                        </div>
                        <div class="portfolio-info">
                            <span class="portfolio-category">${proj.category}</span>
                            <h3 class="portfolio-title">${proj.title}</h3>
                            <p>${proj.description}</p>
                        </div>
                    `;
                    publicDesignGrid.appendChild(article);
                    addedEls.push(article);
                });

                // Re-apply scrolling animation to newly added DOM elements
                addedEls.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                    el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    observer.observe(el);
                });
            }

            // Initial load for Design (expandable list functionality)
            const initialProjects = allDesignProjects.slice(0, BATCH_SIZE);
            displayedDesignCount += initialProjects.length;
            renderDesignProjects(initialProjects, true);

            const loadMoreBtnContainer = document.getElementById('designLoadMoreContainer');
            const loadMoreBtn = document.getElementById('loadMoreDesignBtn');

            if (loadMoreBtnContainer && loadMoreBtn) {
                if (allDesignProjects.length > BATCH_SIZE) {
                    loadMoreBtnContainer.style.display = 'block';

                    loadMoreBtn.addEventListener('click', () => {
                        const nextProjects = allDesignProjects.slice(displayedDesignCount, displayedDesignCount + BATCH_SIZE);
                        renderDesignProjects(nextProjects, false);
                        displayedDesignCount += nextProjects.length;

                        if (displayedDesignCount >= allDesignProjects.length) {
                            loadMoreBtnContainer.style.display = 'none'; // Hide when all loaded
                        }
                    });
                } else {
                    loadMoreBtnContainer.style.display = 'none';
                }
            }

            // Render Code Projects
            if (publicCodeGrid) {
                publicCodeGrid.innerHTML = '';
                if (codeProjects.length === 0) {
                    publicCodeGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">No open source code projects published yet.</div>';
                } else {
                    let codeAddedEls = [];
                    codeProjects.forEach(proj => {
                        const div = document.createElement('div');
                        div.className = 'repo-card glass';

                        let linksHtml = '';
                        if (proj.demo_url) linksHtml += `<a href="${proj.demo_url}" class="repo-link" target="_blank" aria-label="Live Demo"><i class="ri-external-link-line"></i></a>`;
                        if (proj.github_url) linksHtml += `<a href="${proj.github_url}" class="repo-link" target="_blank" aria-label="GitHub"><i class="ri-github-line"></i></a>`;

                        // Default to JS if category not provided or hard to parse, but let's use a generic dot
                        div.innerHTML = `
                            <div class="repo-header">
                                <i class="ri-book-mark-line"></i>
                                <h3>${proj.title}</h3>
                            </div>
                            <p class="repo-desc">${proj.description}</p>
                            <div class="repo-footer">
                                <div class="repo-lang"><span class="lang-dot js" style="background-color: var(--primary-color);"></span> ${proj.category || 'Development'}</div>
                                <div class="repo-links">
                                    ${linksHtml}
                                </div>
                            </div>
                        `;
                        publicCodeGrid.appendChild(div);
                        codeAddedEls.push(div);
                    });

                    codeAddedEls.forEach(el => {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(20px)';
                        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        observer.observe(el);
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch public projects:", err);
            if (publicDesignGrid) publicDesignGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; color: #FF3366;">Could not load projects. Please connect database.</div>';
            if (publicCodeGrid) publicCodeGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; color: #FF3366;">Could not load projects. Please connect database.</div>';
        }
    }

    // Call it
    loadPublicProjects();
});
