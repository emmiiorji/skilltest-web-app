import { convertAnswerToArray } from "./convertAnswerToArray";

const checkEqualityWhenUserAnswerString = (userAnswer: string, correctAnswersArray: (string | number)[] ) => {
  // coerce to number if correctAnswer is a number
  return correctAnswersArray.some(correctAnswer => 
    typeof correctAnswer === 'number' ? Number(userAnswer) === correctAnswer : correctAnswer == userAnswer
  );
};

const checkEqualityWhenUserAnswerArray = (userAnswer: (string | number)[], correctAnswersArray: (string | number)[]) => {
  console.debug({userAnswer, correctAnswersArray});
  if (userAnswer.length !== correctAnswersArray.length) {
    return false;
  }
  return correctAnswersArray.every((correctAnswer, index) => {
    const userValue = userAnswer[index];
    
    // coerce to number if correctAnswer is a number
    return typeof correctAnswer === 'number' ? Number(userValue) === correctAnswer : correctAnswer == userValue;
  });
}

export function checkAnswerCorrectness(
  userAnswer: string, 
  correctAnswers: string
): boolean {
  const correctAnswersArray = convertAnswerToArray(correctAnswers);
  console.debug({correctAnswersArray, userAnswer});

  // Check if correct answers array is an array of arrays.
  if (Array.isArray(correctAnswersArray[0])) {
    for (const correctAnswer of correctAnswersArray) {
      const isCorrect = checkEqualityWhenUserAnswerArray(
        typeof userAnswer === "string" ? JSON.parse(userAnswer) : userAnswer, 
        correctAnswer as (string | number)[]);
      if (isCorrect) {
        return true;
      }
    }
    return false;
  } 
  
  return checkEqualityWhenUserAnswerString(userAnswer as  string, correctAnswersArray as (string | number)[]);
}
