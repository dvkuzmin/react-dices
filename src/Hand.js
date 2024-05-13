import React, {Component} from 'react';
import Cube from './Cube.js';
import DropButton from './DropButton.js';
import Result from './Result.js';
import SaveButton from './SaveButton.js';
import { act } from 'react';

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
        failCounter: 0,
        opponentFails: 0,
        message: null
    }


    componentDidMount() {
        const newSocket = new WebSocket('wss://dices-backend.onrender.com/chat');
  
        newSocket.onopen = () => {
          this.setState({ socket: newSocket});
        }
    
        newSocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.active) {
            data.message = 'Ваш ход'
          }
          else {
            data.message = null;
          };
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
        let { commonResult, playerResult, opponentResult, youWin, message } = this.state;
        message = playerResult + commonResult === 555? 'У вас 555 очков. Счет обнуляется!' : message;
        let updatedPlayerResult = playerResult + commonResult === 555 ? 0 : playerResult + commonResult;
        let opponentMessage = null;
        if (opponentResult === updatedPlayerResult) {
            opponentMessage = 'Противник сбрасывает вас на 100 очков!';
            opponentResult -= 100
        }
        if (updatedPlayerResult === 1000) {
            youWin = true;
        }
        if (updatedPlayerResult > 1000) {
            updatedPlayerResult = commonResult;
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
            active: false,
            message: null
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
            message: opponentMessage,
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
        let {commonResult, dropCounter, failCounter, playerResult, message, active} = this.state;
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
        dropCounter += 1;
        message = active && result === 0 ? message : null;

        if (result === 0) {
            if (failCounter === 2 && dropCounter === 1) {
                failCounter = 0;
                message = '3 болт! Болты списаны'
                if (playerResult - 100 >= 0) {
                    playerResult -= 100;
                    message = '3 болт! Списывается 100 очков!';
                }
            }
            else if (failCounter < 2 && dropCounter === 1) {
                failCounter += 1;
                message = 'Болт!';
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
        message = isFullHouse && newValues.length > 1 ? 'Фулл Хаус!' : message;
        message = result !== 0 && !isFullHouse ? 'Ваш ход' : message;
        message = result === 0 && message !== 'Болт!' && message !== '3 болт! Списывается 100 очков!'? 'Ход соперника' : message;
        
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
            failCounter: failCounter,
            message: message
        })

        this.state.socket.send(JSON.stringify({
            values: oppnentValues,
            // result: result,
            selectedCubesIdx: [],
            opponentTmpResult: commonResult,
            opponentResult: playerResult,
            cubeClass: 'inactive-cube',
            // isFullHouse: isFullHouse,
            opponentFails: failCounter,
            active: !playerStatus}))
    }


    selectCube = (idx) => {
        let {message} = this.state;
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
                commonResult: updatedResult,
                // message: null
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
                        commonResult: updatedResult,
                        // message: null
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
            let { values, selectedCubesIdx, commonResult, result,
                 playerResult, youWin, active, dropCounter,
                  failCounter, opponentFails, message } = this.state;
            let isValidChoice = this.checkValidChoice();
            message = !active && !message ? 'Ход соперника' : message;
            let cubes = values.map((value, index) => (
            <Cube
                className={`cube${index}`}
                key={index} 
                value={value}
                selectCube={active ? () => this.selectCube(index): null}   
                bg={selectedCubesIdx.includes(index) ? `${this.state.cubeClass}  cube${index}` : `inactive-cube cube${index}`}
            />
            ));
        
            return (
            <div className='playground'>
                {this.state.active ? <div className='result'>{commonResult}</div> : null}
                {!this.state.active ? <div className='result'>{this.state.opponentTmpResult}</div> : null}
                {cubes}
                {!youWin && this.state.active && (
                (values.length > selectedCubesIdx.length && isValidChoice) ||
                this.state.isFullHouse ||
                dropCounter === 0
                ) ? (
                    <DropButton drop={this.drop} />
                ) : null}
                {result !== 0 && (
                    (playerResult === 0 && commonResult >= 100) ||
                    (playerResult >= 100 && playerResult < 400) ||
                    (playerResult >= 400 && playerResult + commonResult >= 500)
                ) ? <SaveButton save={this.save} /> : null}
                <div className='message'>{message}</div>
                <div className='result-header player-header'>ВЫ</div>
                <div className='result-header opponent-header'>СОПЕРНИК</div>
                <div className='player-score score'>ОЧКИ:  {this.state.playerResult}</div>
                <div className='player-fails score'>БОЛТЫ: {failCounter}</div>
                <div className='opponent-score score'>ОЧКИ:  {this.state.opponentResult}</div>
                <div className='opponent-fails score'>БОЛТЫ: {opponentFails}</div>
                {youWin ? <div> You Win!!!</div>: null}
            </div>
            );
        }
        }

export default Hand;
