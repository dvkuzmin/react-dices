import React, {useEffect, useState} from 'react';
import cube1 from './Dice1.png';
import cube2 from './Dice2.png';
import cube3 from './Dice3.png';
import cube4 from './Dice4.png';
import cube5 from  './Dice5.png';
import cube6 from './Dice6.png';
// import getRandomInt from './Hand.js'; 


// class Cube extends Component {

//   render() {
//     const cubes = {
//       1: cube1,
//       2: cube2,
//       3: cube3,
//       4: cube4,
//       5: cube5,
//       6: cube6,
//     }

//     let cubeStyle = {
//         background: this.props.bg
//     }


//     return (
//         <div style={cubeStyle} onClick={this.props.selectCube}>
//           <img src={cubes[this.props.value]}/>
//           </div>
//     )
//   }
// }

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

const Cube = (props) => {
  const [cubeValue, setCubeValue] = useState();
  const cubes = {
    1: cube1,
    2: cube2,
    3: cube3,
    4: cube4,
    5: cube5,
    6: cube6,
  }

  let cubeStyle = {
      background: props.bg
  }
  
  useEffect(() => {
    const animationDuration = 500;
    const framesPerSecond = 15;
    const totalFrames = (animationDuration / 1000) * framesPerSecond;
    let currentFrame = 0;

    const intervalId = setInterval(() => {
      const newCubeValue = getRandomInt(6);
      setCubeValue(newCubeValue);

      currentFrame += 1;

      if (currentFrame >= totalFrames) {
        setCubeValue(null);
        clearInterval(intervalId);
      }
    }, 1000 / framesPerSecond);
  
    return () => clearInterval(intervalId);
  }, [props.value]);

  return (
            <div className={props.bg} onClick={props.selectCube}>
          <img src={cubes[cubeValue || props.value]}/>
          </div>
    )

}


export default Cube;
