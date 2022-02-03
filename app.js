const flag = document.getElementById("flag")
const answers = document.querySelectorAll(".answer")
const startScreen = document.getElementById("startScreen")
const quiz = document.getElementById("quiz")
const progressBar = document.getElementById("progressBar")
const flagsRow = document.getElementById("flagsRow")
const resultElem = document.getElementById("gameResult")
const startButton = document.querySelector("#startButton")
const learningButton = document.querySelector("#learningButton")

// const testUtils = {
//     countriesList: [],
//     currentFlag: "",
//     correctAnswer: "",
//     wrongAnswers: [],
//     answersAll: [],
//     score: 0,
//     learningPath: []
// }
// let countriesList = testUtils.countriesList;
// let currentFlag = testUtils.currentFlag
// let correctAnswer = testUtils.correctAnswer
// let wrongAnswers = testUtils.wrongAnswers
// let answersAll = testUtils.answersAll
// let score = testUtils.score
// let learningPath = testUtils.learningPath

let countriesList = [];
let currentFlag = ""
let correctAnswer = ""
let wrongAnswers = []
let answersAll = []
let score = 0
let learningPath = []
let currentPathDepth = 0


const gameOptions = {
    gameMode: "normal",
    region: "all",
    difficulty: "normal"
}

class NumsGenerator { // one right and three wrong indexes of countries 
    constructor(a) {
        this._rightNum = Math.floor(Math.random()*countriesList.length)
        this._wrongNums = []
        this.setWrongs()
    }
    rightNum() {
        return this._rightNum
    }
    wrongNum() {
        return this._wrongNums
    }
    setWrongs() {
        let i = 0
        while (i < 3) {
            let ran = Math.floor(Math.random()*countriesList.length)
            if (ran !== this._rightNum && this._wrongNums.indexOf(ran) < 0) {
                this._wrongNums[i] = ran
                i++
            }
        }
    }
}

function startGame(mode) {
    if (mode) gameOptions.gameMode = mode   
    
    // gameOptions.gameMode = mode
    // console.log(typeof mode)
    stopFlagsBar = true
    flag.src = "loading flag.jpg"
    startScreen.classList.add("hide")
    //flagsRow.style.display = "none"
    flagsRow.classList.add("hide")
    quiz.classList.remove("hide")
    answers.forEach(ans => ans.classList.remove("wrong","correct"))
    answers.forEach(ans => ans.addEventListener("click", handleAnswer))
    //scramble()
    if (!countriesList.length) {
        initiateList()
    } else {
       createQuestion() 
    }
    showQuestion()
}

function gameOver(result) {
    console.log(result)
    moveFlagsRow()
    if (result === "win") {
        resultElem.innerText = "you win"
        startButton.style.backgroundColor = "lightgreen"
        startButton.style.color = "#004225"
        learningButton.style.backgroundColor = "lightgreen"
        learningButton.style.color = "#004225"

        resultElem.style.fontWeight = "bold"
    } else if (result === "lose") {
        resultElem.innerText = "you lose"
        startButton.style.backgroundColor = "#DA7F8F"
        startButton.style.color = "#560319"
        learningButton.style.backgroundColor = "#DA7F8F"
        learningButton.style.color = "#560319"

    }

    startScreen.getElementsByTagName("div")[0].innerText = "play again"
    startScreen.classList.remove("hide")
    flagsRow.classList.remove("hide")
    quiz.classList.add("hide")
    score = 0
    progressBar.style.width = `${score}0%`
}

// function scramble() {
//     if (!countriesList.length) {
//         initiateList()
//     } else {
//        createQuestion() 
//     }
// }

function showQuestion() {
    setTimeout(()=>{flag.src = currentFlag}, 000) // TESTING DELAY
    for (let i = 0; i < answers.length; i++) {
        answers[i].innerHTML = answersAll[i]
    }
}

function createQuestion() {
    const gen = new NumsGenerator()
    wrongAnswers = [] // delete wrong answers from the pevious question
    for (num of gen._wrongNums) {
        wrongAnswers.push(countriesList[num].name.common)
    }
    
    if (gameOptions.gameMode === "normal") {
        correctAnsNum = currentPathDepth = gen._rightNum
    } else if (gameOptions.gameMode === "learning") {
        // if (learningPath.length > 0) {
        //     currentPathDepth++
        //     // correctAnsNum = currentPathDepth
        // } else {
        //     createLearPath()
        // }
        if (learningPath.length === 0) {
            createLearPath()
        }
        correctAnsNum = learningPath[currentPathDepth]
    }

    currentFlag = countriesList[correctAnsNum].flags.svg
    correctAnswer = countriesList[correctAnsNum].name.common
    answersAll = wrongAnswers.map(a=>a)
    const inputHere = Math.floor(Math.random()*3)
    answersAll.splice(inputHere, 0, correctAnswer)

}

function createLearPath() {
    if (countriesList.length) {
        let currentIndex = countriesList.length, randomIndex
        for (let i = 0; i < countriesList.length; i++) {
            learningPath.push(i)
        }
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
            [learningPath[currentIndex], 
            learningPath[randomIndex]] 
            = 
            [learningPath[randomIndex], 
            learningPath[currentIndex]]
        }
    }
}

function initiateList() {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", "https://restcountries.com/v3.1/all", true)
        xhr.onload = function() {
            if (xhr.status == 200) {
                countriesList = JSON.parse(this.response)
                resolve()
                //createQuestion() //don't need that
                //showQuestion()
            }
        }
        xhr.send()
        console.log("flags downloaded")
    })
}

function handleAnswer(e) {
    const answer = e.target.innerText
    if (gameOptions.gameMode === "learning") currentPathDepth++
    if (answer === correctAnswer) {
        score++
        giveFeedback() // add style to the answers and update the prog bar
        answers.forEach(ans => ans.removeEventListener("click", handleAnswer)) // remove to avoid spamming
        if (score >= 10 && gameOptions.gameMode === "normal") {
            return setTimeout(()=>gameOver("win"), 1000) // finish game as a winner
        } 
        setTimeout(startGame, 1000) // next round
    } else {
        score -= 3
        giveFeedback(answer)
        answers.forEach(ans => ans.removeEventListener("click", handleAnswer))
        if (score <= 0) {
            // if (gameOptions.gameMode === "learning") currentPathDepth = 0
            currentPathDepth = 0
            setTimeout(()=>gameOver("lose"), 1300) // finish game as a loser
        }
        else {
            setTimeout(startGame, 1000) // next round
        }
    }
}

function giveFeedback(pickedAnswer) { // function call without an argument means correct answer
    if (score <= 0) score = 0
    progressBar.style.width = `${score}0%`
    answers.forEach(ans => {
        if (ans.innerText == pickedAnswer) {
            ans.classList.add("wrong")
        } else if (ans.innerText == correctAnswer){
            ans.classList.add("correct")
        }
    })
}

function createFlagsRow () {
    initiateList().then(() => {
        for (let i = 0; i <= 20; i++) {
            const rn = Math.floor(Math.random()*countriesList.length)
            const smallFlag = document.createElement("img")
            smallFlag.classList.add("smallFlag")
            smallFlag.src = "loading flag.jpg"
            smallFlag.src = countriesList[rn].flags.svg
            flagsRow.appendChild(smallFlag)
        }
        moveFlagsRow()
    })
}

let stopFlagsBar = false
let margin = 0
let marginMax = 0

function moveFlagsRow () {
    stopFlagsBar = false
    marginMax = flagsRow.firstElementChild.offsetWidth // .width causes bugs
    mv()

    function mv() {
        flagsRow.style.marginLeft = `${margin}px`
        margin -= 1
        if (margin < -marginMax-20) {
            flagsRow.appendChild(flagsRow.firstElementChild)
            margin = 0 
            flagsRow.style.marginLeft = `${margin}px`
            marginMax = flagsRow.firstElementChild.offsetWidth
        }
        if (!stopFlagsBar) window.requestAnimationFrame(mv)
    }
}

createFlagsRow()