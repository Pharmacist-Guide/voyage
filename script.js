const destinationButtons = Array.from(document.querySelectorAll('.destination-pill'));
const dateButtons = Array.from(document.querySelectorAll('.date-pill'));
const destinationSummary = document.getElementById('destination-summary');
const departureSummary = document.getElementById('departure-summary');
const lengthMin = document.getElementById('length-min');
const lengthMax = document.getElementById('length-max');
const searchQuery = document.getElementById('search-query');

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

searchQuery.addEventListener('input', () => {
  searchQuery.dataset.value = searchQuery.value;
});

syncDestination();
syncDates();
