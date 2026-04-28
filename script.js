const departInput = document.getElementById('depart-date');
const returnInput = document.getElementById('return-date');
const chips = Array.from(document.querySelectorAll('#preference-chips .chip'));
const summary = document.getElementById('preference-summary');

const toISODate = (date) => date.toISOString().slice(0, 10);

const today = new Date();
const returnDate = new Date(today);
returnDate.setDate(returnDate.getDate() + 7);

departInput.value = toISODate(today);
returnInput.value = toISODate(returnDate);

const updateSummary = () => {
  const active = chips.filter((chip) => chip.classList.contains('is-active')).map((chip) => chip.textContent.trim());
  summary.textContent = `Selected: ${active.join(', ')}.`;
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('is-active');
    if (chips.filter((item) => item.classList.contains('is-active')).length === 0) {
      chip.classList.add('is-active');
    }
    updateSummary();
  });
});

updateSummary();
