import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Question {
  question: string;
  options: string[];
  correct: string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questionsData: Question[] = [];
  currentPage: number = 1;
  questionsPerPage: number = 10;
  userAnswers: { [key: number]: string } = {};
  isSubmitted: boolean = false; // Thêm thuộc tính isSubmitted
  showModal: boolean = false; // Thêm thuộc tính showModal
  numCorrect: number = 0;

  constructor(private http: HttpClient) {}

  // ngOnInit(): void {
  //   this.http.get<Question[]>('assets/data/questions.json')
  //     .subscribe(data => {
  //       this.questionsData = this.shuffleQuestions(data);
  //     });
  // }

  ngOnInit(): void {
    this.http.get<Question[]>('assets/data/questions.json')
    .subscribe(data => {
    this.questionsData = this.shuffleQuestions(data);
    });
    const savedAnswers = localStorage.getItem('userAnswers');
    this.userAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};
    console.log('Retrieved answers:', this.userAnswers);
    }

  shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }

  handleAnswer(questionIndex: number, answer: string): void {
    this.userAnswers[questionIndex] = answer;
    localStorage.setItem('userAnswers', JSON.stringify(this.userAnswers));
    console.log('Saved answers:', this.userAnswers);
    }
    

  countUserAnswers(): number {
    return Object.keys(this.userAnswers).length;
  }

submitAnswers(): void {
  const unansweredQuestions = this.questionsData.filter((question, index) => !this.userAnswers[index]);
  if (unansweredQuestions.length > 0) {
  this.showModalFunction();
  } else {
  this.calculateResults();
  this.isSubmitted = true;
  }
  }

  calculateResults(): void {
    this.numCorrect = this.questionsData.reduce((correctCount, question, index) => {
    return correctCount + (this.userAnswers[index] === question.correct ? 1 : 0);
    }, 0);
    }

    confirmSubmit(): void {
      this.calculateResults();
      this.isSubmitted = true;
      this.hideModal();
      }



// Hàm hiển thị modal
showModalFunction(): void {
  this.showModal = true;
}
  hideModal(): void{
    this.showModal = false;
  }

  restartQuiz(): void {
    this.isSubmitted = false;
    this.userAnswers = {};
    localStorage.removeItem('userAnswers'); // Xóa userAnswers từ localStorage
    this.http.get<Question[]>('assets/data/questions.json')
    .subscribe(data => {
    this.questionsData = this.shuffleQuestions(data);
    });
    }

  isSelectedAnswer(questionIndex: number, option: string): boolean {
    return this.userAnswers[questionIndex] === option;
  }
  isCorrectAnswer(questionIndex: number, option: string): boolean {
    return this.questionsData[questionIndex].correct === option;
  }
  isWrongAnswer(questionIndex: number, option: string): boolean {
    return this.isSelectedAnswer(questionIndex, option) && !this.isCorrectAnswer(questionIndex, option);
  }    


  showResults(): void {
    let numCorrect = 0;
    this.questionsData.forEach((question, index) => {
      if (this.userAnswers[index] === question.correct) {
        numCorrect++;
      }
    });
    alert(`You got ${numCorrect} out of ${this.questionsData.length} correct`);
  }


  getCurrentQuestions(): Question[] {
    return this.questionsData.slice(
      (this.currentPage - 1) * this.questionsPerPage,
      this.currentPage * this.questionsPerPage
    );
  }

  nextPage(): void {
    if (this.currentPage < Math.ceil(this.questionsData.length / this.questionsPerPage)) {
      this.currentPage++;
    }
  }
  
  

  maxPage(): number {
    return Math.ceil(this.questionsData.length / this.questionsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
