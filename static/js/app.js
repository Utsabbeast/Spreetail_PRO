function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
const reqHeaders = { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken };

// Global Force logout on any refresh
const isReload = (performance.navigation && performance.navigation.type === 1) || 
                 (performance.getEntriesByType("navigation").length > 0 && performance.getEntriesByType("navigation")[0].type === "reload");

if (isReload) {
    fetch('/api/logout/', { method: 'POST', headers: reqHeaders, credentials: 'same-origin' }).then(() => {
        if (window.location.pathname !== '/login/' && window.location.pathname !== '/register/') {
            window.location.href = '/login/';
        }
    });
}

// Disable browser back/forward arrows
window.history.pushState(null, null, window.location.href);
window.addEventListener('popstate', function(event) {
    window.history.pushState(null, null, window.location.href);
});

function showToast(message, type='info') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class='bx bx-info-circle'></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.togglePassword = function(inputId, btnElem) {
    const input = document.getElementById(inputId);
    const icon = btnElem.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('bx-show');
        icon.classList.add('bx-hide');
    } else {
        input.type = "password";
        icon.classList.remove('bx-hide');
        icon.classList.add('bx-show');
    }
};

// === AUTH ===
const loginBtn = document.getElementById('login-btn');
const regSubmitBtn = document.getElementById('register-submit-btn');
const setPasswordBtn = document.getElementById('set-password-btn');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const err = document.getElementById('auth-error');
        if (!username || !password) return err.innerText = "Fill all fields";
        
        const res = await fetch('/api/login/', { method: 'POST', headers: reqHeaders, body: JSON.stringify({username, password}) });
        const data = await res.json();
        if(data.status === 'success') { window.location.href = '/'; }
        else { err.innerText = data.message || "Invalid credentials"; }
    });
}

if (regSubmitBtn) {
    regSubmitBtn.addEventListener('click', async () => {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const err = document.getElementById('auth-error');
        
        if (!username || !email) return err.innerText = "Fill all fields";
        
        const res = await fetch('/api/register/', { method: 'POST', headers: reqHeaders, body: JSON.stringify({username, email}) });
        const data = await res.json();
        if(data.status === 'success') { 
            const box = document.querySelector('.login-box');
            box.innerHTML = `
                <h1><i class='bx bxs-envelope'></i> Email Sent</h1>
                <p>The activation link has been sent to your email.</p>
                <div style="margin-top:2rem; text-align:center;">
                    <p style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted);">For this demo, click the link below to activate your account:</p>
                    <a href="${data.reset_link}" class="btn primary" style="display:inline-block; text-decoration:none;">Set Password & Activate</a>
                </div>
            `;
        }
        else { err.innerText = data.message || "Registration failed"; }
    });
}

if (setPasswordBtn) {
    setPasswordBtn.addEventListener('click', async () => {
        const password = document.getElementById('set-password').value;
        const confirm = document.getElementById('set-confirm-password').value;
        const uid = document.getElementById('reset-uid').value;
        const token = document.getElementById('reset-token').value;
        const err = document.getElementById('auth-error');
        
        if (!password || !confirm) return err.innerText = "Fill all fields";
        if (password !== confirm) return err.innerText = "Passwords do not match";
        
        const res = await fetch('/api/set-password/', { method: 'POST', headers: reqHeaders, body: JSON.stringify({uid, token, password}) });
        const data = await res.json();
        if(data.status === 'success') { window.location.href = '/'; }
        else { err.innerText = data.message || "Failed to set password"; }
    });
}

// === DASHBOARD ===
let currentGroupId = null;
let currentExpenseId = null;
let chatInterval = null;
let groupMembers = [];

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await fetch('/api/logout/', { method:'POST', headers: reqHeaders, credentials: 'same-origin' });
            window.location.href = '/login/';
        });
        loadGroups();
    }
});

async function loadGroups() {
    const res = await fetch('/api/groups/');
    if(res.status === 401 || res.status === 403) return window.location.href='/login/';
    const data = await res.json();
    const list = document.getElementById('group-list');
    list.innerHTML = '';
    data.groups.forEach(g => {
        const li = document.createElement('li');
        li.innerHTML = `<i class='bx bx-hash'></i> ${g.name}`;
        li.onclick = () => selectGroup(g.id, g.name, li);
        list.appendChild(li);
    });
}

// Modals Setup
const groupNameModal = document.getElementById('group-name-modal');
document.getElementById('new-group-btn')?.addEventListener('click', () => { groupNameModal.classList.remove('hidden'); document.getElementById('new-group-name').value = ''; });
function closeGroupModal() { groupNameModal.classList.add('hidden'); }
document.getElementById('submit-group-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('new-group-name').value;
    if(!name) return showToast("Name is required", "error");
    await fetch('/api/groups/', { method: 'POST', headers: reqHeaders, body: JSON.stringify({name}) });
    closeGroupModal();
    showToast("Group created!");
    loadGroups();
});

async function selectGroup(id, name, liElem) {
    currentGroupId = id;
    document.querySelectorAll('#group-list li').forEach(el => el.classList.remove('active'));
    liElem.classList.add('active');
    document.getElementById('active-group-title').innerText = name;
    document.getElementById('group-actions').style.display = 'flex';
    document.getElementById('group-content').style.display = 'flex';
    await fetchMembers();
    loadExpenses();
    loadBalances();
}

// === MEMBERS MODAL ===
const membersModal = document.getElementById('members-modal');
document.getElementById('manage-members-btn')?.addEventListener('click', () => {
    membersModal.classList.remove('hidden');
    renderMembersList();
});
function closeMembersModal() { membersModal.classList.add('hidden'); }

let groupMembers = [];
let pendingMembers = [];

async function fetchMembers() {
    const res = await fetch(`/api/groups/${currentGroupId}/members/`, { headers: reqHeaders });
    const data = await res.json();
    groupMembers = data.members || [];
    pendingMembers = data.pending || [];
}

function renderMembersList() {
    const list = document.getElementById('manage-members-list');
    let html = groupMembers.map(m => `
        <div class="split-row" style="margin-bottom: 0.5rem;">
            <span><i class='bx bx-user'></i> ${m.username}</span>
            <button class="btn-icon" onclick="removeMember(${m.id})"><i class='bx bx-trash' style="color:var(--danger)"></i></button>
        </div>
    `).join('');
    
    html += pendingMembers.map(m => `
        <div class="split-row" style="margin-bottom: 0.5rem; opacity: 0.7;">
            <span><i class='bx bx-time'></i> ${m.username} <small>(Invitation sent)</small></span>
        </div>
    `).join('');
    
    list.innerHTML = html;
}

document.getElementById('submit-add-member-btn')?.addEventListener('click', async () => {
    const username = document.getElementById('new-member-username').value;
    const seq = document.getElementById('new-member-seq').value;
    if (!username || !seq) return showToast('Please enter both username and Seq #');
    
    const res = await fetch(`/api/groups/${currentGroupId}/members/`, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({username, sequence_number: seq})
    });
    const data = await res.json();
    if(data.status === 'success') {
        document.getElementById('new-member-username').value = '';
        document.getElementById('new-member-seq').value = '';
        showToast('Invitation sent successfully!');
        fetchMembers().then(renderMembersList);
    } else {
        showToast(data.message || "Failed to add", "error");
    }
});

async function removeMember(userId) {
    if(!confirm("Are you sure you want to remove this user?")) return;
    const res = await fetch(`/api/groups/${currentGroupId}/members/`, { method: 'DELETE', headers: reqHeaders, body: JSON.stringify({user_id: userId}) });
    const data = await res.json();
    if(data.status === 'success') {
        showToast("Member removed");
        await fetchMembers();
        renderMembersList();
    } else {
        showToast(data.message || "Failed to remove", "error");
    }
}

// === EXPENSES ===
async function loadExpenses() {
    const res = await fetch(`/api/groups/${currentGroupId}/expenses/`);
    const data = await res.json();
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    data.expenses.forEach(e => {
        const div = document.createElement('div');
        div.className = 'expense-card';
        div.innerHTML = `<div class="expense-info"><h4><i class='bx bx-receipt'></i> ${e.description}</h4><p>Paid by ${e.paid_by} on ${new Date(e.created_at).toLocaleDateString()}</p></div><div class="expense-amount">$${e.total_amount.toFixed(2)}</div>`;
        div.onclick = () => openChatModal(e.id);
        list.appendChild(div);
    });
}

// === BALANCES ===
async function loadBalances() {
    const res = await fetch(`/api/groups/${currentGroupId}/balances/`);
    const data = await res.json();
    const list = document.getElementById('balance-list');
    list.innerHTML = '';
    data.balances.forEach(b => {
        if(Math.abs(b.net_balance) < 0.01) return;
        const div = document.createElement('div');
        const isPos = b.net_balance > 0;
        div.className = `balance-card ${isPos ? 'positive' : 'negative'}`;
        div.innerHTML = `<div class="expense-info"><h4><i class='bx bx-user'></i> ${b.username}</h4><p>${isPos ? 'Gets back' : 'Owes'}</p></div><div class="balance-amount">${isPos ? '+' : '-'}$${Math.abs(b.net_balance).toFixed(2)}</div>`;
        list.appendChild(div);
    });
}

// === SETTLE UP MODAL ===
const settleModal = document.getElementById('settle-modal');
document.getElementById('settle-up-btn')?.addEventListener('click', () => {
    if(groupMembers.length < 2) return showToast("Need members to settle up", "error");
    settleModal.classList.remove('hidden');
    document.getElementById('settle-amount').value = '';
    const payeeSelect = document.getElementById('settle-payee');
    payeeSelect.innerHTML = groupMembers.map(m => `<option value="${m.id}">${m.username}</option>`).join('');
});
function closeSettleModal() { settleModal.classList.add('hidden'); }

document.getElementById('submit-settle-btn')?.addEventListener('click', async () => {
    const payee_id = parseInt(document.getElementById('settle-payee').value);
    const amount = parseFloat(document.getElementById('settle-amount').value);
    if(!amount || amount <= 0) return showToast("Invalid amount", "error");
    await fetch(`/api/groups/${currentGroupId}/settle/`, { method: 'POST', headers: reqHeaders, body: JSON.stringify({payee_id, amount}) });
    closeSettleModal();
    showToast("Payment recorded!");
    loadBalances();
});

// === ADD EXPENSE MODAL & ADVANCED SPLITS ===
const expModal = document.getElementById('expense-modal');
const expAmount = document.getElementById('exp-amount');
const splitInputs = document.getElementById('split-inputs');
const splitStrategy = document.getElementById('split-strategy');

document.getElementById('add-expense-btn')?.addEventListener('click', () => {
    expModal.classList.remove('hidden');
    document.getElementById('exp-desc').value = '';
    expAmount.value = '';
    splitStrategy.value = 'equal';
    const payerSelect = document.getElementById('exp-payer');
    payerSelect.innerHTML = groupMembers.map(m => `<option value="${m.id}">${m.username}</option>`).join('');
    renderSplitInputs();
});

function closeExpenseModal() { expModal.classList.add('hidden'); }

splitStrategy?.addEventListener('change', renderSplitInputs);
expAmount?.addEventListener('input', calculateSplits);

function renderSplitInputs() {
    const strat = splitStrategy.value;
    splitInputs.innerHTML = groupMembers.map(m => `
        <div class="split-row">
            <span>${m.username}</span>
            <div style="display:flex; align-items:center; gap:0.5rem;">
                ${strat === 'percent' ? '%' : strat === 'share' ? 'Shares' : '$'}
                <input type="number" step="0.01" class="split-val" data-uid="${m.id}" value="${strat==='share'?1:0}">
                ${(strat === 'percent' || strat === 'share') ? `&nbsp; => $<span class="calc-amt" data-uid="${m.id}">0.00</span>` : ''}
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.split-val').forEach(inp => inp.addEventListener('input', calculateSplits));
    calculateSplits();
}

function calculateSplits() {
    const total = parseFloat(expAmount.value) || 0;
    const strat = splitStrategy.value;
    const inputs = document.querySelectorAll('.split-val');
    
    if (strat === 'equal') {
        const split = (total / groupMembers.length).toFixed(2);
        inputs.forEach(inp => inp.value = split);
    } 
    else if (strat === 'percent') {
        inputs.forEach(inp => {
            const pct = parseFloat(inp.value) || 0;
            const amt = (total * (pct / 100)).toFixed(2);
            document.querySelector(`.calc-amt[data-uid="${inp.dataset.uid}"]`).innerText = amt;
        });
    }
    else if (strat === 'share') {
        let totalShares = 0;
        inputs.forEach(inp => totalShares += (parseFloat(inp.value) || 0));
        inputs.forEach(inp => {
            const shares = parseFloat(inp.value) || 0;
            const amt = totalShares > 0 ? (total * (shares / totalShares)).toFixed(2) : '0.00';
            document.querySelector(`.calc-amt[data-uid="${inp.dataset.uid}"]`).innerText = amt;
        });
    }
}

document.getElementById('save-expense-btn')?.addEventListener('click', async () => {
    const description = document.getElementById('exp-desc').value;
    const total_amount = parseFloat(expAmount.value);
    const paid_by_id = parseInt(document.getElementById('exp-payer').value);
    const strat = splitStrategy.value;
    
    let splits = [];
    if (strat === 'equal' || strat === 'exact') {
        splits = Array.from(document.querySelectorAll('.split-val')).map(inp => ({
            user_id: parseInt(inp.getAttribute('data-uid')),
            amount_owed: parseFloat(inp.value) || 0
        }));
    } else {
        splits = Array.from(document.querySelectorAll('.calc-amt')).map(span => ({
            user_id: parseInt(span.getAttribute('data-uid')),
            amount_owed: parseFloat(span.innerText) || 0
        }));
    }
    
    const sum = splits.reduce((a, b) => a + b.amount_owed, 0);
    if(Math.abs(sum - total_amount) > 0.05) return showToast("Splits must sum to total amount!", "error");
    
    await fetch(`/api/groups/${currentGroupId}/expenses/`, { 
        method: 'POST', headers: reqHeaders, 
        body: JSON.stringify({description, total_amount, paid_by_id, splits}) 
    });
    
    closeExpenseModal();
    showToast("Expense added!");
    loadExpenses();
    loadBalances();
});

// === CHAT MODAL ===
const chatModal = document.getElementById('chat-modal');
const chatMsgs = document.getElementById('chat-messages');

function openChatModal(expId) {
    currentExpenseId = expId;
    chatModal.classList.remove('hidden');
    loadChat();
    chatInterval = setInterval(loadChat, 3000);
}

// --- Invitations System ---
const viewInvitationsBtn = document.getElementById('view-invitations-btn');
const invitationsModal = document.getElementById('invitations-modal');
const invitationsList = document.getElementById('invitations-list');
const inviteBadge = document.getElementById('invite-badge');

if (viewInvitationsBtn) {
    viewInvitationsBtn.addEventListener('click', () => {
        invitationsModal.classList.remove('hidden');
        loadInvitations();
    });
}

async function loadInvitations() {
    try {
        const res = await fetch('/api/invitations/', { headers: reqHeaders });
        if (res.status === 401 || res.status === 403) return;
        const data = await res.json();
        
        if (data.invitations && data.invitations.length > 0) {
            inviteBadge.style.display = 'inline-block';
            inviteBadge.innerText = data.invitations.length;
            
            if (invitationsList) {
                invitationsList.innerHTML = data.invitations.map(i => `
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${i.group_name}</strong><br>
                            <small style="color:var(--text-muted)">Invited by ${i.invited_by}</small>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn success" onclick="handleInvite(${i.id}, 'accept')" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Accept</button>
                            <button class="btn secondary" onclick="handleInvite(${i.id}, 'deny')" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Deny</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            inviteBadge.style.display = 'none';
            if (invitationsList) invitationsList.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No pending invitations.</p>';
        }
    } catch(e) {}
}

window.handleInvite = async (id, action) => {
    const res = await fetch(`/api/invitations/${id}/${action}/`, { method: 'POST', headers: reqHeaders });
    const data = await res.json();
    showToast(data.message);
    loadInvitations();
    loadGroups(); // Refresh groups if accepted
};

// Initial calls
loadGroups();
setInterval(loadGroups, 15000);
loadInvitations();
setInterval(loadInvitations, 10000);

function closeChatModal() {
    chatModal.classList.add('hidden');
    clearInterval(chatInterval);
    currentExpenseId = null;
}

async function loadChat() {
    if(!currentExpenseId) return;
    const res = await fetch(`/api/expenses/${currentExpenseId}/chat/`);
    const data = await res.json();
    chatMsgs.innerHTML = data.messages.map(m => `
        <div class="chat-msg">
            <strong><i class='bx bx-user-circle'></i> ${m.user} <span style="font-size:0.7em;font-weight:normal;">${new Date(m.created_at).toLocaleTimeString()}</span></strong>
            ${m.message}
        </div>
    `).join('');
}

document.getElementById('send-chat-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if(!message.trim()) return;
    await fetch(`/api/expenses/${currentExpenseId}/chat/`, { method: 'POST', headers: reqHeaders, body: JSON.stringify({message}) });
    input.value = '';
    loadChat();
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
});
