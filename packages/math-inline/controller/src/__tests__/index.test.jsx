import { model, outcome, createCorrectResponseSession } from '../index';

const defaultModel = {
  responseType: 'Advanced Multi',
  equationEditor: '3',
  expression: '{{response}} = {{response}} \\text{eggs}',
  prompt:
    '<p>Sam sells baskets of eggs at his farm stand. He sold 12 baskets and wrote the number sentence below to show how many eggs he sold in all.</p><p><span class="equation-block"><math xmlns="http://www.w3.org/1998/Math/MathML" >\n <mrow>\n  <mn>12</mn><mo>&#x00D7;</mo><mo>&#x25A1;</mo><mo>=</mo><mn>72</mn>\n </mrow>\n</math> </span></p><p>What <span class="relative-emphasis">division</span> number sentence can be used to show how many eggs were in each basket?</p><p>Use the on-screen keyboard to type your number sentence and answer in the box.</p>',
  responses: [
    {
      id: '1',
      answer: '72\\div12=6\\text{eggs}',
      alternates: {
        '1': '6=72\\div12\\text{eggs}',
        '2': '\\frac{72}{12}=6\\text{eggs}',
        '3': '6=\\frac{72}{12}\\text{eggs}'
      },
      validation: 'literal'
    }
  ],
  customKeys: ['\\left(\\right)', '\\frac{}{}', 'x\\frac{}{}'],
  id: 1
};

const mkQuestion = model => model || defaultModel;

describe('model', () => {
  let result, question, session, env, outcomeResult;

  describe('gather', () => {
    beforeEach(async () => {
      question = mkQuestion();
      session = {};
      env = { mode: 'gather' };
      result = await model(question, session, env);
    });

    it('returns disabled:false', () => {
      expect(result.disabled).toEqual(false);
    });

    it('returns undefined for correctness ', () => {
      expect(result.correctness).toEqual(undefined);
    });

    it('returns empty object for correctResponse ', () => {
      expect(result.correctResponse).toEqual({});
    });

    it('returns undefined for feedback', () => {
      expect(result.feedback).toEqual(undefined);
    });
  });

  describe('view', () => {
    beforeEach(async () => {
      question = mkQuestion();
      session = {};
      env = { mode: 'view' };
      result = await model(question, session, env);
    });

    it('returns disabled:true', () => {
      expect(result.disabled).toEqual(true);
    });

    it('returns undefined for correctness ', () => {
      expect(result.correctness).toEqual(undefined);
    });

    it('returns empty object for correctResponse ', () => {
      expect(result.correctResponse).toEqual({});
    });

    it('returns default correct for feedback', () => {
      expect(result.feedback).toEqual(undefined);
    });
  });

  describe('evaluate - empty', () => {
    beforeEach(async () => {
      question = mkQuestion();
      session = {};
      env = { mode: 'evaluate' };
      result = await model(question, session, env);
    });

    it('returns disabled:true', () => {
      expect(result.disabled).toEqual(true);
    });

    it('returns empty for correctness ', () => {
      expect(result.correctness).toEqual({
        correct: false,
        correctness: 'unanswered',
        score: '0%'
      });
    });
  });

  describe('evaluate - correct', () => {
    beforeEach(async () => {
      env = { mode: 'evaluate' };
    });

    it('returns correct for correctness', async () => {
      question = mkQuestion();
      session = { completeAnswer: '72\\div12=6\\text{eggs}' };
      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '6=72\\div12\\text{eggs}' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '\\frac{72}{12}=6\\text{eggs}' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness with text nodes too', async () => {
      question = mkQuestion();
      session = { completeAnswer: '72\\div12=6eggs' };
      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness with text nodes too in symbolic', async () => {
      question = mkQuestion();
      session = { completeAnswer: '72\\div12=6eggs' };
      question.responses[0].validation = 'symbolic';
      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness even with hyphen vs minus sign', async () => {
      question = mkQuestion({
        ...defaultModel,
        expression: '{{response}}',
        responses: [
          {
            id: '1',
            answer: '8-4',
            alternates: {
              '1': '4−2'
            },
            validation: 'literal'
          }
        ]
      });

      env = { mode: 'evaluate' };

      session = { completeAnswer: '4-2' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '4−2' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '8-4' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '8−4' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness in cdot vs times situations', async () => {
      question = mkQuestion({
        ...defaultModel,
        expression: '{{response}}',
        responses: [
          {
            id: '1',
            answer: '8\\cdot4',
            alternates: {
              '1': '4\\times2'
            },
            validation: 'literal'
          }
        ]
      });

      env = { mode: 'evaluate' };

      session = { completeAnswer: '8\\times4' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = { completeAnswer: '4\\cdot2' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness if allowSpaces is true', async () => {
      question = mkQuestion({
        ...defaultModel,
        responses: [
          {
            allowSpaces: true,
            answer: '\\frac{4}{15}\\ \\text{square}\\ \\text{inches}',
            id: '1',
            alternates: {},
            validation: 'literal'
          }
        ]
      });
      session = {
        completeAnswer: '\\frac{4}{15}\\ \\text{square}\\ \\text{inches}'
      };

      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('returns correct for correctness if allowSpaces is true in simple mode too', async () => {
      question = mkQuestion({
        ...defaultModel,
        responseType: 'Simple',
        responses: [
          {
            allowSpaces: true,
            allowDecimals: true,
            answer: '3000',
            id: '1',
            alternates: {},
            validation: 'literal'
          }
        ]
      });
      session = {
        response: '3,000'
      };

      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    describe('all responses are checked', () => {
      beforeEach(() => {
        question = mkQuestion({
          ...defaultModel,
          responses: [
            {
              answer: '0.5+3.5',
              validation: 'symbolic',
              alternates: ['2']
            },
            { answer: 'foo', validation: 'literal', allowSpaces: true, id: '1' }
          ]
        });
      });

      it('4 is correct - symbolic match answer', async () => {
        result = await model(question, { completeAnswer: '4' }, env);
        expect(result.correctness.correctness).toEqual('correct');
      });

      it('3 is incorrect - no match', async () => {
        result = await model(question, { completeAnswer: '3' }, env);
        expect(result.correctness.correctness).toEqual('incorrect');
      });

      it('2 is correct - symbolic match responses[0].alternates[0]', async () => {
        result = await model(question, { completeAnswer: '2' }, env);
        expect(result.correctness.correctness).toEqual('correct');
      });

      it('foo is correct - literal match response[1]', async () => {
        result = await model(question, { completeAnswer: 'foo' }, env);
        expect(result.correctness.correctness).toEqual('correct');
      });
    });

    it('works for incorrect latex frac command too with stringCheck false', async () => {
      question = mkQuestion({
        ...defaultModel,
        responseType: 'Advanced Multi',
        expression: '{{response}}',
        responses: [
          {
            alternates: {},
            answer: '1\\frac14',
            validation: 'symbolic',
            id: '1',
            allowSpaces: true,
            stringCheck: false
          }
        ]
      });
      session = {
        completeAnswer: '1\\frac{1}{4}'
      };

      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = {
        completeAnswer: '1\\frac1{4}'
      };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });

    it('works for incorrect latex frac command too with stringCheck true', async () => {
      question = mkQuestion({
        ...defaultModel,
        responseType: 'Advanced Multi',
        expression: '{{response}}',
        responses: [
          {
            alternates: {},
            answer: '1\\frac14',
            validation: 'symbolic',
            id: '1',
            allowSpaces: true,
            stringCheck: true
          }
        ]
      });
      session = {
        completeAnswer: '1\\frac{1}{4}'
      };

      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');

      session = {
        completeAnswer: '1\\frac1{4}'
      };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('correct');
      expect(result.correctness.score).toEqual('100%');
    });
  });

  describe('evaluate - incorrect', () => {
    beforeEach(async () => {
      env = { mode: 'evaluate' };
    });

    it('returns incorrect for correctness', async () => {
      question = mkQuestion();
      session = { completeAnswer: '2\\div12=6\\text{eggs}' };
      env = { mode: 'evaluate' };
      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('incorrect');
      expect(result.correctness.score).toEqual('0%');

      session = { completeAnswer: '6=712\\div12\\text{eggs}' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('incorrect');
      expect(result.correctness.score).toEqual('0%');

      session = { completeAnswer: '\\frac{752}{12}=6\\text{eggs}' };

      result = await model(question, session, env);

      expect(result.correctness.correctness).toEqual('incorrect');
      expect(result.correctness.score).toEqual('0%');
    });
  });
});

describe('outcome', () => {
  let result;
  const question = mkQuestion();
  const env = { mode: 'evaluate' };

  it('returns correct for correctness in outcome', async () => {
    let session = { completeAnswer: '72\\div12=6\\text{eggs}' };
    let outcomeResult = await outcome(question, session, env);

    expect(outcomeResult.score).toEqual(1);

    session = { completeAnswer: '\\frac{72}{12}=6\\text{eggs}' };

    outcomeResult = await outcome(question, session, env);

    expect(outcomeResult.score).toEqual(1);
  });

  it('returns incorrect for correctness in outcome', async () => {
    let session = { completeAnswer: '2\\div12=6\\text{eggs}' };
    let outcomeResult = await outcome(question, session, env);

    expect(outcomeResult.score).toEqual(0);

    session = { completeAnswer: '\\frac{752}{12}=6\\text{eggs}' };

    result = await outcome(question, session, env);

    expect(outcomeResult.score).toEqual(0);
  });

  const returnOutcome = session => {
    it(`returns score: 0 and empty: true if session is ${JSON.stringify(
      session
    )}`, async () => {
      let outcomeResult = await outcome(question, session, env);

      expect(outcomeResult).toEqual({ score: 0, empty: true });
    });
  };

  returnOutcome(undefined);
  returnOutcome(null);
  returnOutcome({});
});

describe('createCorrectResponseSession', () => {
  const question = {
    responseType: 'Advanced Multi',
    expression: '{{response}} = {{response}}',
    prompt:
      '<p>Sam sells baskets of eggs at his farm stand. He sold 12 baskets and wrote the number sentence below to show how many eggs he sold in all.</p><p><span class="equation-block"><math xmlns="http://www.w3.org/1998/Math/MathML" >\n <mrow>\n  <mn>12</mn><mo>&#x00D7;</mo><mo>&#x25A1;</mo><mo>=</mo><mn>72</mn>\n </mrow>\n</math> </span></p><p>What <span class="relative-emphasis">division</span> number sentence can be used to show how many eggs were in each basket?</p><p>Use the on-screen keyboard to type your number sentence and answer in the box.</p>',
    responses: [
      {
        id: '1',
        answer: '72\\div12=6',
        alternates: {
          '1': '6=72\\div12]',
          '2': '\\frac{72}{12}=6',
          '3': '6=\\frac{72}{12}'
        },
        validation: 'literal'
      }
    ],
    customKeys: ['\\left(\\right)', '\\frac{}{}', 'x\\frac{}{}']
  };

  it('returns correct response if role is instructor and mode is gather', async () => {
    const sess = await createCorrectResponseSession(question, {
      mode: 'gather',
      role: 'instructor'
    });

    expect(sess).toEqual({
      answers: {
        r1: { value: '72\\div12' },
        r2: { value: '6' }
      },
      completeAnswer: '72\\div12=6',
      response: '72\\div12=6',
      id: '1'
    });
  });

  it('returns correct response if role is instructor and mode is view', async () => {
    const sess = await createCorrectResponseSession(question, {
      mode: 'view',
      role: 'instructor'
    });

    expect(sess).toEqual({
      answers: {
        r1: { value: '72\\div12' },
        r2: { value: '6' }
      },
      completeAnswer: '72\\div12=6',
      response: '72\\div12=6',
      id: '1'
    });
  });

  it('returns correct response if role is instructor and mode is view and responseType is Simple', async () => {
    const sess = await createCorrectResponseSession(
      {
        ...question,
        responses: [
          { answer: '\\frac{3}{4}', validation: 'symbolic', id: '1' }
        ],
        responseType: 'Simple'
      },
      {
        mode: 'view',
        role: 'instructor'
      }
    );

    expect(sess).toEqual({
      answers: {
        r1: { value: '' },
        r2: { value: '\\frac{3}{4}' }
      },
      completeAnswer: '\\frac{3}{4}',
      response: '\\frac{3}{4}',
      id: '1'
    });
  });

  it('returns null if mode is evaluate', async () => {
    const noResult = await createCorrectResponseSession(question, {
      mode: 'evaluate',
      role: 'instructor'
    });

    expect(noResult).toBeNull();
  });

  it('returns null if role is student', async () => {
    const noResult = await createCorrectResponseSession(question, {
      mode: 'gather',
      role: 'student'
    });

    expect(noResult).toBeNull();
  });

  describe('PIE-188', () => {
    it('works', async () => {
      const question = {
        responseType: 'Advanced Multi',
        expression: '{{response}}',
        equationEditor: 'everything',
        responses: [
          {
            alternates: {},
            answer: '1530',
            validation: 'symbolic',
            id: '1',
            allowSpaces: true
          }
        ],
        id: '1',
        element: 'math-inline',
        customKeys: [
          '<',
          '\\le',
          '\\ge',
          '>',
          '\\frac{}{}',
          'x^{}',
          '\\left(\\right)'
        ]
      };
      const session = {
        id: '1',
        answers: {
          r1: {
            value: '\\odot'
          }
        },
        completeAnswer: '\\odot'
      };
      const env = { mode: 'evaluate' };

      try {
        await model(question, session, env);
      } catch (e) {
        console.error('>>');
        console.log(e);
        fail(e);
      }
      await expect(model(question, session, env)).resolves.toMatchObject({
        correctness: { correct: false }
      });
    });
  });
});

describe('6456 - outcome', () => {
  const question = {
    equationEditor: 8,
    responseType: 'Advanced Multi',
    teacherInstructions: '',
    expression: '{{response}}',
    responses: [
      {
        allowSpaces: true,
        answer: '-12.5',
        id: '1',
        alternates: { '1': '-12.5\\%' },
        validation: 'symbolic'
      }
    ],
    id: '1',
    prompt: 'prompt',
    rationale: 'rationale',
    element: 'math-inline'
  };

  it('scores 0', async () => {
    const session = {
      id: '1',
      answers: { r1: { value: '-12\\%' } },
      completeAnswer: '-12\\%'
    };

    const env = { mode: 'evaluate' };
    const result = await outcome(question, session, env);
    expect(result).toEqual({ score: 0 });
  });

  it('scores 1', async () => {
    const session = {
      id: '1',
      answers: { r1: { value: '-12.5\\%' } },
      completeAnswer: '-12.5\\%'
    };

    const env = { mode: 'evaluate' };
    const result = await outcome(question, session, env);
    expect(result).toEqual({ score: 1 });
  });
});
