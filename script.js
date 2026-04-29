const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const dateButtons = Array.from(document.querySelectorAll('.date-pill'));
const destinationSummary = document.getElementById('destination-summary');
const departureSummary = document.getElementById('departure-summary');
const searchStatus = document.getElementById('search-status');
const lengthMin = document.getElementById('length-min');
const lengthMax = document.getElementById('length-max');
const searchQuery = document.getElementById('search-query');
const maxBudget = document.getElementById('max-budget');
const travelerCount = document.getElementById('traveler-count');
const preferredPorts = document.getElementById('preferred-ports');
const cruiseLines = document.getElementById('cruise-lines');
const searchButton = document.getElementById('search-button');

const syncDestination = () => {
  const active = destinationButtons.find((button) => button.classList.contains('is-active'));
  const label = active?.dataset.destination ?? 'Anywhere';
  destinationSummary.textContent =
    label === 'Anywhere'
      ? 'Searching: Anywhere for random, well-priced trips.'
      : `Searching: ${label} trips with a flexible, curated feel.`;
};

const syncDates = () => {
  const selected = dateButtons.filter((button) => button.classList.contains('is-active')).map((button) => button.textContent.trim());
  departureSummary.textContent =
    selected.length > 0
      ? `Selected departure dates: ${selected.join(', ')}.`
      : 'Selected departure dates: none.';
};

const normalizeRange = () => {
  const min = Number.parseInt(lengthMin.value, 10);
  const max = Number.parseInt(lengthMax.value, 10);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return;
  if (min > max) {
    lengthMax.value = String(min);
  }
};

const buildSearchSummary = () => {
  const destination = destinationButtons.find((button) => button.classList.contains('is-active'))?.dataset.destination ?? 'Anywhere';
  const dates = dateButtons.filter((button) => button.classList.contains('is-active')).map((button) => button.textContent.trim());
  const minDays = lengthMin.value.trim() || '7';
  const maxDays = lengthMax.value.trim() || '14';
  const query = searchQuery.value.trim() || 'Well-priced, inspiring trips';
  const budget = maxBudget.value.trim() || '$2,500';
  const travelers = travelerCount.value.trim() || '2';
  const ports = preferredPorts.value.trim() || 'Flexible ports';
  const lines = cruiseLines.value.trim() || 'Flexible cruise lines';

  return [
    `Searching ${destination.toLowerCase()} for ${query.toLowerCase()}.`,
    `Dates: ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? '…' : ''}.`,
    `Length: ${minDays}-${maxDays} days · Budget: ${budget} · Travelers: ${travelers}.`,
    `Ports: ${ports}. Lines: ${lines}.`,
  ].join(' ');
};

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    destinationButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    syncDestination();
  });
});

dateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('is-active');
    if (dateButtons.every((item) => !item.classList.contains('is-active'))) {
      button.classList.add('is-active');
    }
    syncDates();
  });
});

[lengthMin, lengthMax].forEach((input) => {
  input.addEventListener('change', normalizeRange);
  input.addEventListener('blur', normalizeRange);
});

searchButton.addEventListener('click', () => {
  searchStatus.textContent = buildSearchSummary();
});

syncDestination();
syncDates();
searchStatus.textContent = buildSearchSummary();
