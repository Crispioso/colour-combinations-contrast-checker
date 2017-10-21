import Component from 'inferno-component';
import uuid from 'uuid/v4';
import contrast from 'get-contrast';

import './registerServiceWorker';
import './App.css';
import Input from './components/Input'

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inputs: [
        {
          error: "",
          value: "",
          id: uuid()
        }
      ],
      error: "",
      failures: null
    }
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRemoveInput = this.handleRemoveInput.bind(this);
    this.addColour = this.addColour.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.failures && this.state.failures.length > 0) {
      this.setState({failures: []});
    }

    const inputIsHexCode = this.state.inputs.some(input => {
      return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input.value);
    })

    if (!inputIsHexCode) {
      this.setState({
        error: "One or more of the inputs isn't a valid hex code"
      });

      const inputs = this.state.inputs.map(input => {
        if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input.value)) {
          return input;
        }
        return {
          ...input,
          error: "Invalid hex code"
        }
      });

      this.setState({inputs});
      return;
    }

    if (this.state.inputs.length <= 1) {
      this.setState({
        error: "Only one colour submitted. You need at least two to check contrast!"
      });
      return;
    }

    const failures = [];
    for (const input of this.state.inputs) {
      for (const secondInput of this.state.inputs) {
        if (input.id === secondInput.id) {
          continue;
        }
        if (contrast.isAccessible(input.value, secondInput.value)) {
          continue;
        }
        const failureAlreadyStored = failures.some(failure => {
          return (
            ((failure.colours[0] === secondInput.value) || (failure.colours[0] === input.value))
            && 
            ((failure.colours[1] === secondInput.value) || (failure.colours[1] === input.value))
          )
        });
        if (failureAlreadyStored) {
          continue;
        }
        failures.push({
          colours: [input.value, secondInput.value],
          score: contrast.score(input.value, secondInput.value),
          ratio: contrast.ratio(input.value, secondInput.value)
        });
      }
    }
    this.setState({failures});
  }

  handleInputChange(id, value) {
    const inputs = this.state.inputs.map(input => {
      if (input.id !== id) {
        return input;
      }
      return {
        ...input,
        error: "",
        value
      }
    });

    this.setState({inputs});
  }

  addColour() {
    const inputs = [
      ...this.state.inputs,
      {
        value: "",
        error: "",
        id: uuid()
      }
    ]
    this.setState({inputs});
  }

  handleRemoveInput(id) {
    const inputs = this.state.inputs.filter(input => {
      if (input.id === id) {
        return false;
      }
      return true;
    });

    this.setState({inputs});
  }

  renderFailures() {
    return (
      <div>
        <h2>Failed combinations:</h2>
        <ol>
          {this.state.failures.map(failure => {
            return (
              <li>
                Colours: {failure.colours.join(", ")}
                <br/>
                Rating: {failure.score}
                <br/>
                Ratio: {failure.ratio}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  renderInputs() {
    return this.state.inputs.map((input, index) => {
      return (
        <Input 
          id={input.id} 
          value={input.value} 
          error={input.error} 
          onChange={this.handleInputChange}
          onRemoveClick={this.handleRemoveInput}
          label={`Colour ${index+1}`}
        />
      )
    });
  }

  render() {
    return (
      <div>
        <h1>Check colour combination contrasts</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="inputs">
            {this.renderInputs()}
            {this.state.error &&
              <p className="inputs__error">
                {this.state.error}
              </p>
            }
            <button className="button button--plain" type="button" onClick={this.addColour}>
              Add {this.state.inputs.length >= 1 ? "another" : "a"} colour
            </button>   
          </div>
          <div>
            <button className="button" type="submit">Check contrasts</button>
          </div>
        </form>
        {(this.state.failures && this.state.failures.length > 0) &&
          this.renderFailures()
        }
        {(this.state.failures && this.state.failures.length === 0) &&
          <p>Congratulations,all of these colour combinations are accessible </p>
        }
      </div>
    );
  }
}

export default App;
