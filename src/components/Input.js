import Component from 'inferno-component';
import 'inferno-devtools';

export default class Input extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    componentWillMount() {
        if (this.props.value) {
            this.setState({value: this.props.value});
        }
    }

    handleChange(event) {
        const value = event.target.value;
        this.setState({value});
        this.props.onChange(this.props.id, value);
    }

    handleRemove() {
        this.props.onRemoveClick(this.props.id);
    }

    render() {
        return (
            <div className="input">
                <label htmlFor={this.props.id}>
                    {this.props.label}
                </label>
                <input
                    type="text"
                    onChange={this.handleChange}
                    id={this.props.id}
                />
                <button className="button button--plain" type="button" onClick={this.handleRemove}>Remove</button>
            </div>
        )
    }
}