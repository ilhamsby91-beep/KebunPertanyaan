// Pengatur bank soal.
// Data soal dipisah ke folder questions/kelas-X/ agar mudah diedit.

const QUESTION_BANK = {
  4: {},
  5: {},
  6: {}
};

const SUBJECTS = [
  {
    id: "mtk",
    name: "Matematika"
  },
  {
    id: "bing",
    name: "Bahasa Inggris"
  },
  {
    id: "ips",
    name: "IPS"
  },
  {
    id: "ipa",
    name: "IPA"
  },
  {
    id: "bindo",
    name: "Bahasa Indonesia"
  }
];

function getQuestion(grade, subject, usedQuestions) {
  const questionList = QUESTION_BANK[grade][subject];
  const availableQuestions = questionList.filter(
    (question) => !usedQuestions.has(question.id)
  );

  const questionPool = availableQuestions.length > 0
    ? availableQuestions
    : questionList;

  const randomIndex = Math.floor(Math.random() * questionPool.length);
  const selectedQuestion = questionPool[randomIndex];

  usedQuestions.add(selectedQuestion.id);

  return selectedQuestion;
}
