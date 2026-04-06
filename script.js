// ===== GESTIONNAIRE DE THÈME =====
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const toggles = document.querySelectorAll('.btn-icon');
        toggles.forEach(toggle => {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggle.title = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
    }

    setupEventListeners() {
        document.querySelectorAll('.btn-icon').forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });
    }
}

// ===== NAVIGATION MOBILE =====
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.highlightActiveNav();
    }

    highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'Home.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === currentPage);
        });
    }

    setupMobileMenu() {
        const btn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        if (!btn || !navLinks) return;

        btn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('show');
            btn.textContent = isOpen ? '✕' : '☰';
            btn.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                btn.textContent = '☰';
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                navLinks.classList.remove('show');
                btn.textContent = '☰';
            }
        });
    }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const siblings = entry.target.parentNode?.children;
                    let index = 0;
                    if (siblings) {
                        index = Array.from(siblings).indexOf(entry.target);
                    }
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, Math.min(index * 80, 400));
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        const elements = document.querySelectorAll(
            '.project, .preview-card, .hero-card, .card, .article-card, .stat-card, .bilan-section, .timeline-step, .veille-description, .veille-synthesis, .competences-tableau'
        );
        elements.forEach(el => {
            el.classList.add('fade-in');
            this.observer.observe(el);
        });
    }
}

// ===== SKILL BARS ANIMATION =====
class SkillBarManager {
    constructor() {
        this.init();
    }

    init() {
        const bars = document.querySelectorAll('.skill-bar-fill');
        if (!bars.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const target = parseFloat(bar.style.getPropertyValue('--target') || 0);
                    bar.style.transform = `scaleX(${target})`;
                    bar.classList.add('animate');
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        bars.forEach(bar => {
            bar.style.transform = 'scaleX(0)';
            observer.observe(bar);
        });
    }
}

// ===== PROJETS — expand/collapse =====
class ProjectManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupExpandButtons();
        this.setupHoverEffects();
    }

    setupExpandButtons() {
        document.querySelectorAll('.btn-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const project = btn.closest('.project');
                const summary = project?.querySelector('.project-summary');
                if (!summary) return;

                const isOpen = summary.classList.toggle('active');
                btn.classList.toggle('open', isOpen);
                const textSpan = btn.querySelector('.btn-text');
                if (textSpan) textSpan.textContent = isOpen ? 'Réduire' : 'Voir les détails';
            });
        });

        document.querySelectorAll('.project').forEach(project => {
            project.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) return;
                this.showModal(project);
            });
        });
    }

    showModal(project) {
        const title = project.querySelector('h3')?.textContent || '';
        const summary = project.querySelector('.project-summary p')?.textContent || '';
        const objective = project.querySelector('.project-objective')?.textContent?.replace('Objectif :', '').trim() || '';
        const tags = project.querySelector('.project-tags')?.textContent || '';
        const competences = project.querySelector('.project-competences span')?.textContent || '';
        const links = project.querySelectorAll('.project-actions a');

        const linksHTML = Array.from(links).map(a =>
            `<a href="${a.href}" target="_blank" class="btn btn-outline" style="font-size:0.85rem;">${a.textContent}</a>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;
            z-index:10000;padding:1.5rem;opacity:0;transition:opacity 0.3s ease;backdrop-filter:blur(4px);
        `;
        modal.innerHTML = `
            <div style="
                background:var(--bg-white);border-radius:16px;max-width:640px;width:100%;
                max-height:88vh;overflow-y:auto;transform:scale(0.92);transition:transform 0.3s ease;
                border:1px solid var(--surface-mid);
            ">
                <div style="padding:2rem;">
                    <h2 style="font-family:var(--font-display);color:var(--primary-color);margin-bottom:1rem;font-size:1.4rem;">${title}</h2>
                    <p style="background:var(--surface-light);padding:0.9rem 1rem;border-radius:10px;border-left:3px solid var(--accent-color);font-size:0.9rem;color:var(--text-mid);margin-bottom:0.85rem;line-height:1.6;">${objective}</p>
                    ${competences ? `<p style="background:color-mix(in srgb,var(--secondary-color) 6%,transparent);padding:0.75rem 1rem;border-radius:10px;border:1px solid color-mix(in srgb,var(--secondary-color) 20%,transparent);font-size:0.82rem;color:var(--text-mid);margin-bottom:0.85rem;"><strong style="color:var(--secondary-color);display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Compétences E5</strong>${competences}</p>` : ''}
                    <p style="color:var(--text-mid);font-size:0.92rem;line-height:1.75;margin-bottom:1.25rem;">${summary}</p>
                    <p style="font-size:0.82rem;font-weight:600;color:var(--primary-color);margin-bottom:1.25rem;font-family:var(--font-display);">${tags}</p>
                    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
                        ${linksHTML}
                        <button class="modal-close" style="
                            margin-left:auto;padding:0.5rem 1.1rem;
                            background:var(--surface-light);color:var(--text-mid);
                            border:1.5px solid var(--surface-mid);border-radius:8px;cursor:pointer;
                            font-family:var(--font-body);font-size:0.85rem;transition:all 0.2s;
                        ">Fermer</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('div').style.transform = 'scale(1)';
        });

        const close = () => {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.92)';
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    }

    setupHoverEffects() {
        document.querySelectorAll('.project').forEach(project => {
            project.addEventListener('mousemove', (e) => {
                const thumb = project.querySelector('.project-thumb');
                if (!thumb) return;
                const rect = project.getBoundingClientRect();
                const moveX = ((e.clientX - rect.left) - rect.width / 2) / 25;
                const moveY = ((e.clientY - rect.top) - rect.height / 2) / 25;
                thumb.style.transform = `scale(1.06) translate(${moveX}px, ${moveY}px)`;
            });
            project.addEventListener('mouseleave', () => {
                const thumb = project.querySelector('.project-thumb');
                if (thumb) thumb.style.transform = '';
            });
        });
    }
}

// ===== VEILLE — filtres =====
class VeilleManager {
    constructor() {
        this.articles = document.querySelectorAll('.article-card');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.init();
    }

    init() {
        if (!this.filterButtons.length) return;
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                const filter = button.getAttribute('data-filter');
                this.articles.forEach(article => {
                    const match = filter === 'all' || article.getAttribute('data-category') === filter;
                    article.style.display = match ? 'flex' : 'none';
                });
            });
        });
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    new ScrollAnimations();
    new SkillBarManager();
    new ProjectManager();
    new VeilleManager();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.project-modal').forEach(m => m.remove());
            document.body.style.overflow = '';
        }
    });
});

window.addEventListener('error', (e) => console.error('Erreur:', e.error));
