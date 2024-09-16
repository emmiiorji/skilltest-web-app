import { convertAnswerToArray } from "./convertAnswerToArray";

const checkArraysEqual = (
  userAnswer: string | number | (string | number)[],
  correctAnswerArray: (string | number)[]
): boolean => {

  // If user answer is array, check if it has the same length as correct answer array
  if (Array.isArray(userAnswer)) {
    if (userAnswer.length !== correctAnswerArray.length) {
      return false;
    }
    
    // Check if user answer is equal to any of the correct answers
    return correctAnswerArray.every(
      (correctAnswer, index) => correctAnswer == userAnswer[index]
    );
  };

  return correctAnswerArray.includes(userAnswer);
}
    

export function checkAnswerCorrectness(
  userAnswer: string | number | (string | number)[], 
  correctAnswers: string
): boolean {
  const correctAnswersArray = convertAnswerToArray(correctAnswers);
  console.debug({correctAnswersArray, userAnswer});

  // Check if arrays have the same length
  if (Array.isArray(correctAnswersArray[0])) {
    for (const correctAnswer of correctAnswersArray) {
      const isCorrect = checkArraysEqual(userAnswer, correctAnswer as (string | number)[]);
      if (isCorrect) {
        return true;
      }
    }
    return false;
  } 
  
  return checkArraysEqual(userAnswer, correctAnswersArray as (string | number)[]);
}
