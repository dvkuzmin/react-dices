import React, {Component} from 'react';


function DropButton(props) {
    return (
        <button className='drop_button button' onClick={props.drop}>Бросить кубики</button>
    )
}

export default DropButton;
