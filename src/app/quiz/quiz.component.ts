import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Question {
  title: string;
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
  currentPart: string = 'part5'; // Thêm biến currentPart để theo dõi phần hiện tại

  constructor(private http: HttpClient) {}

  // ngOnInit(): void {
  //   this.http.get<Question[]>('assets/data/questions.json')
  //     .subscribe(data => {
  //       this.questionsData = this.shuffleQuestions(data);
  //     });
  // }

  ngOnInit(): void {
    this.loadQuestions(); // Load câu hỏi khi component khởi tạo
  }

  // Function để load câu hỏi từ file JSON
  loadQuestions(): void {
    const part = this.currentPart === 'part5' ? 'part5.json' : 'part7.json'; // Lựa chọn file JSON tương ứng với phần hiện tại
    this.http.get<Question[]>('assets/data/' + part)
      .subscribe(data => {
        if (this.currentPart === 'part5') {
          this.questionsData = this.shuffleQuestions(data); // Random câu hỏi nếu là part 5
        } else {
          this.questionsData = data; // Sử dụng câu hỏi không random nếu là part 7
        }
      });
  }

  shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }
  get quizTitle(): string {
    return this.currentPart === 'part5' ? 'Quiz App Toeic Part 5' : 'Quiz App Toeic Part 7';
  }
  // Function để chuyển đổi giữa Part 5 và Part 7
  switchToPart(part: string): void {
    this.currentPart = part;
    this.loadQuestions(); // Load lại câu hỏi khi chuyển đổi phần
    this.resetQuiz(); // Reset câu trả lời và kết quả
  }
  // Function để reset quiz
  resetQuiz(): void {
    this.isSubmitted = false;
    this.userAnswers = {};
    localStorage.removeItem('userAnswers');
    this.currentPage = 1; // Reset trang về trang đầu tiên
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
