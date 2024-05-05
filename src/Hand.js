import React, {Component} from 'react';
import Cube from './Cube.js';
import DropButton from './DropButton.js';
import Result from './Result.js';
import SaveButton from './SaveButton.js';

function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}


class Hand extends Component {
    state = {
        values: [],
        result: 0,
        selectedCubesIdx: [],
        selectedCubesBackground: 'white',
        commonResult: 0,
        tmpResult: 0,
        isFullHouse: false,
        playerResult: 0,
        opponentResult: 0,
        opponentCommonResult: 0,
        opponentTmpResult: 0,
        active: false,
        opponentActive: false,
        youWin: false,
        dropCounter: 0,
        failCounter: 0
    }


    componentDidMount() {
        const newSocket = new WebSocket('wss://dices-backend.onrender.com/chat');
  
        newSocket.onopen = () => {
          this.setState({ socket: newSocket});
        }
    
        newSocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          this.setState(data);
        };
        }
    
      componentWillUnmount() {
        const { socket } = this.state;
        if (socket) {
          socket.close();
        }
      }


    count = (values) => {
        let checkedValues = [];
        let result = 0;
        for (let i = 0; i < values.length; i++) {
            if (checkedValues.includes(values[i])) {
                continue;
            }
            else {
                checkedValues.push(values[i]);
                let counter = 0;
                let realValue = 0;
                for (let j = 0; j < values.length; j++) {
                    if (values[i] === values[j]) {
                        counter += 1;
                    }
                }
                let multiplier = 1;
                realValue = values[i] === 1? 10 : values[i];
                if (counter === 3) {
                    multiplier = 10;
                    result += realValue * multiplier;
                }
                else if (counter === 4) {
                    multiplier = 20;
                    result += realValue * multiplier;
                }
                else if (counter === 5) {
                    multiplier = 30;
                    result += realValue * multiplier;
                }
                else if (realValue === 10 || realValue === 5) {
                    result += realValue * counter;  
                }
            }
        }
    return result;
    }

    save = () => {
        let { commonResult, playerResult, opponentResult } = this.state;
        let updatedPlayerResult = playerResult + commonResult === 555 ? 0 : playerResult + commonResult;
        if (opponentResult === updatedPlayerResult) {
            opponentResult -= 100
        }
        this.setState({
            values: [],
            result: 0,
            selectedCubesIdx: [],
            cubeClass: 'inactive-cube',
            commonResult: 0,
            tmpResult: 0,
            isFullHouse: false,
            playerResult: updatedPlayerResult,
            dropCounter: 0,
            active: false
        });
        this.state.socket.send(JSON.stringify({
            values: [],
            result: 0,
            selectedCubesIdx: [],
            cubeClass: 'inactive-cube',
            opponentCommonResult: 0,
            opponentTmpResult: 0,
            playerResult: opponentResult,
            isFullHouse: false,
            opponentResult: updatedPlayerResult,
            active: true}))
    }

    isFullHouse(arrValues) {
        if (this.count(arrValues) === 0) {
            return false
        }
        for (let i = 0; i < arrValues.length; i ++) {
            if (arrValues[i] !== 1 && arrValues[i] !== 5) {
                let counter = 0;
                for (let j = 0; j < arrValues.length; j ++) {
                    if (arrValues[j] === arrValues[i]) {
                        counter += 1;
                    }
                }
                if (counter < 2) {
                    return false;
                }
                    }
                }
        return true;
    }

    drop = () => {
        let {commonResult, dropCounter, failCounter, playerResult} = this.state;
        let youWin = false;
        let cubesNumber = this.state.selectedCubesIdx.length > 0 ? this.state.selectedCubesIdx.length : 5;
        let newValues = [];
        let result = 0;
        let playerStatus = true;
        let oppnentValues = [];
        for (let i=0; i < cubesNumber; i++) {
            newValues.push(getRandomInt(6));
        }
        result = this.count(newValues);
        oppnentValues = newValues;
        dropCounter += 1
        // if (result === 0 && failCounter === 2 && dropCounter === 1) {
        //     commonResult = 0;
        //     failCounter = 0;
        //     playerResult -= 100;
        //     playerStatus = false;
        //     oppnentValues = [];
        //     dropCounter = 0
        // }
        // if (result === 0 && failCounter < 2 && dropCounter === 1) {
        //     commonResult = 0;
        //     failCounter += 1;
        //     playerStatus = false;
        //     oppnentValues = [];
        //     dropCounter = 0
        // }
        // if (result === 0 || (playerResult + result + commonResult) > 1000) {
        //     commonResult = 0;
        //     playerStatus = false;
        //     oppnentValues = [];
        //     dropCounter = 0
        // }
        if (result === 0) {
            if (failCounter === 2 && dropCounter === 1) {
                failCounter = 0;
                playerResult -= 100;
            }
            else if (failCounter < 2 && dropCounter === 1) {
                failCounter += 1;
            }
            commonResult = 0;
            playerStatus = false;
            oppnentValues = [];
            dropCounter = 0;
        }

        else {
            if ((result + commonResult + playerResult) > 1000) {
                newValues.forEach(element => {
                    if (element === 1 || element === 5) { 
                        if (element === 1) {
                            element = 10;
                        };
                    if ((element + commonResult + playerResult) < 1000) {
                    }
                    else {
                        result = 0;
                        commonResult = 0;
                        playerStatus = false;
                        oppnentValues = [];
                        dropCounter = 0;
                    }
                    
                }
            });
            }
        }

        if ((result + commonResult + playerResult) === 1000) {
            youWin = true;
        }
        let isFullHouse = this.isFullHouse(newValues);
        
        this.setState({
            values: newValues,
            result: result,
            selectedCubesIdx: [],
            tmpResult: commonResult,
            commonResult: commonResult += result,
            cubeClass: 'inactive-cube',
            isFullHouse: isFullHouse,
            active: playerStatus,
            youWin: youWin,
            dropCounter: dropCounter,
            playerResult: playerResult,
            failCounter: failCounter
        })

        this.state.socket.send(JSON.stringify({
            values: oppnentValues,
            // result: result,
            selectedCubesIdx: [],
            opponentTmpResult: commonResult,
            opponentResult: playerResult,
            cubeClass: 'inactive-cube',
            isFullHouse: isFullHouse,
            active: !playerStatus}))
    }


    selectCube = (idx) => {
        if (this.state.values.length > 1 && this.state.result !== 0) {
        if (!this.state.selectedCubesIdx.includes(idx)) {
        this.setState(
          (prevState) => ({
            selectedCubesIdx: [...prevState.selectedCubesIdx, idx],
          }),
          () => {
            let validChoice = this.checkValidChoice();
            let newcubeClass = validChoice &&
                               this.state.selectedCubesIdx.length < this.state.values.length ?
                               'correct-cube': 'incorrect-cube'
            this.setState({
                cubeClass: newcubeClass
            });
            let {selectedCubesIdx, tmpResult} = this.state;
            let cubesOnTable = this.state.values.filter((item, index) => !selectedCubesIdx.includes(index));
            let cubesOnTableResult = this.count(cubesOnTable);
            let updatedResult = tmpResult + cubesOnTableResult;
            this.setState({
                commonResult: updatedResult
            });
            this.state.socket.send(JSON.stringify({
                cubeClass: newcubeClass,
                opponentTmpResult: updatedResult,
                selectedCubesIdx: selectedCubesIdx}))
          }
        )
    }
        else {
            this.setState(
                (prevState) => ({
                    selectedCubesIdx: prevState.selectedCubesIdx.filter(index => idx !== index)
                }),
                () => {
                    let {tmpResult, selectedCubesIdx} = this.state;

                    let validChoice = this.checkValidChoice();
                    let newcubeClass = validChoice &&
                    this.state.selectedCubesIdx.length < this.state.values.length ?
                    'correct-cube': 'incorrect-cube'
                    this.setState({cubeClass: newcubeClass});
                    let cubesOnTable = this.state.values.filter((item, index) => !selectedCubesIdx.includes(index));
                    let cubesOnTableResult = this.count(cubesOnTable);
                    let updatedResult = tmpResult + cubesOnTableResult;
                    this.setState({
                        commonResult: updatedResult
                    })
                    this.state.socket.send(JSON.stringify({
                        cubeClass: newcubeClass,
                        opponentTmpResult: updatedResult,
                        selectedCubesIdx: selectedCubesIdx}))
                }
            );
            }
        }
    }
            

    checkValidChoice = () => {
        let {selectedCubesIdx} = this.state;
        if (selectedCubesIdx.length > 0) {
        let cubesOnTable = this.state.values.filter((item, index) => !selectedCubesIdx.includes(index));
        for (let i = 0; i < cubesOnTable.length; i++) {
            if (cubesOnTable[i] === 1 || cubesOnTable[i] === 5) {
                continue
            } 
            else {
                let counter = 0;
                for (let j = 0; j < cubesOnTable.length; j++) {
                    if (cubesOnTable[i] === cubesOnTable[j]) {
                        counter += 1;
                    } 
                }
                if (counter > 2) {
                    continue;
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
    }

    render() {
        let { values, selectedCubesIdx, commonResult, result, playerResult, youWin, active, dropCounter, failCounter } = this.state;
        let isValidChoice = this.checkValidChoice();
        console.log(result);
        let cubes = values.map((value, index) => (
          <Cube
            className='cube'
            key={index}
            value={value}
            selectCube={active ? () => this.selectCube(index): null}   
            bg={selectedCubesIdx.includes(index) ? this.state.cubeClass : 'inactive-cube'}
          />
        ));
      
        return (
          <div className='playground'>
            <div className='cubes'>{cubes}</div>
            <div className='buttons'>
            {!youWin && this.state.active && (
            (values.length > selectedCubesIdx.length && isValidChoice) ||
            this.state.isFullHouse ||
            dropCounter === 0
            ) ? (
                <div className='dropbutton'><DropButton drop={this.drop} /></div>
              ) : null}
              {result !== 0 && (
                (playerResult === 0 && commonResult >= 100) ||
                (playerResult >= 100 && playerResult < 400) ||
                (playerResult >= 400 && playerResult + commonResult >= 500)
              ) ? <SaveButton className='boardGameButton' save={this.save} /> : null}
              
            </div>
            {/* {this.state.commonResult === 0 ?
            <div className='dropbutton'><DropButton drop={this.drop} /></div> : null} */}
            <div className='info'>
            {this.state.isFullHouse ?<div className='full-house'>Full House!!! Drop 5 or choose!</div>: null}
            <div className='score-board'>
            <Result value={commonResult} />
            <p className='result'>PLayer Score:  {this.state.playerResult}</p>
            <p>Fails: {failCounter}</p>
            <p className='result'>Opponent result:  {this.state.opponentTmpResult}</p>
            <p className='result'>Opponent Score:  {this.state.opponentResult}</p>
            {youWin ? <div> You Win!!!</div>: null}
            </div>
            </div>
          </div>
        );
      }
    }

export default Hand;
