const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const tripTypeButtons = Array.from(document.querySelectorAll('.trip-type'));
const destinationSummary = document.getElementById('destination-summary');
const tripTypeSummary = document.getElementById('trip-type-summary');
const searchStatus = document.getElementById('search-status');
const bugStatus = document.getElementById('bug-status');
const quickEscapeStatus = document.getElementById('quick-escape-status');
const goalResults = document.getElementById('goal-results');
const flexibility = document.getElementById('flexibility');
const flexibilityValue = document.getElementById('flexibility-value');
const lengthMin = document.getElementById('length-min');
const lengthMax = document.getElementById('length-max');
const searchQuery = document.getElementById('search-query');
const maxBudget = document.getElementById('max-budget');
const travelerCount = document.getElementById('traveler-count');
const preferredPorts = document.getElementById('preferred-ports');
const cruiseLines = document.getElementById('cruise-lines');
const searchButton = document.getElementById('search-button');
const offDays = document.getElementById('off-days');
const quickEscapeButton = document.getElementById('quick-escape-button');
const goalDestination = document.getElementById('goal-destination');
const goalPto = document.getElementById('goal-pto');
const needToGo = document.getElementById('need-to-go');
const canGo = document.getElementById('can-go');
const departureInput = document.getElementById('departure-date-input');
const addDepartureButton = document.getElementById('add-departure-date');
const departurePills = document.getElementById('departure-pills');
const departureSummary = document.getElementById('departure-summary');
const bugButton = document.getElementById('bug-button');
const bugPanel = document.getElementById('bug-panel');
const closeBugPanel = document.getElementById('close-bug-panel');
const bugPreview = document.getElementById('bug-preview');
const bugOverlay = document.getElementById('bug-selection-overlay');
const bugPreviewHint = document.getElementById('bug-preview-hint');
const bugComment = document.getElementById('bug-comment');
const bugSubmit = document.getElementById('bug-submit');
const bugPanelStatus = document.getElementById('bug-panel-status');

const toISODate = (date) => date.toISOString().slice(0, 10);
const formatShortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatSelectedDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : formatShortDate(date);
};

const selectedDepartureDates = new Set();
const bugReports = [];
let bugSelection = null;
let dragState = null;

const today = new Date();
const needDate = new Date(today);
needDate.setDate(needDate.getDate() + 14);
const canDate = new Date(today);
canDate.setDate(canDate.getDate() + 56);
needToGo.value = toISODate(needDate);
canGo.value = toISODate(canDate);
departureInput.value = toISODate(new Date(today));
selectedDepartureDates.add(departureInput.value);

window.__voyageBugReports = bugReports;

const syncDestination = () => {
  const active = destinationButtons.find((button) => button.classList.contains('is-active'));
  const label = active?.dataset.destination ?? 'Anywhere';
  destinationSummary.textContent = label === 'Anywhere'
    ? 'Searching: Anywhere for random, well-priced trips.'
    : `Searching: ${label} trips with a flexible, curated feel.`;
};

const syncTripType = () => {
  const active = tripTypeButtons.find((button) => button.classList.contains('is-active'));
  tripTypeSummary.textContent = `Trip type: ${active?.dataset.tripType ?? 'Flight + Hotel'}.`;
};

const syncDepartureSummary = () => {
  const sorted = Array.from(selectedDepartureDates).sort();
  departureSummary.textContent = sorted.length
    ? `Selected departure dates: ${sorted.map(formatSelectedDate).join(', ')}.`
    : 'No departure dates added yet.';
};

const renderDeparturePills = () => {
  departurePills.innerHTML = '';
  Array.from(selectedDepartureDates).sort().forEach((date) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'date-pill is-active';
    pill.textContent = formatSelectedDate(date);
    pill.dataset.value = date;
    pill.addEventListener('click', () => {
      selectedDepartureDates.delete(date);
      renderDeparturePills();
      syncDepartureSummary();
      searchStatus.textContent = buildSearchSummary();
    });
    departurePills.appendChild(pill);
  });
};

const addDepartureDate = () => {
  const value = departureInput.value;
  if (!value) return;
  selectedDepartureDates.add(value);
  renderDeparturePills();
  syncDepartureSummary();
  searchStatus.textContent = buildSearchSummary();
};

const normalizeRange = () => {
  const min = Number.parseInt(lengthMin.value, 10);
  const max = Number.parseInt(lengthMax.value, 10);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return;
  if (min > max) lengthMax.value = String(min);
};

const updateFlexibilityLabel = () => {
  const value = Number(flexibility.value);
  if (value < 35) flexibilityValue.textContent = 'Focused';
  else if (value < 70) flexibilityValue.textContent = 'Flexible';
  else flexibilityValue.textContent = 'Very flexible';
};

const buildSearchSummary = () => {
  const destination = destinationButtons.find((button) => button.classList.contains('is-active'))?.dataset.destination ?? 'Anywhere';
  const tripType = tripTypeButtons.find((button) => button.classList.contains('is-active'))?.dataset.tripType ?? 'Flight + Hotel';
  const dates = Array.from(selectedDepartureDates).sort().map(formatSelectedDate);
  const minDays = lengthMin.value.trim() || '7';
  const maxDays = lengthMax.value.trim() || '14';
  const query = searchQuery.value.trim() || 'Well-priced, inspiring trips';
  const budget = maxBudget.value.trim() || '$2,500';
  const travelers = travelerCount.value.trim() || '2';
  const ports = preferredPorts.value.trim() || 'Flexible ports';
  const lines = cruiseLines.value.trim() || 'Flexible cruise lines';
  return [
    `Searching ${destination.toLowerCase()} for ${query.toLowerCase()} (${tripType.toLowerCase()}).`,
    `Departure dates: ${dates.length ? dates.join(', ') : 'none selected'}.`,
    `Length: ${minDays}-${maxDays} days · Budget: ${budget} · Travelers: ${travelers}.`,
    `Ports: ${ports}. Lines: ${lines}.`,
  ].join(' ');
};

const buildQuickEscape = () => {
  const days = offDays.value.trim() || '4';
  return `I’m off ${days} days in a row — scanning for compact escapes with strong value and easy departures.`;
};

const buildGoalCheck = () => {
  const destination = goalDestination.value.trim() || 'Key West';
  const pto = goalPto.value.trim() || '3';
  const flexibilityLevel = Number(flexibility.value);
  const need = new Date(needToGo.value);
  const can = new Date(canGo.value);
  const windowText = `${formatShortDate(need)} to ${formatShortDate(can)}`;
  const overlapState = flexibilityLevel > 55 ? 'few light overlaps' : 'tighter calendar fit';
  return `Goal search for ${destination}: ${pto} PTO days, ${windowText}, ${overlapState}. Live Meridian / Atlas calendar overlap checks need the connected calendar layer.`;
};

const getBugSnippet = () => {
  const rect = bugSelection;
  if (!rect) return '';
  return `Selection @ x:${Math.round(rect.x)} y:${Math.round(rect.y)} w:${Math.round(rect.width)} h:${Math.round(rect.height)}`;
};

const setBugStatus = (message) => {
  bugPanelStatus.textContent = message;
  bugStatus.textContent = message;
};

const openBugPanel = () => {
  bugPanel.classList.add('is-open');
  bugPanel.setAttribute('aria-hidden', 'false');
  setBugStatus('Drag across the preview to capture a snippet.');
  bugOverlay.classList.remove('is-visible');
  bugOverlay.style.left = '0px';
  bugOverlay.style.top = '0px';
  bugOverlay.style.width = '0px';
  bugOverlay.style.height = '0px';
};

const closeBugPanelHandler = () => {
  bugPanel.classList.remove('is-open');
  bugPanel.setAttribute('aria-hidden', 'true');
};

const saveBugReport = () => {
  const report = {
    createdAt: new Date().toISOString(),
    snippet: getBugSnippet(),
    comment: bugComment.value.trim(),
    url: window.location.href,
  };
  bugReports.push(report);
  localStorage.setItem('voyageBugReports', JSON.stringify(bugReports));
  window.__voyageBugReports = bugReports;
  console.log('Voyage bug/edit report captured', report);
  setBugStatus('Report captured locally for Atlas retrieval.');
};

bugButton.addEventListener('click', openBugPanel);
closeBugPanel.addEventListener('click', closeBugPanelHandler);
bugSubmit.addEventListener('click', saveBugReport);

bugPreview.addEventListener('pointerdown', (event) => {
  const rect = bugPreview.getBoundingClientRect();
  dragState = {
    startX: event.clientX - rect.left,
    startY: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
  bugSelection = {
    x: dragState.startX,
    y: dragState.startY,
    width: 1,
    height: 1,
  };
  bugOverlay.classList.add('is-visible');
  bugPreviewHint.textContent = 'Release to capture snippet';
  bugPreview.setPointerCapture(event.pointerId);
});

bugPreview.addEventListener('pointermove', (event) => {
  if (!dragState) return;
  const rect = bugPreview.getBoundingClientRect();
  const currentX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const currentY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
  const x = Math.min(dragState.startX, currentX);
  const y = Math.min(dragState.startY, currentY);
  const width = Math.abs(currentX - dragState.startX);
  const height = Math.abs(currentY - dragState.startY);
  bugSelection = { x, y, width, height };
  bugOverlay.style.left = `${x}px`;
  bugOverlay.style.top = `${y}px`;
  bugOverlay.style.width = `${Math.max(width, 1)}px`;
  bugOverlay.style.height = `${Math.max(height, 1)}px`;
});

const finishBugSelection = () => {
  if (!dragState) return;
  dragState = null;
  bugPreviewHint.textContent = bugSelection ? `Snippet captured: ${getBugSnippet()}` : 'Drag to select a page section';
  if (bugSelection) setBugStatus(`Snippet ready. ${getBugSnippet()}`);
};

bugPreview.addEventListener('pointerup', finishBugSelection);
bugPreview.addEventListener('pointercancel', finishBugSelection);

const keepBugPanelClean = () => {
  const stored = localStorage.getItem('voyageBugReports');
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      bugReports.splice(0, bugReports.length, ...parsed);
      window.__voyageBugReports = bugReports;
    }
  } catch {
    localStorage.removeItem('voyageBugReports');
  }
};

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    destinationButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncDestination();
    searchStatus.textContent = buildSearchSummary();
  });
});
tripTypeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tripTypeButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncTripType();
    searchStatus.textContent = buildSearchSummary();
  });
});

searchButton.addEventListener('click', () => {
  searchStatus.textContent = buildSearchSummary();
  searchButton.classList.add('is-active');
});
quickEscapeButton.addEventListener('click', () => {
  quickEscapeStatus.textContent = buildQuickEscape();
});
addDepartureButton.addEventListener('click', addDepartureDate);
departureInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addDepartureDate();
  }
});
[lengthMin, lengthMax].forEach((input) => {
  input.addEventListener('change', normalizeRange);
  input.addEventListener('blur', normalizeRange);
});
flexibility.addEventListener('input', () => {
  updateFlexibilityLabel();
  goalResults.textContent = buildGoalCheck();
});
[searchQuery, maxBudget, travelerCount, preferredPorts, cruiseLines, offDays, goalDestination, goalPto, needToGo, canGo].forEach((input) => {
  input.addEventListener('input', () => {
    searchStatus.textContent = buildSearchSummary();
    quickEscapeStatus.textContent = buildQuickEscape();
    goalResults.textContent = buildGoalCheck();
  });
});

function boot() {
  keepBugPanelClean();
  syncDestination();
  syncTripType();
  updateFlexibilityLabel();
  renderDeparturePills();
  syncDepartureSummary();
  searchStatus.textContent = buildSearchSummary();
  quickEscapeStatus.textContent = buildQuickEscape();
  goalResults.textContent = buildGoalCheck();
}

boot();
