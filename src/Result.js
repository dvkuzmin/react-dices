import React, {Component} from 'react';

class Result extends Component {
    render() {
        return (
            <p className='result'>Result: {this.props.value}</p>
        )
    }
}

export default Result;
