import React, {Component} from 'react';


function DropButton(props) {
    return (
        <button className='boardGameButton' onClick={props.drop}>Drop the cubes</button>
    )
}

export default DropButton;
