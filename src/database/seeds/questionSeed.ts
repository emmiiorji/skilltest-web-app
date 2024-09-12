import { AppDataSource } from "../connection";
import { Question } from "../entities/Question.entity";

const questions = [
    {
        question: "What is the output of console.log(typeof null)?",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q1" value="object"> object<br>
            <input type="radio" name="q1" value="null"> null<br>
            <input type="radio" name="q1" value="undefined"> undefined<br>
            <input type="radio" name="q1" value="number"> number
        `,
        correct: "object",
    },
    {
        question: "Explain the concept of closures in JavaScript.",
        answer_type: "textarea",
        answer_html: `<textarea name="q2" rows="4" cols="50"></textarea>`,
        correct: "A closure is the combination of a function bundled together with references to its surrounding state.",
    },
    {
        question: "What are the two values of the Boolean type in JavaScript?",
        answer_type: "multiinput",
        answer_html: `
            <input type="text" name="q3_1">
            <input type="text" name="q3_2">
        `,
        correct: "true,false",
    },
    {
        question: "What is the output of the following code?\n\nconsole.log(2 + '2');",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q4" value="4"> 4<br>
            <input type="radio" name="q4" value="22"> 22<br>
            <input type="radio" name="q4" value="NaN"> NaN<br>
            <input type="radio" name="q4" value="TypeError"> TypeError
        `,
        correct: "22",
    },
    {
        question: "Which method is used to remove the last element from an array in JavaScript?",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q5" value="pop"> pop()<br>
            <input type="radio" name="q5" value="push"> push()<br>
            <input type="radio" name="q5" value="shift"> shift()<br>
            <input type="radio" name="q5" value="unshift"> unshift()
        `,
        correct: "pop",
    },
    {
        question: "What will be the output of the following code?\n\nconst arr = [1, 2, 3];\nconst [a, , c] = arr;\nconsole.log(a, c);",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q6" value="1 2"> 1 2<br>
            <input type="radio" name="q6" value="1 3"> 1 3<br>
            <input type="radio" name="q6" value="1 undefined"> 1 undefined<br>
            <input type="radio" name="q6" value="undefined 3"> undefined 3
        `,
        correct: "1 3",
    },
    {
        question: "What is the output of the following code?\n\nconsole.log(typeof NaN);",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q7" value="number"> number<br>
            <input type="radio" name="q7" value="NaN"> NaN<br>
            <input type="radio" name="q7" value="undefined"> undefined<br>
            <input type="radio" name="q7" value="object"> object
        `,
        correct: "number",
    },
    {
        question: "What will be logged to the console?\n\nlet x = 5;\nsetTimeout(() => console.log(x), 0);\nx = 10;",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q8" value="5"> 5<br>
            <input type="radio" name="q8" value="10"> 10<br>
            <input type="radio" name="q8" value="undefined"> undefined<br>
            <input type="radio" name="q8" value="Error"> Error
        `,
        correct: "10",
    },
    {
        question: "What is the output of the following code?\n\nconst obj = {a: 1, b: 2, c: 3};\nconst {a, ...rest} = obj;\nconsole.log(rest);",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q9" value="{b: 2, c: 3}"> {b: 2, c: 3}<br>
            <input type="radio" name="q9" value="{a: 1, b: 2, c: 3}"> {a: 1, b: 2, c: 3}<br>
            <input type="radio" name="q9" value="{c: 3}"> {c: 3}<br>
            <input type="radio" name="q9" value="{}"> {}
        `,
        correct: "{b: 2, c: 3}",
    },
    {
        question: "What will be the output of the following code?\n\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.slice(1, 3));",
        answer_type: "radiobutton",
        answer_html: `
            <input type="radio" name="q10" value="[1, 2]"> [1, 2]<br>
            <input type="radio" name="q10" value="[2, 3]"> [2, 3]<br>
            <input type="radio" name="q10" value="[2, 3, 4]"> [2, 3, 4]<br>
            <input type="radio" name="q10" value="[1, 2, 3]"> [1, 2, 3]
        `,
        correct: "[2, 3]",
    },
    // Add more questions as needed
];

export async function seedQuestions() {
    const questionRepository = AppDataSource.getRepository(Question);

    for (const q of questions) {
        const question = new Question();
        question.question = q.question;
        question.answer_type = q.answer_type as "textarea" | "radiobutton" | "multiinput";
        question.answer_html = q.answer_html;
        question.correct = q.correct;

        await questionRepository.save(question);
    }

    console.info("Questions seeded successfully");
}