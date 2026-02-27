document.addEventListener('DOMContentLoaded', () => {
    // Check if Supabase is initialized
    if (!supabaseClient) {
        alert("Supabase is not configured! Please open js/supabase-config.js and add your Supabase URL and Anon Key.");
        return;
    }

    // Elements
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.getElementById('loginStatus');
    const logoutBtn = document.getElementById('logoutBtn');

    // Auth State Check
    async function checkAuth() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            authSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            logoutBtn.style.display = 'inline-flex';
            loadMessages();
            loadProjects();
        } else {
            authSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }
    checkAuth();

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');

            loginStatus.textContent = '';
            btn.disabled = true;
            btn.innerHTML = 'Signing In... <i class="ri-loader-4-line"></i>';

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginStatus.style.display = 'block';
                loginStatus.style.color = '#FF3366';
                loginStatus.textContent = error.message;
                btn.disabled = false;
                btn.innerHTML = 'Sign In <i class="ri-login-box-line"></i>';
            } else {
                checkAuth();
            }
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            checkAuth();
        });
    }

    // Dashboard Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(`${target}Tab`).style.display = 'block';
        });
    });

    // -------- MESSAGES -------- //
    const messagesTableBody = document.getElementById('messagesTableBody');
    const refreshMessagesBtn = document.getElementById('refreshMessages');

    async function loadMessages() {
        if (!messagesTableBody) return;

        messagesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading messages...</td></tr>';

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            messagesTableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#FF3366">Error: ${error.message} (Did you create the 'messages' table?)</td></tr>`;
            return;
        }

        if (data.length === 0) {
            messagesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No messages received yet.</td></tr>';
            return;
        }

        messagesTableBody.innerHTML = data.map(msg => `
            <tr>
                <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                <td>${msg.name}</td>
                <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                <td>${msg.subject}</td>
                <td>
                    <div class="td-actions">
                        <button class="action-btn btn-view" onclick="viewMessage('${msg.id}')" title="View"><i class="ri-eye-line"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteMessage('${msg.id}')" title="Delete"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Cache messages for modal viewing
        window.cachedMessages = data;
    }

    if (refreshMessagesBtn) refreshMessagesBtn.addEventListener('click', loadMessages);

    // Global functions for inline onclick handlers inside the tables
    window.viewMessage = (id) => {
        const msg = window.cachedMessages.find(m => m.id === id);
        if (!msg) return;

        document.getElementById('modalSubject').textContent = msg.subject;
        document.getElementById('modalName').textContent = msg.name;
        document.getElementById('modalEmail').textContent = msg.email;
        document.getElementById('modalEmail').href = `mailto:${msg.email}`;
        document.getElementById('modalDate').textContent = new Date(msg.created_at).toLocaleString();
        document.getElementById('modalMessageContent').textContent = msg.message;

        document.getElementById('messageModal').style.display = 'flex';
    };

    window.deleteMessage = async (id) => {
        if (confirm('Are you sure you want to delete this message?')) {
            await supabaseClient.from('messages').delete().eq('id', id);
            loadMessages();
        }
    };

    // -------- PROJECTS -------- //
    const projectsTableBody = document.getElementById('projectsTableBody');
    const projectModal = document.getElementById('projectModal');
    const addNewProjectBtn = document.getElementById('addNewProjectBtn');
    const projectForm = document.getElementById('projectForm');

    // Form conditional logic
    const radioDesign = document.querySelector('input[name="projectType"][value="design"]');
    const radioCode = document.querySelector('input[name="projectType"][value="code"]');
    const designFields = document.getElementById('designFields');
    const codeFields = document.getElementById('codeFields');

    function handleProjectTypeChange() {
        if (radioCode.checked) {
            designFields.style.display = 'none';
            codeFields.style.display = 'block';
        } else {
            designFields.style.display = 'block';
            codeFields.style.display = 'none';
        }
    }

    if (radioDesign) radioDesign.addEventListener('change', handleProjectTypeChange);
    if (radioCode) radioCode.addEventListener('change', handleProjectTypeChange);

    // Open Modal
    if (addNewProjectBtn) {
        addNewProjectBtn.addEventListener('click', () => {
            projectForm.reset();
            document.getElementById('projectId').value = '';
            document.getElementById('projectModalTitle').textContent = 'Add New Project';
            document.getElementById('projectFormStatus').textContent = '';
            handleProjectTypeChange();
            projectModal.style.display = 'flex';
        });
    }

    // Modal Close logic
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    async function loadProjects() {
        if (!projectsTableBody) return;

        projectsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading projects...</td></tr>';

        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            projectsTableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#FF3366">Error: ${error.message} (Did you create the 'projects' table?)</td></tr>`;
            return;
        }

        if (data.length === 0) {
            projectsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No projects in database. Check public site for hardcoded placeholders.</td></tr>';
            return;
        }

        projectsTableBody.innerHTML = data.map(proj => `
            <tr>
                <td><strong>${proj.title}</strong></td>
                <td>${proj.category}</td>
                <td><span class="badge ${proj.type === 'design' ? 'bg-primary' : 'bg-accent'}">${proj.type}</span></td>
                <td>
                    ${proj.type === 'design'
                ? (proj.image_url ? `<a href="${proj.image_url}" target="_blank">View Image <i class="ri-external-link-line"></i></a>` : 'N/A')
                : (proj.demo_url ? `<a href="${proj.demo_url}" target="_blank">Live Demo <i class="ri-external-link-line"></i></a>` : (proj.github_url ? `<a href="${proj.github_url}" target="_blank">GitHub <i class="ri-external-link-line"></i></a>` : 'N/A'))
            }
                </td>
                <td>
                    <div class="td-actions">
                        <button class="action-btn btn-edit" onclick="editProject('${proj.id}')" title="Edit"><i class="ri-edit-line"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteProject('${proj.id}')" title="Delete"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        window.cachedProjects = data;
    }

    // Save Project Form
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = projectForm.querySelector('button');
            const status = document.getElementById('projectFormStatus');

            btn.disabled = true;
            btn.textContent = 'Saving...';
            status.textContent = '';

            const id = document.getElementById('projectId').value;
            const type = document.querySelector('input[name="projectType"]:checked').value;
            const title = document.getElementById('projTitle').value;
            const category = document.getElementById('projCategory').value;
            const description = document.getElementById('projDesc').value;

            const payload = { type, title, category, description };

            if (type === 'design') {
                payload.image_url = document.getElementById('projImage').value;
            } else {
                payload.demo_url = document.getElementById('projDemo').value;
                payload.github_url = document.getElementById('projGithub').value;
            }

            let result;
            if (id) {
                // Update
                result = await supabaseClient.from('projects').update(payload).eq('id', id);
            } else {
                // Insert
                result = await supabaseClient.from('projects').insert([payload]);
            }

            btn.disabled = false;
            btn.textContent = 'Save Project';

            if (result.error) {
                status.style.display = 'block';
                status.style.color = '#FF3366';
                status.textContent = result.error.message;
            } else {
                projectModal.style.display = 'none';
                loadProjects();
            }
        });
    }

    // Edit and Delete
    window.editProject = (id) => {
        const proj = window.cachedProjects.find(p => p.id === id);
        if (!proj) return;

        document.getElementById('projectId').value = proj.id;
        document.getElementById('projectModalTitle').textContent = 'Edit Project';

        if (proj.type === 'design') {
            document.querySelector('input[name="projectType"][value="design"]').checked = true;
        } else {
            document.querySelector('input[name="projectType"][value="code"]').checked = true;
        }
        handleProjectTypeChange();

        document.getElementById('projTitle').value = proj.title;
        document.getElementById('projCategory').value = proj.category;
        document.getElementById('projDesc').value = proj.description;

        if (proj.type === 'design') {
            document.getElementById('projImage').value = proj.image_url || '';
        } else {
            document.getElementById('projDemo').value = proj.demo_url || '';
            document.getElementById('projGithub').value = proj.github_url || '';
        }

        document.getElementById('projectFormStatus').textContent = '';
        projectModal.style.display = 'flex';
    };

    window.deleteProject = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await supabaseClient.from('projects').delete().eq('id', id);
            loadProjects();
        }
    };
});
