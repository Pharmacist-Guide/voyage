const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const tripTypeButtons = Array.from(document.querySelectorAll('.trip-type'));
const modeButtons = Array.from(document.querySelectorAll('.mode-pill'));
const snipTargets = Array.from(document.querySelectorAll('.selectable-snip'));
const destinationSummary = document.getElementById('destination-summary');
const tripTypeSummary = document.getElementById('trip-type-summary');
const searchStatus = document.getElementById('search-status');
const quickEscapeStatus = document.getElementById('quick-escape-status');
const goalResults = document.getElementById('goal-results');
const tripResults = document.getElementById('trip-results');
const tripResultsSummary = document.getElementById('trip-results-summary');
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
const departureEndInput = document.getElementById('departure-end-input');
const departureEndField = document.getElementById('departure-end-field');
const addDepartureButton = document.getElementById('add-departure-date');
const departurePills = document.getElementById('departure-pills');
const departureSummary = document.getElementById('departure-summary');
const bugButton = document.getElementById('bug-button');
const bugModal = document.getElementById('bug-modal');
const bugCloseButton = document.getElementById('bug-close-button');
const bugSnipTarget = document.getElementById('bug-snip-target');
const bugComment = document.getElementById('bug-comment');
const bugSubmitButton = document.getElementById('bug-submit-button');
const bugStatus = document.getElementById('bug-status');

const toISODate = (date) => date.toISOString().slice(0, 10);
const formatShortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatSelectedDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : formatShortDate(date);
};

const selectedDepartureCriteria = [];
let departureMode = 'date';
let activeSnip = null;
const atlasBookingCache = {};

const today = new Date();
const needDate = new Date(today);
needDate.setDate(needDate.getDate() + 14);
const canDate = new Date(today);
canDate.setDate(canDate.getDate() + 56);
needToGo.value = toISODate(needDate);
canGo.value = toISODate(canDate);
departureInput.value = toISODate(new Date(today));
selectedDepartureCriteria.push({ type: 'date', date: departureInput.value || toISODate(today) });

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
  if (!selectedDepartureCriteria.length) {
    departureSummary.textContent = 'No departure criteria added yet.';
    return;
  }
  departureSummary.textContent = `Selected departure criteria: ${selectedDepartureCriteria
    .map((item) => (item.type === 'range' ? `${formatSelectedDate(item.start)} - ${formatSelectedDate(item.end)}` : formatSelectedDate(item.date)))
    .join(', ')}.`;
};

const renderDeparturePills = () => {
  departurePills.innerHTML = '';
  selectedDepartureCriteria.forEach((item, index) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'date-pill is-active';
    pill.textContent = item.type === 'range' ? `${formatSelectedDate(item.start)} - ${formatSelectedDate(item.end)}` : formatSelectedDate(item.date);
    pill.addEventListener('click', () => {
      selectedDepartureCriteria.splice(index, 1);
      renderDeparturePills();
      syncDepartureSummary();
      searchStatus.textContent = buildSearchSummary();
      renderTripResults();
    });
    departurePills.appendChild(pill);
  });
};

const addDepartureCriteria = () => {
  if (departureMode === 'range') {
    const start = departureInput.value;
    const end = departureEndInput.value;
    if (!start || !end) return;
    const normalized = start <= end ? { type: 'range', start, end } : { type: 'range', start: end, end: start };
    selectedDepartureCriteria.push(normalized);
  } else {
    const date = departureInput.value;
    if (!date) return;
    selectedDepartureCriteria.push({ type: 'date', date });
  }
  renderDeparturePills();
  syncDepartureSummary();
  searchStatus.textContent = buildSearchSummary();
  renderTripResults();
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

const getTripContext = () => {
  const destination = destinationButtons.find((button) => button.classList.contains('is-active'))?.dataset.destination ?? 'Anywhere';
  const tripType = tripTypeButtons.find((button) => button.classList.contains('is-active'))?.dataset.tripType ?? 'Flight + Hotel';
  const departureText = selectedDepartureCriteria.length
    ? selectedDepartureCriteria
        .map((item) => (item.type === 'range' ? `${formatSelectedDate(item.start)} - ${formatSelectedDate(item.end)}` : formatSelectedDate(item.date)))
        .join(', ')
    : 'none selected';
  return {
    destination,
    tripType,
    departureText,
    minDays: lengthMin.value.trim() || '7',
    maxDays: lengthMax.value.trim() || '14',
    query: searchQuery.value.trim() || 'Well-priced, inspiring trips',
    budget: maxBudget.value.trim() || '$2,500',
    travelers: travelerCount.value.trim() || '2',
    ports: preferredPorts.value.trim() || 'Flexible ports',
    lines: cruiseLines.value.trim() || 'Flexible cruise lines',
  };
};

const buildSearchSummary = () => {
  const context = getTripContext();
  return [
    `Searching ${context.destination.toLowerCase()} for ${context.query.toLowerCase()} (${context.tripType.toLowerCase()}).`,
    `Departure criteria: ${context.departureText}.`,
    `Length: ${context.minDays}-${context.maxDays} days · Budget: ${context.budget} · Travelers: ${context.travelers}.`,
    `Ports: ${context.ports}. Lines: ${context.lines}.`,
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

const buildBookingPricing = (context) => {
  const seed = `${context.destination}-${context.tripType}-${context.departureText}-${context.budget}-${context.travelers}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const direct = 640 + (hash % 520);
  const expedia = direct - (hash % 2 === 0 ? 40 + (hash % 160) : -30);
  const priceline = direct - (hash % 3 === 0 ? 25 + (hash % 140) : -10);
  return {
    direct,
    expedia: Math.max(420, expedia),
    priceline: Math.max(420, priceline),
  };
};

const getBundleVendor = (context, prices) => {
  const bundleCandidates = [
    { vendor: 'Expedia', price: prices.expedia },
    { vendor: 'Priceline', price: prices.priceline },
  ].filter((item) => item.price < prices.direct);
  if (!bundleCandidates.length) return null;
  bundleCandidates.sort((a, b) => a.price - b.price);
  return bundleCandidates[0];
};

const makeLink = (label, href, secondary = false) => {
  const anchor = document.createElement('a');
  anchor.className = secondary ? 'result-link secondary' : 'result-link';
  anchor.href = href;
  anchor.target = '_blank';
  anchor.rel = 'noreferrer';
  anchor.textContent = label;
  return anchor;
};

const buildAtlasPlaceholder = (context, prices) => ({
  directBooking: {
    provider: 'Direct booking',
    price: prices.direct,
    url: `https://example.com/direct-booking?destination=${encodeURIComponent(context.destination)}&type=${encodeURIComponent(context.tripType)}`,
  },
  bundles: [
    { provider: 'Expedia', price: prices.expedia, url: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(context.destination)}` },
    { provider: 'Priceline', price: prices.priceline, url: `https://www.priceline.com/` },
  ],
});

const renderTripResults = () => {
  const context = getTripContext();
  const prices = buildBookingPricing(context);
  const atlas = buildAtlasPlaceholder(context, prices);
  const cheaperBundle = getBundleVendor(context, prices);

  atlasBookingCache.latest = { context, prices, atlas, cheaperBundle };
  window.__atlasBookingOptions = atlasBookingCache.latest;

  tripResults.innerHTML = '';

  const directCard = document.createElement('article');
  directCard.className = 'result-card primary';
  directCard.innerHTML = `
    <div class="result-title-row">
      <h4>Direct booking</h4>
      <span class="result-price">$${atlas.directBooking.price}</span>
    </div>
    <p class="result-note">Primary option for ${context.destination}. Best for clean pricing and fewer handoffs.</p>
  `;
  const directLinks = document.createElement('div');
  directLinks.className = 'result-links';
  directLinks.appendChild(makeLink('Book direct', atlas.directBooking.url));
  directCard.appendChild(directLinks);
  tripResults.appendChild(directCard);

  const expediaCard = document.createElement('article');
  expediaCard.className = 'result-card';
  expediaCard.innerHTML = `
    <div class="result-title-row">
      <h4>Expedia bundle</h4>
      <span class="result-price">$${atlas.bundles[0].price}</span>
    </div>
    <p class="result-note">${atlas.bundles[0].price < atlas.directBooking.price ? 'Cheaper than direct in this comparison.' : 'Bundle pricing placeholder for Atlas to evaluate.'}</p>
  `;
  const expediaLinks = document.createElement('div');
  expediaLinks.className = 'result-links';
  expediaLinks.appendChild(makeLink('Expedia bundle', atlas.bundles[0].url, true));
  expediaCard.appendChild(expediaLinks);
  if (atlas.bundles[0].price < atlas.directBooking.price) tripResults.appendChild(expediaCard);

  const pricelineCard = document.createElement('article');
  pricelineCard.className = 'result-card';
  pricelineCard.innerHTML = `
    <div class="result-title-row">
      <h4>Priceline bundle</h4>
      <span class="result-price">$${atlas.bundles[1].price}</span>
    </div>
    <p class="result-note">${atlas.bundles[1].price < atlas.directBooking.price ? 'Cheaper than direct in this comparison.' : 'Bundle pricing placeholder for Atlas to evaluate.'}</p>
  `;
  const pricelineLinks = document.createElement('div');
  pricelineLinks.className = 'result-links';
  pricelineLinks.appendChild(makeLink('Priceline bundle', atlas.bundles[1].url, true));
  pricelineCard.appendChild(pricelineLinks);
  if (atlas.bundles[1].price < atlas.directBooking.price) tripResults.appendChild(pricelineCard);

  if (cheaperBundle) {
    tripResultsSummary.textContent = `${cheaperBundle.vendor} bundle is currently cheaper than direct in this Atlas placeholder comparison.`;
  } else {
    tripResultsSummary.textContent = 'Direct booking is currently the best option in this Atlas placeholder comparison.';
  }
};

const setDepartureMode = (mode) => {
  departureMode = mode;
  modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
  departureEndField.classList.toggle('hidden', mode !== 'range');
};

const openBugModal = () => {
  bugModal.classList.remove('hidden');
  bugModal.setAttribute('aria-hidden', 'false');
  bugStatus.textContent = activeSnip ? 'Snip selected. Add your note and submit.' : 'Click a card or control behind the panel to select a snip target.';
};

const closeBugModal = () => {
  bugModal.classList.add('hidden');
  bugModal.setAttribute('aria-hidden', 'true');
};

const serializeSnip = (element) => ({
  label: element.dataset.snipLabel || element.getAttribute('aria-label') || element.tagName.toLowerCase(),
  text: element.innerText.replace(/\s+/g, ' ').trim().slice(0, 700),
});

const clearSnipTargets = () => {
  snipTargets.forEach((node) => node.classList.remove('is-snippet-target'));
};

const setActiveSnip = (element) => {
  clearSnipTargets();
  if (!element) return;
  element.classList.add('is-snippet-target');
  activeSnip = serializeSnip(element);
  bugSnipTarget.textContent = `Selected: ${activeSnip.label}. Snippet: ${activeSnip.text}`;
  bugStatus.textContent = 'Snip target captured. Add a comment and submit.';
};

const saveBugReport = (report) => {
  const key = 'voyageBugReports';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(report);
  localStorage.setItem(key, JSON.stringify(existing));
  window.__atlasBugReports = existing;
  console.log('Voyage bug report', report);
};

const refreshOutputs = () => {
  searchStatus.textContent = buildSearchSummary();
  quickEscapeStatus.textContent = buildQuickEscape();
  goalResults.textContent = buildGoalCheck();
  renderTripResults();
};

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    destinationButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncDestination();
    refreshOutputs();
  });
});
tripTypeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tripTypeButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncTripType();
    refreshOutputs();
  });
});
modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setDepartureMode(button.dataset.mode === 'range' ? 'range' : 'date');
  });
});

searchButton.addEventListener('click', () => {
  refreshOutputs();
});
quickEscapeButton.addEventListener('click', () => {
  quickEscapeStatus.textContent = buildQuickEscape();
});
addDepartureButton.addEventListener('click', addDepartureCriteria);
departureInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addDepartureCriteria();
  }
});
departureEndInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addDepartureCriteria();
  }
});
[lengthMin, lengthMax].forEach((input) => {
  input.addEventListener('change', normalizeRange);
  input.addEventListener('blur', normalizeRange);
});
flexibility.addEventListener('input', () => {
  updateFlexibilityLabel();
  goalResults.textContent = buildGoalCheck();
  renderTripResults();
});
[searchQuery, maxBudget, travelerCount, preferredPorts, cruiseLines, offDays, goalDestination, goalPto, needToGo, canGo].forEach((input) => {
  input.addEventListener('input', () => {
    refreshOutputs();
  });
});

bugButton.addEventListener('click', openBugModal);
bugCloseButton.addEventListener('click', closeBugModal);
bugModal.addEventListener('click', (event) => {
  if (event.target === bugModal) closeBugModal();
});
bugSubmitButton.addEventListener('click', () => {
  const report = {
    createdAt: new Date().toISOString(),
    snip: activeSnip,
    comment: bugComment.value.trim(),
    page: 'voyage',
    url: window.location.href,
  };
  if (!report.snip || !report.comment) {
    bugStatus.textContent = 'Select a snip target and add a comment before submitting.';
    return;
  }
  saveBugReport(report);
  bugStatus.textContent = 'Bug report saved locally for Atlas retrieval.';
  bugComment.value = '';
  activeSnip = null;
  clearSnipTargets();
  bugSnipTarget.textContent = 'No snip selected yet.';
});

snipTargets.forEach((target) => {
  target.addEventListener('click', () => {
    if (bugModal.classList.contains('hidden')) return;
    setActiveSnip(target);
  });
});

function boot() {
  syncDestination();
  syncTripType();
  updateFlexibilityLabel();
  setDepartureMode('date');
  renderDeparturePills();
  syncDepartureSummary();
  refreshOutputs();
  window.__atlasBugReports = JSON.parse(localStorage.getItem('voyageBugReports') || '[]');
  window.__atlasBookingOptions = atlasBookingCache.latest || null;
}

boot();
