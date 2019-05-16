const choice = (l, v, c) => ({ label: l, value: v, correct: !!c });

const markup = '<div><p>The {{0}} jumped {{1}} the {{2}}</p></div>';

exports.model = (id, element) => ({
  id,
  element,
  disabled: false,
  markup: markup,
  choices: {
    0: [choice('cow ', '0', true), choice('dog ', '1'), choice('cat ', '2')],
    1: [choice('over ', '0', true), choice('under ', '1'), choice('across ', '2')],
    2: [choice('moon ', '0', true), choice('sun ', '1'), choice('house ', '2')]
  },
  prompt: 'Use the dropdowns to complete the sentence'
});
