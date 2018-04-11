import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import AddButton from 'material-ui-icons/Add';

export class AddPointButton extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    onAddClick: PropTypes.func.isRequired,
  };

  render() {
    const { classes, onAddClick } = this.props;

    return (<div>
      <Button
        className={classes.button}
        disabled={false}
        onClick={onAddClick} >
        <AddButton />
        Add Another Point
      </Button>
    </div>);
  }
}

const styles = (theme) => ({
  button: {
    margin: 0,
    'margin-bottom': theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(AddPointButton);
