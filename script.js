const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const tripTypeButtons = Array.from(document.querySelectorAll('.trip-type'));
const destinationSummary = document.getElementById('destination-summary');
const tripTypeSummary = document.getElementById('trip-type-summary');
const searchStatus = document.getElementById('search-status');
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

const toISODate = (date) => date.toISOString().slice(0, 10);
const formatShortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatSelectedDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : formatShortDate(date);
};

const selectedDepartureDates = new Set();

const today = new Date();
const needDate = new Date(today);
needDate.setDate(needDate.getDate() + 14);
const canDate = new Date(today);
canDate.setDate(canDate.getDate() + 56);
needToGo.value = toISODate(needDate);
canGo.value = toISODate(canDate);

departureInput.value = toISODate(new Date(today));
selectedDepartureDates.add(departureInput.value);

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

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    destinationButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncDestination();
  });
});
tripTypeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tripTypeButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncTripType();
  });
});

searchButton.addEventListener('click', () => {
  searchButton.classList.add('is-active');
  searchStatus.textContent = buildSearchSummary();
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
