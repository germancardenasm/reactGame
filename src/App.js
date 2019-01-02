import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';

var possibleCombinationSum = function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount ; i++ ) {
      var combinationSum = 0;
      for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  };

class App extends Component{
    render(){
        return(
            <div>
                <Game />
            </div>
        )
    }
}

class Game extends Component{
    static createRandomNumerOfStars = () =>  1 + Math.floor(Math.random()*9);
    static initialState = () =>( 
    {
        selectedNumbers: [],
        numberOfStars: Game.createRandomNumerOfStars(),
        answereIsCorrect: null,
        usedNumbers: [],
        lives: 5,
        statusOfGame: ''
    });

    state = Game.initialState();
    
    clickNumberEvent = (numberSelected)=>{
        if(this.state.usedNumbers.includes(numberSelected)) return;
        if(this.state.selectedNumbers.includes(numberSelected)) return;
        this.setState( prevState =>({
            selectedNumbers: prevState.selectedNumbers.concat(numberSelected),
            answereIsCorrect: null}
        ))
    }

    eraseAnswer = (numberToErase) => {
            this.setState( prevState => (
                {selectedNumbers: prevState.selectedNumbers.filter((num)=>num!==numberToErase),
                 answereIsCorrect: null}
            ))      
    }

    acceptAnswer = () => {
        this.setState( prevState =>({
            usedNumbers: prevState.usedNumbers.concat(this.state.selectedNumbers),
            numberOfStars: Game.createRandomNumerOfStars(),
            selectedNumbers: [],
            answereIsCorrect: null,
        }), this.setStatusGame )
    }
        
    checkAnswer = () => {
        this.setState( prevState => ({
                answereIsCorrect: 
                this.state.selectedNumbers.reduce( (prev, acc) => prev + acc) === this.state.numberOfStars
        }))
    }

    redraw = () => {
        if(this.state.lives===0) return
        this.setState( prevState => ({
            numberOfStars: Game.createRandomNumerOfStars(),
            selectedNumbers: [],
            answereIsCorrect: null,
            lives: prevState.lives-1,
        }), this.setStatusGame)
    }
    
    setStatusGame = () => {

        this.setState( prevState=>{
                if(prevState.usedNumbers.length === 9)
                    return {statusOfGame: "You won the Game!"}
                 else if(prevState.lives===0 && !this.possibleSolution(prevState))
                    return {statusOfGame: "Game Over!"}
            })
    }
   
    possibleSolution = ({numberOfStars, usedNumbers}) => {
        const possibleNumbers = _.range(1,10).filter((num)=>
            usedNumbers.indexOf(num) === -1)
        return possibleCombinationSum(possibleNumbers, numberOfStars)
    }

    resetGame = () => this.setState(Game.initialState())

    render(){
        const {selectedNumbers, numberOfStars, answereIsCorrect, usedNumbers, lives, statusOfGame} = this.state;
        return(
         <div className="container">
            <h1>PLAY NINE</h1>
            <hr />
            <div className="row">
                <Stars numberOfStars={numberOfStars}/>
                <Equal selectedNumbers={selectedNumbers}
                       answereIsCorrect={answereIsCorrect}
                       checkAnswer={this.checkAnswer}
                       usedNumbers={usedNumbers}
                       acceptAnswer={this.acceptAnswer}
                       redraw={this.redraw}
                       lives={lives}/>
                <Result selectedNumbers={selectedNumbers}
                        eraseAnswer={this.eraseAnswer}/> 
            </div>
            {statusOfGame ? <StatusOfGame statusOfGame={statusOfGame} resetGame={this.resetGame}></StatusOfGame>
                            :
                            <Numbers selectedNumbers={selectedNumbers}
                            clickNumberEvent={this.clickNumberEvent}
                            usedNumbers={usedNumbers}/>
            }

         </div>
        )
    }
}

const Stars = (props)=>{
  let stars = [];
  for(let i=0; i<props.numberOfStars; i++){
    stars.push(<i key={i} className="fa fa-star"></i>)
  }
  return(
    <div className="col-md-5">
      {stars}
    </div>
  )
}

const Equal = (props) =>{
    let button;
    const showResultOfAnsware = ()=>{
        
         if (props.answereIsCorrect)
        {
            return button  =<button className='btn btn-success ' onClick={()=>props.acceptAnswer()}>
                            <i className='fa fa-check'>  </i> </button>
            
        } else if(props.answereIsCorrect===false){
            return button  =<button className='btn btn-danger'> 
                            <i className='fas fa-times'>  </i>
                            </button>
            
        } else{
            return button  = <button className='btn btn-primary btn-lg'  onClick={()=>props.checkAnswer()} 
                             disabled={props.selectedNumbers.length === 0}> = </button>
        } 
      }
    return(
        <div className='col-md-2 text-center'>
            {showResultOfAnsware()}
            <br />
            <br />
            <button className='btn btn-warning btn-sm' onClick={()=>props.redraw()} disabled={props.lives===0}>
             <i className = 'fas fa-sync-alt'> {props.lives}  </i> 
            </button>
     
        </div>
    )
}

const Result = (props) =>{

    return(
        <div className="col-md-5">
            {props.selectedNumbers.map( (num, i)=>
            <span key={i} className = 'circle-span' 
                 onClick={()=> props.eraseAnswer(num)} >{num}</span> )}
        </div>
    )
}

const Numbers = (props) =>{
  let numbers = _.range(1,10,1);
  console.log(props);
  const checkSelectedNumbers = (num)=>{

    if(props.usedNumbers.includes(num))
    {
        return 'circle-span used'
    }
    if(props.selectedNumbers.includes(num))
    {
        return 'circle-span selected'
    }else{
        return 'circle-span'
    }
  }
  return(
    <div className='card text-center numbers'>
        <div>
            {
                numbers.map((num, i)=>
                <span key={i} className={checkSelectedNumbers(num)} 
                onClick={() => props.clickNumberEvent(num)}>
                    {num}
                </span> )
            }
        </div>
    </div>
  )
}

const StatusOfGame = (props)=>{
    return(
    <div>
        <div className='text-center display-4 '> 
            {props.statusOfGame}
        </div>
        <div className='text-center '> 
            <button className = 'btn btn-secondary' onClick={()=>props.resetGame()}>
            Play again!</button>
        </div>
    </div>)
}

export default App;
