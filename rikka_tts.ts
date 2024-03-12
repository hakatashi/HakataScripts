import say from 'say';
import fs from 'fs/promises';

(async () => {
  const questionText = await fs.readFile('temp2.txt', 'utf-8')
  const questionLines = questionText.split(/\r?\n/).filter((line) => line.length > 0)
  for (const [i, questionLine] of questionLines.entries()) {
    const [answer, question] = questionLine.split('\t');
    console.log(i, question);
    

    await new Promise<void>((resolve) => {
      say.export(`問題。${question}`, 'CeVIO-AI-小春六花', 1, `rikka_voices/${i.toString().padStart(4, '0')}a_question.wav`, () => {
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      say.export(`正解は、${answer}`, 'CeVIO-AI-小春六花', 1, `rikka_voices/${i.toString().padStart(4, '0')}b_answer.wav`, () => {
        resolve();
      });
    });
  }
})();