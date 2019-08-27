import _ from 'lodash';
import * as controller from '../index';

describe('index', () => {
  let base = o => {
    o = _.merge(
      {
        prompt: 'hi',
        choices: [],
        correctResponse: [],
        lockChoiceOrder: true,
        allowFeedback: true
      },
      o
    );
    return o;
  };

  describe('model', () => {
    let assertModel = (q, s, e, partialExpected) => {
      return async () => {
        if (_.isFunction(partialExpected) && partialExpected.name === 'Error') {
          expect(() => controller.model(q, s, e)).toThrow(Error);

          return Promise.resolve();
        } else {
          const result = await controller.model(q, s, e);

          if (_.isFunction(partialExpected)) {
            return partialExpected(result);
          } else {
            expect(result).toMatchObject(partialExpected);
          }
        }
      };
    };

    it(
      'returns prompt',
      assertModel(base(), {}, {}, m => expect(m.prompt).toEqual('hi'))
    );

    it(
      'returns empty config for mode=gather',
      assertModel(base(), {}, { mode: 'gather' }, {})
    );

    it(
      'returns empty config for mode=view',
      assertModel(base(), {}, { mode: 'view' }, { disabled: true })
    );

    it(
      'returns config.disabled=true for mode=evaluate',
      assertModel(base(), {}, { mode: 'evaluate' }, { disabled: true })
    );

    it(
      'returns feedback',
      assertModel(
        base({
          correctResponse: ['a', 'b'],
          feedback: { correct: { type: 'custom', custom: 'foo' } }
        }),
        { value: ['a', 'b'] },
        { mode: 'evaluate' },
        { feedback: 'foo' }
      )
    );

    describe('choices and outcomes', () => {
      let model, session, env;

      model = base({
        correctResponse: ['a', 'b', 'c'],
        alternateResponses: [['c', 'b', 'a']],
        choices: [{ label: 'a', id: 'a' }, { label: 'b', id: 'b' }, { label: 'c', id: 'c' }]
      });

      session = { value: ['a', 'b', 'c'] };
      env = { mode: 'evaluate' };

      it(
        'choices',
        assertModel(
          model,
          {},
          {},
          {
            choices: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { label: 'c', id: 'c' }]
          }
        )
      );

      // Main Correct Response
      it(
        'returns outcomes - 3 correct',
        assertModel(model, session, env, {
          outcomes: [
            { id: 'a', outcome: 'correct' },
            { id: 'b', outcome: 'correct' },
            { id: 'c', outcome: 'correct' }
          ]
        })
      );

      // Alternate Correct Response
      it(
        'returns outcomes for alternate response - 3 correct',
        assertModel(model, { value: ['c', 'b', 'a'] }, env, {
          outcomes: [
            { id: 'c', outcome: 'correct' },
            { id: 'b', outcome: 'correct' },
            { id: 'a', outcome: 'correct' }
          ]
        })
      );

      // Main Correct Response
      it(
        'returns outcomes - 1 correct',
        assertModel(model, { value: ['a'] }, env, {
          outcomes: [{ id: 'a', outcome: 'correct' }]
        })
      );

      // Alternate Correct Response
      it(
        'returns outcomes for alternate - 1 correct',
        assertModel(model, { value: ['c'] }, env, {
          outcomes: [{ id: 'c', outcome: 'correct' }]
        })
      );

      it(
        'does not return config.correctResponse - 1 correct',
        assertModel(model, session, env, { disabled: true })
      );

      it(
        'returns outcomes - 2 incorrect',
        assertModel(model, { value: ['b', 'a'] }, env, {
          outcomes: [
            { id: 'b', outcome: 'incorrect' },
            { id: 'a', outcome: 'incorrect' }
          ]
        })
      );

      it(
        'returns config.correctResponse - 2 - incorrect',
        assertModel(model, { value: ['b', 'a'] }, env, {
          correctResponse: ['a', 'b', 'c']
        })
      );

    });

    describe('lockChoiceOrder', () => {
      let model = {
        correctResponse: ['a', 'b'],
        prompt: 'this is a prompt',
        choices: [
          { label: 'one', id: '1', lockChoiceOrder: true },
          { label: 'two', id: '2' },
          { label: 'three', id: '3' }
        ],
        lockChoiceOrder: false
      };

      let session = {};
      let env = {};

      it('does not shuffle choice marked "lockChoiceOrder": false', () =>
        controller.model(model, session, env).then(result => {
          expect(result.choices[0]).toEqual({
            label: 'one',
            id: '1',
            lockChoiceOrder: true
          });
        }));

      it('shuffles choices not marked "lockChoiceOrder": false', () =>
        controller.model(model, session, env).then(result => {
          expect(result.choices[1]).not.toEqual({
            label: 'one',
            id: '1',
            lockChoiceOrder: true
          });
          expect(result.choices[2]).not.toEqual({
            label: 'one',
            id: '1',
            lockChoiceOrder: true
          });
        }));
    });

    describe('session not set', () => {
      const assertModelCorrectness = session => {
        it(`returns correctness: incorrect of session is ${JSON.stringify(session)}`, async () => {
          const m = await controller.model(
            base({ correctResponse: ['a', 'b'] }), session, { mode: 'evaluate' });
          expect(m.correctness).toEqual('incorrect')
        });
      };

      assertModelCorrectness(undefined);
      assertModelCorrectness(null);
      assertModelCorrectness({});
    });
  });

  describe('outcome', () => {
    const assertOutcome = (question, value, expectedScore, env) => {
      it(`${expectedScore} when answer: ${value} and question: ${JSON.stringify(
        question
      )}, env: ${JSON.stringify(env)}`, async () => {
        const result = await controller.outcome(question, { value }, env);
        expect(result.score).toEqual(expectedScore);
      });
    };
    const assertOutcomeError = (question, session, env) => {
      it(`throws error for ${JSON.stringify(question)}`, () =>
        expect(controller.outcome(question, session, env)).rejects.toThrow(
          controller.questionError()
        ));
    };
    const assertOutcomeSessionNotset = (session) => {
      it(`return score: 0 and empty: true if session is ${JSON.stringify(session)}`, () =>
        expect(controller.outcome({}, session, { mode: 'evaluate' }))
          .resolves.toEqual({ score: 0, empty: true }));
    };

    assertOutcomeError(null, { value: [] }, {});
    assertOutcomeError({}, { value: [] }, {});
    assertOutcomeError({ correctResponse: [] }, { value: [] }, {});

    assertOutcomeSessionNotset(undefined);
    assertOutcomeSessionNotset(null);
    assertOutcomeSessionNotset({});

    // Main Correct Response
    assertOutcome({ partialScoring: true, correctResponse: ['a'], alternateResponses: [['c']] }, ['a'], 1);
    assertOutcome({ partialScoring: true, correctResponse: ['a'], alternateResponses: [['c']] }, ['b'], 0);
    assertOutcome({ correctResponse: ['a', 'b', 'c'], alternateResponses: [['b', 'c', 'a']] }, ['c', 'a', 'b'], 0.33);
    assertOutcome({ correctResponse: ['a', 'b'], alternateResponses: [['c', 'b']] }, ['c', 'a', 'b'], 0);
    assertOutcome({ correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'c', 'b']] }, ['a', 'b'], 0.33);
    assertOutcome(
      { partialScoring: true, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'b']] },
      ['c', 'a', 'b'],
      0.33
    );
    assertOutcome(
      { partialScoring: false, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'c', 'b']] },
      ['a', 'b'],
      0
    );
    assertOutcome(
      { partialScoring: false, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'b']] },
      ['c', 'a', 'b'],
      0.33,
      { partialScoring: true }
    );

    // Alternate Correct Response
    assertOutcome({ partialScoring: true, correctResponse: ['a'], alternateResponses: [['c']] }, ['c'], 1);
    assertOutcome({ partialScoring: true, correctResponse: ['a'], alternateResponses: [['c']] }, ['b'], 0);
    assertOutcome({ correctResponse: ['a', 'b', 'c'], alternateResponses: [['c', 'b', 'a']] }, ['c', 'a', 'b'], 0.67);
    assertOutcome({ correctResponse: ['a', 'b'], alternateResponses: [['c', 'b']] }, ['c', 'a', 'b'], 0);
    assertOutcome({ correctResponse: ['a', 'b', 'c'], alternateResponses: [['c', 'b', 'a']] }, ['c', 'b'], 0.33);
    assertOutcome(
      { partialScoring: true, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'c', 'b']] },
      ['c', 'a', 'b'],
      0.67
    );
    assertOutcome(
      { partialScoring: false, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'c', 'b']] },
      ['a', 'b'],
      0
    );
    assertOutcome(
      { partialScoring: false, correctResponse: ['a', 'b', 'c'], alternateResponses: [['a', 'c', 'b']] },
      ['c', 'a', 'b'],
      0.67,
      { partialScoring: true }
    );
  });
});
