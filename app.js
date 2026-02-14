// === State ===
const defaultState = () => ({
  version: 1,
  header: { name: '', email: '', phone: '', website: '', location: '' },
  summaries: [],
  activeSummaryId: null,
  jobs: [],
  placedJobs: [],
  skills: [],
  education: [],
  styleId: 1
});

let state = defaultState();
let editingJobId = null;
let editingSummaryId = null;
let editingEducationId = null;
let selectedPlacedJobId = null;
let editingBullets = []; // temp bullets while editing a job form

// === Utility ===
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateRange(job) {
  const start = `${MONTHS[job.startMonth] || ''} ${job.startYear || ''}`.trim();
  const end = job.current ? 'Present' : `${MONTHS[job.endMonth] || ''} ${job.endYear || ''}`.trim();
  return `${start} – ${end}`;
}

// === Populate month selects ===
function populateMonthSelects() {
  ['job-start-month', 'job-end-month'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Month</option>';
    for (let i = 1; i <= 12; i++) {
      sel.innerHTML += `<option value="${i}">${MONTHS[i]}</option>`;
    }
  });
}

// === Style Definitions ===
const STYLES = [
  { id: 1,  name: 'Classic',        font: 'Georgia', align: 'center', accent: '#333',    sectionLine: '1px solid #333' },
  { id: 2,  name: 'Professional',   font: 'Helvetica', align: 'left', accent: '#2c5282', sectionLine: '2px solid #2c5282' },
  { id: 3,  name: 'Executive',      font: 'Garamond', align: 'center', accent: '#1a202c', banner: '#1a202c' },
  { id: 4,  name: 'Modern Minimal', font: 'Segoe UI', align: 'center', accent: '#4a5568', sectionLine: 'none' },
  { id: 5,  name: 'Sidebar Accent', font: 'Segoe UI', align: 'left', accent: '#0d9488',  leftBar: '#0d9488' },
  { id: 6,  name: 'Bold Impact',    font: 'Arial',   align: 'left',   accent: '#1a1a1a', sectionLine: '3px solid #1a1a1a' },
  { id: 7,  name: 'Elegant Serif',  font: 'Palatino', align: 'center', accent: '#7b2d3b', sectionLine: 'none' },
  { id: 8,  name: 'Developer',      font: 'Consolas', align: 'left',   accent: '#2c5282', leftBar: '#2c5282' },
  { id: 9,  name: 'Creative',       font: 'Trebuchet', align: 'left',  accent: '#6c3483', sectionBg: '#f5f0ff' },
  { id: 10, name: 'Top Banner',     font: 'Segoe UI', align: 'center', accent: '#0d9488', banner: '#0d9488' },
  { id: 11, name: 'Compact',        font: 'Arial Narrow', align: 'left', accent: '#333', sectionLine: '1px solid #333' },
  { id: 12, name: 'Academic',       font: 'Georgia', align: 'center', accent: '#333',    sectionLine: '1px solid #999' },
  { id: 13, name: 'Dotted',         font: 'Georgia', align: 'left',   accent: '#276749', sectionLine: '2px dotted #276749' },
  { id: 14, name: 'Formal',         font: 'Book Antiqua', align: 'center', accent: '#222', sectionLine: '3px double #222' },
  { id: 15, name: 'Sleek',          font: 'Century Gothic', align: 'left', accent: '#d35400', sectionLine: 'none' },
  { id: 16, name: 'Two-Tone',       font: 'Verdana', align: 'center', accent: '#2e4057', banner: '#2e4057' },
];

function renderStyleGrid() {
  const grid = document.getElementById('style-grid');
  grid.innerHTML = '';
  STYLES.forEach(s => {
    const card = document.createElement('div');
    card.className = 'style-card' + (state.styleId === s.id ? ' selected' : '');
    const previewAlign = s.align === 'left' ? 'text-align:left' : 'text-align:center';
    const hasBanner = s.banner;
    const hasLeftBar = s.leftBar;
    const sectionBg = s.sectionBg || 'transparent';
    const sectionBorder = s.sectionLine && s.sectionLine !== 'none' ? `border-bottom:${s.sectionLine}` : '';
    const headerBg = hasBanner ? `background:${s.banner};color:#fff;padding:4px;margin:-4px -4px 3px;` : '';
    const headerNameColor = hasBanner ? '#fff' : s.accent;
    const leftBarStyle = hasLeftBar ? `border-left:3px solid ${s.leftBar};` : '';
    card.innerHTML = `
      <div class="style-preview" style="font-family:${s.font},serif;${previewAlign};${leftBarStyle}">
        <div style="${headerBg}">
          <div style="font-weight:700;font-size:7px;color:${headerNameColor};margin-bottom:1px;">John Doe</div>
          <div style="font-size:3.5px;color:${hasBanner ? '#ccc' : '#888'};margin-bottom:3px;">email | phone | city</div>
        </div>
        <div style="${sectionBorder};font-size:4.5px;font-weight:700;color:${s.accent};margin-bottom:2px;padding-bottom:1px;background:${sectionBg};${s.sectionLine === 'none' ? '' : ''}">EXPERIENCE</div>
        <div style="font-size:4px;margin-bottom:1px;"><b>Software Engineer</b></div>
        <div style="font-size:3.5px;color:#666;">Acme Corp</div>
      </div>
      <div class="style-name">${s.name}</div>`;
    card.addEventListener('click', () => {
      state.styleId = s.id;
      applyStyle();
      renderStyleGrid();
    });
    grid.appendChild(card);
  });
}

function applyStyle() {
  const page = document.getElementById('resume-page');
  // Remove all style-N classes
  page.className = page.className.replace(/\bstyle-\d+\b/g, '').trim();
  if (state.styleId > 1) {
    page.classList.add('style-' + state.styleId);
  }
}

// === Tab Switching ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

function switchToTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

// === Header ===
document.querySelectorAll('#resume-header .editable').forEach(el => {
  el.addEventListener('input', () => {
    state.header[el.dataset.field] = el.textContent.trim();
  });
});

function renderHeader() {
  document.querySelectorAll('#resume-header .editable').forEach(el => {
    const val = state.header[el.dataset.field] || '';
    if (el.textContent.trim() !== val) el.textContent = val;
  });
}

// === Summary ===
const btnNewSummary = document.getElementById('btn-new-summary');
const summaryForm = document.getElementById('summary-form');
const summaryLabel = document.getElementById('summary-label');
const summaryText = document.getElementById('summary-text');
const summaryList = document.getElementById('summary-list');

btnNewSummary.addEventListener('click', () => {
  editingSummaryId = null;
  summaryLabel.value = '';
  summaryText.value = '';
  summaryForm.style.display = '';
  btnNewSummary.style.display = 'none';
});

document.getElementById('btn-cancel-summary').addEventListener('click', () => {
  summaryForm.style.display = 'none';
  btnNewSummary.style.display = '';
});

document.getElementById('btn-save-summary').addEventListener('click', () => {
  const label = summaryLabel.value.trim();
  const text = summaryText.value.trim();
  if (!label || !text) return;

  if (editingSummaryId) {
    const s = state.summaries.find(s => s.id === editingSummaryId);
    if (s) { s.label = label; s.text = text; }
  } else {
    state.summaries.push({ id: uuid(), label, text });
  }
  summaryForm.style.display = 'none';
  btnNewSummary.style.display = '';
  editingSummaryId = null;
  render();
});

function renderSummaryList() {
  summaryList.innerHTML = '';
  state.summaries.forEach(s => {
    const div = document.createElement('div');
    div.className = 'summary-item' + (state.activeSummaryId === s.id ? ' selected' : '');
    div.innerHTML = `
      <div>
        <div class="label">${esc(s.label)}</div>
        <div class="preview">${esc(s.text.substring(0, 80))}${s.text.length > 80 ? '...' : ''}</div>
      </div>
      <div class="actions">
        <button class="btn btn-sm btn-edit" title="Edit">&#9998;</button>
        <button class="btn btn-sm btn-del" title="Delete">&times;</button>
      </div>`;
    div.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit') || e.target.closest('.btn-del')) return;
      state.activeSummaryId = state.activeSummaryId === s.id ? null : s.id;
      render();
    });
    div.querySelector('.btn-edit').addEventListener('click', () => {
      editingSummaryId = s.id;
      summaryLabel.value = s.label;
      summaryText.value = s.text;
      summaryForm.style.display = '';
      btnNewSummary.style.display = 'none';
    });
    div.querySelector('.btn-del').addEventListener('click', () => {
      state.summaries = state.summaries.filter(x => x.id !== s.id);
      if (state.activeSummaryId === s.id) state.activeSummaryId = null;
      render();
    });
    summaryList.appendChild(div);
  });
}

function renderResumeSummary() {
  const section = document.getElementById('resume-summary');
  const content = document.getElementById('summary-content');
  const active = state.summaries.find(s => s.id === state.activeSummaryId);
  if (active) {
    section.style.display = '';
    content.textContent = active.text;
  } else {
    section.style.display = 'none';
  }
}

// === Jobs ===
const btnNewJob = document.getElementById('btn-new-job');
const jobForm = document.getElementById('job-form');
const jobList = document.getElementById('job-list');

btnNewJob.addEventListener('click', () => {
  editingJobId = null;
  editingBullets = [];
  document.getElementById('job-title').value = '';
  document.getElementById('job-company').value = '';
  document.getElementById('job-start-month').value = '';
  document.getElementById('job-start-year').value = '';
  document.getElementById('job-end-month').value = '';
  document.getElementById('job-end-year').value = '';
  document.getElementById('job-current').checked = false;
  jobForm.style.display = '';
  btnNewJob.style.display = 'none';
  renderBulletEditor();
});

document.getElementById('btn-cancel-job').addEventListener('click', () => {
  jobForm.style.display = 'none';
  btnNewJob.style.display = '';
  editingJobId = null;
});

document.getElementById('btn-add-bullet').addEventListener('click', () => {
  const input = document.getElementById('new-bullet-text');
  const text = input.value.trim();
  if (!text) return;
  editingBullets.push({ id: uuid(), text });
  input.value = '';
  renderBulletEditor();
});

document.getElementById('new-bullet-text').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-add-bullet').click();
});

function renderBulletEditor() {
  const container = document.getElementById('bullet-list-edit');
  container.innerHTML = '';
  editingBullets.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'bullet-edit-item';
    div.innerHTML = `<input type="text" value="${esc(b.text)}"><button class="btn-remove" title="Remove">&times;</button>`;
    div.querySelector('input').addEventListener('change', (e) => { b.text = e.target.value; });
    div.querySelector('.btn-remove').addEventListener('click', () => {
      editingBullets.splice(i, 1);
      renderBulletEditor();
    });
    container.appendChild(div);
  });
}

document.getElementById('btn-save-job').addEventListener('click', () => {
  const title = document.getElementById('job-title').value.trim();
  const company = document.getElementById('job-company').value.trim();
  if (!title || !company) return;

  const jobData = {
    id: editingJobId || uuid(),
    title,
    company,
    startMonth: parseInt(document.getElementById('job-start-month').value) || 0,
    startYear: parseInt(document.getElementById('job-start-year').value) || 0,
    endMonth: parseInt(document.getElementById('job-end-month').value) || 0,
    endYear: parseInt(document.getElementById('job-end-year').value) || 0,
    current: document.getElementById('job-current').checked,
    bullets: editingBullets.map(b => ({ id: b.id, text: b.text.trim() })).filter(b => b.text)
  };

  if (editingJobId) {
    const idx = state.jobs.findIndex(j => j.id === editingJobId);
    if (idx >= 0) state.jobs[idx] = jobData;
    // Sync placed job bullet references with the updated bullet list
    const placed = state.placedJobs.find(p => p.jobId === editingJobId);
    if (placed) {
      const newBulletIds = jobData.bullets.map(b => b.id);
      // Remove stale IDs that no longer exist
      placed.bulletOrder = placed.bulletOrder.filter(id => newBulletIds.includes(id));
      placed.enabledBulletIds = placed.enabledBulletIds.filter(id => newBulletIds.includes(id));
      // Add any new bullets
      newBulletIds.forEach(id => {
        if (!placed.bulletOrder.includes(id)) {
          placed.bulletOrder.push(id);
          placed.enabledBulletIds.push(id);
        }
      });
    }
  } else {
    state.jobs.push(jobData);
  }

  jobForm.style.display = 'none';
  btnNewJob.style.display = '';
  editingJobId = null;
  render();
});

function renderJobList() {
  jobList.innerHTML = '';
  const placedIds = new Set(state.placedJobs.map(p => p.jobId));
  state.jobs.forEach(job => {
    const div = document.createElement('div');
    div.className = 'job-card' + (placedIds.has(job.id) ? ' placed' : '');
    div.draggable = true;
    div.dataset.jobId = job.id;
    div.innerHTML = `
      <span class="drag-handle">&#9776;</span>
      <div class="job-info">
        <div class="job-title-line">${esc(job.title)}</div>
        <div class="job-company-line">${esc(job.company)} · ${formatDateRange(job)}</div>
      </div>
      <div class="actions">
        <button class="btn btn-sm btn-edit" title="Edit">&#9998;</button>
        <button class="btn btn-sm btn-del" title="Delete">&times;</button>
      </div>`;

    // Drag start
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/job-id', job.id);
      e.dataTransfer.effectAllowed = 'move';
      div.style.opacity = '0.5';
    });
    div.addEventListener('dragend', () => { div.style.opacity = ''; });

    div.querySelector('.btn-edit').addEventListener('click', () => {
      editingJobId = job.id;
      document.getElementById('job-title').value = job.title;
      document.getElementById('job-company').value = job.company;
      document.getElementById('job-start-month').value = job.startMonth || '';
      document.getElementById('job-start-year').value = job.startYear || '';
      document.getElementById('job-end-month').value = job.endMonth || '';
      document.getElementById('job-end-year').value = job.endYear || '';
      document.getElementById('job-current').checked = job.current;
      editingBullets = job.bullets.map(b => ({ ...b }));
      jobForm.style.display = '';
      btnNewJob.style.display = 'none';
      renderBulletEditor();
    });

    div.querySelector('.btn-del').addEventListener('click', () => {
      if (!confirm(`Delete "${job.title}" at ${job.company}?`)) return;
      state.jobs = state.jobs.filter(j => j.id !== job.id);
      state.placedJobs = state.placedJobs.filter(p => p.jobId !== job.id);
      render();
    });

    jobList.appendChild(div);
  });
}

// === Drag & Drop for Experience ===
const dropZone = document.getElementById('experience-drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  dropZone.classList.add('drag-over');

  // Show drop indicator
  const entries = dropZone.querySelectorAll('.experience-entry');
  removeDropIndicators();
  if (entries.length === 0) return;

  const afterEntry = getDragAfterEntry(e.clientY);
  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  if (afterEntry) {
    dropZone.insertBefore(indicator, afterEntry);
  } else {
    dropZone.appendChild(indicator);
  }
});

dropZone.addEventListener('dragleave', (e) => {
  if (!dropZone.contains(e.relatedTarget)) {
    dropZone.classList.remove('drag-over');
    removeDropIndicators();
  }
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  removeDropIndicators();

  const jobId = e.dataTransfer.getData('application/job-id');
  const placedJobId = e.dataTransfer.getData('application/placed-job-id');

  if (placedJobId) {
    // Reordering an already-placed job
    const oldIdx = state.placedJobs.findIndex(p => p.jobId === placedJobId);
    if (oldIdx < 0) return;
    const [moved] = state.placedJobs.splice(oldIdx, 1);
    const newIdx = getDropIndex(e.clientY);
    state.placedJobs.splice(newIdx, 0, moved);
  } else if (jobId) {
    // Adding a new job or moving it
    const alreadyPlaced = state.placedJobs.find(p => p.jobId === jobId);
    if (alreadyPlaced) {
      // Already placed — reorder
      const oldIdx = state.placedJobs.indexOf(alreadyPlaced);
      const [moved] = state.placedJobs.splice(oldIdx, 1);
      const newIdx = getDropIndex(e.clientY);
      state.placedJobs.splice(newIdx, 0, moved);
    } else {
      const job = state.jobs.find(j => j.id === jobId);
      if (!job) return;
      const newPlaced = {
        jobId: job.id,
        enabledBulletIds: job.bullets.map(b => b.id),
        bulletOrder: job.bullets.map(b => b.id)
      };
      const newIdx = getDropIndex(e.clientY);
      state.placedJobs.splice(newIdx, 0, newPlaced);
    }
  }
  render();
});

function getDragAfterEntry(y) {
  const entries = [...dropZone.querySelectorAll('.experience-entry')];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;
  entries.forEach(entry => {
    const box = entry.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = entry;
    }
  });
  return closest;
}

function getDropIndex(y) {
  const entries = [...dropZone.querySelectorAll('.experience-entry')];
  for (let i = 0; i < entries.length; i++) {
    const box = entries[i].getBoundingClientRect();
    if (y < box.top + box.height / 2) return i;
  }
  return entries.length;
}

function removeDropIndicators() {
  dropZone.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}

function renderExperience() {
  const placeholder = dropZone.querySelector('.drop-placeholder');
  // Remove old entries
  dropZone.querySelectorAll('.experience-entry').forEach(el => el.remove());

  if (state.placedJobs.length === 0) {
    if (placeholder) placeholder.style.display = '';
    return;
  }
  if (placeholder) placeholder.style.display = 'none';

  state.placedJobs.forEach(placed => {
    const job = state.jobs.find(j => j.id === placed.jobId);
    if (!job) return;

    const div = document.createElement('div');
    div.className = 'experience-entry' + (selectedPlacedJobId === placed.jobId ? ' selected' : '');
    div.draggable = true;
    div.dataset.placedJobId = placed.jobId;

    // Get ordered enabled bullets
    const orderedBulletIds = placed.bulletOrder.filter(id => placed.enabledBulletIds.includes(id));
    const bullets = orderedBulletIds.map(id => job.bullets.find(b => b.id === id)).filter(Boolean);

    div.innerHTML = `
      <div class="exp-header">
        <span class="exp-title">${esc(job.title)}</span>
        <span class="exp-dates">${formatDateRange(job)}</span>
      </div>
      <div class="exp-company">${esc(job.company)}</div>
      ${bullets.length > 0 ? `<ul class="exp-bullets">${bullets.map(b => `<li>${esc(b.text)}</li>`).join('')}</ul>` : ''}
      <button class="exp-remove-btn" title="Remove from resume">&times;</button>`;

    // Click to select and show bullet panel
    div.addEventListener('click', (e) => {
      if (e.target.closest('.exp-remove-btn')) return;
      selectedPlacedJobId = selectedPlacedJobId === placed.jobId ? null : placed.jobId;
      switchToTab('jobs');
      render();
    });

    div.querySelector('.exp-remove-btn').addEventListener('click', () => {
      state.placedJobs = state.placedJobs.filter(p => p.jobId !== placed.jobId);
      if (selectedPlacedJobId === placed.jobId) selectedPlacedJobId = null;
      render();
    });

    // Drag for reordering within experience
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/placed-job-id', placed.jobId);
      e.dataTransfer.setData('application/job-id', placed.jobId);
      e.dataTransfer.effectAllowed = 'move';
      div.style.opacity = '0.5';
    });
    div.addEventListener('dragend', () => { div.style.opacity = ''; });

    dropZone.appendChild(div);
  });
}

// === Bullet Selection Panel ===
function renderBulletSelectionPanel() {
  const panel = document.getElementById('bullet-selection-panel');
  const list = document.getElementById('bullet-selection-list');
  const title = document.getElementById('bullet-panel-title');

  if (!selectedPlacedJobId) {
    panel.style.display = 'none';
    return;
  }

  const placed = state.placedJobs.find(p => p.jobId === selectedPlacedJobId);
  const job = state.jobs.find(j => j.id === selectedPlacedJobId);
  if (!placed || !job) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';
  title.textContent = `Bullets: ${job.title}`;
  list.innerHTML = '';

  // Show bullets in bulletOrder, then any new bullets not in order
  const orderedIds = [...placed.bulletOrder];
  job.bullets.forEach(b => { if (!orderedIds.includes(b.id)) orderedIds.push(b.id); });

  orderedIds.forEach(bulletId => {
    const bullet = job.bullets.find(b => b.id === bulletId);
    if (!bullet) return;

    const div = document.createElement('div');
    div.className = 'bullet-select-item';
    div.draggable = true;
    div.dataset.bulletId = bulletId;
    const checked = placed.enabledBulletIds.includes(bulletId) ? 'checked' : '';
    div.innerHTML = `<span class="drag-handle">&#9776;</span><input type="checkbox" ${checked}><label>${esc(bullet.text)}</label>`;

    div.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!placed.enabledBulletIds.includes(bulletId)) placed.enabledBulletIds.push(bulletId);
      } else {
        placed.enabledBulletIds = placed.enabledBulletIds.filter(id => id !== bulletId);
      }
      renderExperience();
    });

    // Drag to reorder bullets
    div.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.setData('application/bullet-id', bulletId);
      e.dataTransfer.effectAllowed = 'move';
      div.style.opacity = '0.5';
    });
    div.addEventListener('dragend', () => { div.style.opacity = ''; });
    div.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    div.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const draggedId = e.dataTransfer.getData('application/bullet-id');
      if (!draggedId || draggedId === bulletId) return;
      const order = [...placed.bulletOrder];
      const fromIdx = order.indexOf(draggedId);
      if (fromIdx >= 0) order.splice(fromIdx, 1);
      const toIdx = order.indexOf(bulletId);
      order.splice(toIdx, 0, draggedId);
      placed.bulletOrder = order;
      renderBulletSelectionPanel();
      renderExperience();
    });

    list.appendChild(div);
  });
}

document.getElementById('btn-close-bullet-panel').addEventListener('click', () => {
  selectedPlacedJobId = null;
  render();
});

// === Skills ===
document.getElementById('btn-add-skill').addEventListener('click', () => {
  const input = document.getElementById('new-skill-name');
  const name = input.value.trim();
  if (!name) return;
  state.skills.push({ id: uuid(), name, enabled: true });
  input.value = '';
  render();
});
document.getElementById('new-skill-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-add-skill').click();
});

function renderSkillList() {
  const list = document.getElementById('skill-list');
  list.innerHTML = '';
  state.skills.forEach(skill => {
    const div = document.createElement('div');
    div.className = 'skill-item';
    div.innerHTML = `<input type="checkbox" ${skill.enabled ? 'checked' : ''}><label>${esc(skill.name)}</label><button class="btn-remove">&times;</button>`;
    div.querySelector('input').addEventListener('change', (e) => {
      skill.enabled = e.target.checked;
      renderResumeSkills();
    });
    div.querySelector('.btn-remove').addEventListener('click', () => {
      state.skills = state.skills.filter(s => s.id !== skill.id);
      render();
    });
    list.appendChild(div);
  });
}

function renderResumeSkills() {
  const section = document.getElementById('resume-skills');
  const content = document.getElementById('skills-content');
  const enabled = state.skills.filter(s => s.enabled);
  if (enabled.length === 0) {
    section.style.display = 'none';
  } else {
    section.style.display = '';
    content.textContent = enabled.map(s => s.name).join('  ·  ');
  }
}

// === Education ===
const btnNewEdu = document.getElementById('btn-new-education');
const eduForm = document.getElementById('education-form');
const eduList = document.getElementById('education-list');

btnNewEdu.addEventListener('click', () => {
  editingEducationId = null;
  document.getElementById('edu-degree').value = '';
  document.getElementById('edu-school').value = '';
  document.getElementById('edu-year').value = '';
  document.getElementById('edu-gpa').value = '';
  eduForm.style.display = '';
  btnNewEdu.style.display = 'none';
});

document.getElementById('btn-cancel-education').addEventListener('click', () => {
  eduForm.style.display = 'none';
  btnNewEdu.style.display = '';
});

document.getElementById('btn-save-education').addEventListener('click', () => {
  const degree = document.getElementById('edu-degree').value.trim();
  const school = document.getElementById('edu-school').value.trim();
  const year = document.getElementById('edu-year').value.trim();
  const gpa = document.getElementById('edu-gpa').value.trim();
  if (!degree || !school) return;

  if (editingEducationId) {
    const edu = state.education.find(e => e.id === editingEducationId);
    if (edu) { edu.degree = degree; edu.school = school; edu.year = year; edu.gpa = gpa; }
  } else {
    state.education.push({ id: uuid(), degree, school, year, gpa });
  }
  eduForm.style.display = 'none';
  btnNewEdu.style.display = '';
  editingEducationId = null;
  render();
});

function renderEducationList() {
  eduList.innerHTML = '';
  state.education.forEach(edu => {
    const div = document.createElement('div');
    div.className = 'edu-item';
    div.innerHTML = `
      <div class="edu-info">
        <div class="edu-degree">${esc(edu.degree)}</div>
        <div class="edu-school">${esc(edu.school)}${edu.year ? ' · ' + esc(edu.year) : ''}${edu.gpa ? ' · GPA: ' + esc(edu.gpa) : ''}</div>
      </div>
      <div class="actions">
        <button class="btn btn-sm btn-edit" title="Edit">&#9998;</button>
        <button class="btn btn-sm btn-del" title="Delete">&times;</button>
      </div>`;
    div.querySelector('.btn-edit').addEventListener('click', () => {
      editingEducationId = edu.id;
      document.getElementById('edu-degree').value = edu.degree;
      document.getElementById('edu-school').value = edu.school;
      document.getElementById('edu-year').value = edu.year;
      document.getElementById('edu-gpa').value = edu.gpa || '';
      eduForm.style.display = '';
      btnNewEdu.style.display = 'none';
    });
    div.querySelector('.btn-del').addEventListener('click', () => {
      state.education = state.education.filter(e => e.id !== edu.id);
      render();
    });
    eduList.appendChild(div);
  });
}

function renderResumeEducation() {
  const section = document.getElementById('resume-education');
  const content = document.getElementById('education-content');
  if (state.education.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  content.innerHTML = state.education.map(edu => `
    <div class="education-entry">
      <div class="edu-header-line">
        <span class="edu-degree-line">${esc(edu.degree)}</span>
        <span class="edu-year-line">${edu.year ? esc(edu.year) : ''}</span>
      </div>
      <div class="edu-school-line">${esc(edu.school)}</div>
      ${edu.gpa ? `<div class="edu-gpa-line">GPA: ${esc(edu.gpa)}</div>` : ''}
    </div>`).join('');
}

// === Save / Load / New ===
document.getElementById('btn-save-project').addEventListener('click', () => {
  // Sync header from contenteditable fields
  document.querySelectorAll('#resume-header .editable').forEach(el => {
    state.header[el.dataset.field] = el.textContent.trim();
  });
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume-project.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btn-load-project').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const loaded = JSON.parse(ev.target.result);
      state = { ...defaultState(), ...loaded };
      selectedPlacedJobId = null;
      render();
    } catch (err) {
      alert('Failed to load project: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('btn-new-project').addEventListener('click', () => {
  if (!confirm('Start a new project? Unsaved changes will be lost.')) return;
  state = defaultState();
  selectedPlacedJobId = null;
  render();
});

// === Escape HTML ===
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === Master Render ===
function render() {
  renderHeader();
  renderSummaryList();
  renderResumeSummary();
  renderJobList();
  renderExperience();
  renderBulletSelectionPanel();
  renderSkillList();
  renderResumeSkills();
  renderEducationList();
  renderResumeEducation();
  renderStyleGrid();
  applyStyle();
}

// === Init ===
populateMonthSelects();
render();
