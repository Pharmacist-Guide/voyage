const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const tripTypeButtons = Array.from(document.querySelectorAll('.trip-type'));
const dateButtons = Array.from(document.querySelectorAll('.date-pill'));
const destinationSummary = document.getElementById('destination-summary');
const tripTypeSummary = document.getElementById('trip-type-summary');
const departureSummary = document.getElementById('departure-summary');
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

const toISODate = (date) => date.toISOString().slice(0, 10);
const formatShortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const today = new Date();
const needDate = new Date(today);
needDate.setDate(needDate.getDate() + 14);
const canDate = new Date(today);
canDate.setDate(canDate.getDate() + 56);
needToGo.value = toISODate(needDate);
canGo.value = toISODate(canDate);

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

const syncDates = () => {
  const selected = dateButtons.filter((button) => button.classList.contains('is-active')).map((button) => button.textContent.trim());
  departureSummary.textContent = selected.length > 0 ? `Selected departure dates: ${selected.join(', ')}.` : 'Selected departure dates: none.';
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
  const dates = dateButtons.filter((button) => button.classList.contains('is-active')).map((button) => button.textContent.trim());
  const minDays = lengthMin.value.trim() || '7';
  const maxDays = lengthMax.value.trim() || '14';
  const query = searchQuery.value.trim() || 'Well-priced, inspiring trips';
  const budget = maxBudget.value.trim() || '$2,500';
  const travelers = travelerCount.value.trim() || '2';
  const ports = preferredPorts.value.trim() || 'Flexible ports';
  const lines = cruiseLines.value.trim() || 'Flexible cruise lines';
  return [
    `Searching ${destination.toLowerCase()} for ${query.toLowerCase()} (${tripType.toLowerCase()}).`,
    `Dates: ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? '…' : ''}.`,
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

function updateAll() {
  syncDestination();
  syncTripType();
  syncDates();
  updateFlexibilityLabel();
  searchStatus.textContent = buildSearchSummary();
  quickEscapeStatus.textContent = buildQuickEscape();
  goalResults.textContent = buildGoalCheck();
}

destinationButtons.forEach((button) => button.addEventListener('click', () => {
  destinationButtons.forEach((item) => item.classList.remove('is-active'));
  button.classList.add('is-active');
  syncDestination();
  searchStatus.textContent = buildSearchSummary();
}));
tripTypeButtons.forEach((button) => button.addEventListener('click', () => {
  tripTypeButtons.forEach((item) => item.classList.remove('is-active'));
  button.classList.add('is-active');
  syncTripType();
  searchStatus.textContent = buildSearchSummary();
}));
dateButtons.forEach((button) => button.addEventListener('click', () => {
  button.classList.toggle('is-active');
  if (dateButtons.every((item) => !item.classList.contains('is-active'))) button.classList.add('is-active');
  syncDates();
  searchStatus.textContent = buildSearchSummary();
}));
[lengthMin, lengthMax].forEach((input) => {
  input.addEventListener('change', normalizeRange);
  input.addEventListener('blur', normalizeRange);
  input.addEventListener('input', () => { searchStatus.textContent = buildSearchSummary(); });
});
[searchQuery, maxBudget, travelerCount, preferredPorts, cruiseLines, goalDestination, goalPto, needToGo, canGo].forEach((input) => {
  input.addEventListener('input', () => {
    searchStatus.textContent = buildSearchSummary();
    goalResults.textContent = buildGoalCheck();
  });
});
flexibility.addEventListener('input', () => {
  updateFlexibilityLabel();
  goalResults.textContent = buildGoalCheck();
});
searchButton.addEventListener('click', () => {
  searchStatus.textContent = buildSearchSummary();
});
quickEscapeButton.addEventListener('click', () => {
  quickEscapeStatus.textContent = buildQuickEscape();
});

updateAll();
