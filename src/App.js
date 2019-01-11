import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';

var possibleCombinationSum = function (arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount; i++) {
        var combinationSum = 0;
        for (var j = 0; j < listSize; j++) {
            if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
    }
    return false;
};

var interV;
class App extends Component {
    render() {
        return (
            <div>
                <Game />
            </div>
        )
    }
}

class Game extends Component {

    static createRandomNumerOfStars = () => 1 + Math.floor(Math.random() * 9);

    static initialState = () => (
        {
            selectedNumbers: [],
            numberOfStars: Game.createRandomNumerOfStars(),
            answereIsCorrect: null,
            usedNumbers: [],
            lives: 5,
            statusOfGame: '',
            timer: new Date("Jan 1, 2000 00:00:45"),
            buttonStartState: "btn btn-info btn-lg visible"
        });

    state = Game.initialState();

    clickNumberEvent = (numberSelected) => {
        if (this.state.usedNumbers.includes(numberSelected)) return;
        if (this.state.selectedNumbers.includes(numberSelected)) return;
        this.setState(prevState => ({
            selectedNumbers: prevState.selectedNumbers.concat(numberSelected),
            answereIsCorrect: null
        }
        ))
    }

    eraseAnswer = (numberToErase) => {
        this.setState(prevState => (
            {
                selectedNumbers: prevState.selectedNumbers.filter((num) => num !== numberToErase),
                answereIsCorrect: null
            }
        ))
    }

    acceptAnswer = () => {
        this.setState(prevState => ({
            usedNumbers: prevState.usedNumbers.concat(this.state.selectedNumbers),
            numberOfStars: Game.createRandomNumerOfStars(),
            selectedNumbers: [],
            answereIsCorrect: null,
        }), this.setStatusGame)
    }

    checkAnswer = () => {
        this.setState(prevState => ({
            answereIsCorrect:
                this.state.selectedNumbers.reduce((prev, acc) => prev + acc) === this.state.numberOfStars
        }))
    }

    redraw = () => {
        if (this.state.lives === 0) return
        this.setState(prevState => ({
            numberOfStars: Game.createRandomNumerOfStars(),
            selectedNumbers: [],
            answereIsCorrect: null,
            lives: prevState.lives - 1,
        }), this.setStatusGame)
    }

    setStatusGame = () => {
        this.setState(prevState => {
            if (prevState.usedNumbers.length === 9){
                this.stopTimer();
                return { statusOfGame: "You won the Game!" }
            }
               
            else if (prevState.lives === 0 && !this.possibleSolution(prevState))
            {
                this.stopTimer();
                return { statusOfGame: "Game Over!" }
            }
                
        })
    }

    possibleSolution = ({ numberOfStars, usedNumbers }) => {
        const possibleNumbers = _.range(1, 10).filter((num) =>
            usedNumbers.indexOf(num) === -1)
        return possibleCombinationSum(possibleNumbers, numberOfStars)
    }

    resetGame = () => this.setState(Game.initialState())

    startTimer = () => {
        this.setState((prevState) => ({
            buttonStartState: "invisible"
        }))
        interV = setInterval(this.restTime, 1000);
    }

    stopTimer = () => clearInterval(interV);

    restTime = () => {
        this.setState((prevState) => (
            { timer: new Date(prevState.timer.setSeconds(prevState.timer.getSeconds() - 1)) })
        , this.checkTime())
    }

    checkTime = () => {
        this.setState( prevState => {
                if(prevState.timer.getSeconds()===1){
                    clearInterval(interV);
                    return { statusOfGame: "Game Over!" }
                }
             })
     }

    render() {
        const { selectedNumbers, numberOfStars, answereIsCorrect, usedNumbers, lives, statusOfGame, timer, buttonStartState } = this.state;
        return (
            <div className="container">
                <div id="header">
                    <h1>PLAY NINE</h1>
                    <div id="timer-display">
                        <span id="timer">Timer:</span>
                        <Counter timer={timer} 
                                 checkTime={this.checkTime}/>
                    </div>

                </div>

                <div id="line"><br /></div>

                <div id="game-content">
                    <div className="game-controls">
                        <Stars numberOfStars={numberOfStars} />
                        <Equal selectedNumbers={selectedNumbers}
                            answereIsCorrect={answereIsCorrect}
                            checkAnswer={this.checkAnswer}
                            usedNumbers={usedNumbers}
                            acceptAnswer={this.acceptAnswer}
                            redraw={this.redraw}
                            lives={lives} 
                            buttonStartState ={buttonStartState}/>
                        <Result selectedNumbers={selectedNumbers}
                            eraseAnswer={this.eraseAnswer} />
                    </div>
                    {statusOfGame ? <StatusOfGame statusOfGame={statusOfGame} resetGame={this.resetGame}></StatusOfGame>
                        :
                        <Numbers selectedNumbers={selectedNumbers}
                            clickNumberEvent={this.clickNumberEvent}
                            usedNumbers={usedNumbers} />
                    }
                    <div id="startGame">
                        <Start timer={timer}
                            startTimer={this.startTimer}
                            buttonStartState={buttonStartState} />
                    </div>
                </div>
            </div>
        )
    }
}

const Start = (props) => {
    return (
        <div>
            <button id='startButton' className={props.buttonStartState} onClick={() => props.startTimer()}>
                <i> Start Game!</i>
            </button>
        </div>
    )
}

const Counter = (props) => {
    return (
        <div id="timer-count" onChange={()=>{props.checkTime()}}> {timeConvertion(props.timer.getMinutes())}:{timeConvertion(props.timer.getSeconds())} </div>
    )
}


const timeConvertion = (props) => {
    if (props < 10)
        return "0" + props.toString();
    else
        return props.toString();
}

const Stars = (props) => {
    let stars = [];
    for (let i = 0; i < props.numberOfStars; i++) {
        stars.push(<i key={i} className="fa fa-star"></i>)
    }
    return (
        <div className="cellDisplay">
            {stars}
        </div>
    )
}

const Equal = (props) => {
    let button;
    const showResultOfAnsware = () => {

        if (props.answereIsCorrect) {
            return button = <button className='btn btn-success btn-lg' onClick={() => props.acceptAnswer()}>
                <i className='fa fa-check'>  </i> </button>

        } else if (props.answereIsCorrect === false) {
            return button = <button className='btn btn-danger btn-lg'>
                <i className='fas fa-times'>  </i>
            </button>

        } else {
            return button = <button className='btn btn-primary btn-lg' onClick={() => props.checkAnswer()}
                disabled={props.selectedNumbers.length === 0 || props.buttonStartState!="invisible"}> = </button>
        }
    }
    return (
        <div className='controlButtons text-center'>
            {showResultOfAnsware()}
            <br />
            <br />
            <button className='btn btn-warning btn-lg' onClick={() => props.redraw()} 
            disabled={props.lives ===0 || props.buttonStartState!="invisible"} > 
                <i className='fas fa-sync-alt'>  </i>
                {props.lives} 
            </button>

        </div>
    )
}

const Result = (props) => {

    return (
        <div className="cellDisplay">
            {props.selectedNumbers.map((num, i) =>
                <span key={i} className='circle-span'
                    onClick={() => props.eraseAnswer(num)} >{num}</span>)}
        </div>
    )
}

const Numbers = (props) => {
    let numbers = _.range(1, 10, 1);
    const checkSelectedNumbers = (num) => {

        if (props.usedNumbers.includes(num)) {
            return 'circle-span used'
        }
        if (props.selectedNumbers.includes(num)) {
            return 'circle-span selected'
        } else {
            return 'circle-span'
        }
    }
    return (
        <div className='card text-center numbers'>
            <div>
                {
                    numbers.map((num, i) =>
                        <span key={i} className={checkSelectedNumbers(num)}
                            onClick={() => props.clickNumberEvent(num)}>
                            {num}
                        </span>)
                }
            </div>
        </div>
    )
}

const StatusOfGame = (props) => {
    return (
        <div>
            <div className='text-center display-4 '>
                {props.statusOfGame}
            </div>
            <div className='text-center'>
                <button className='btn btn-secondary' onClick={() => props.resetGame()}>
                    Play again!</button>
            </div>
        </div>)   
}

export default App;
