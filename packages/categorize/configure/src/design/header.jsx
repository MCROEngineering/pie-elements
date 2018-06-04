import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { AddButton } from './buttons';

export class Header extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    onAdd: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
  };

  static defaultProps = {};
  render() {
    const { classes, className, onAdd, label } = this.props;
    return (
      <div className={classNames(classes.header, className)}>
        <Typography variant="title" className={classes.title}>
          {label}
        </Typography>
        <AddButton onClick={onAdd} />
      </div>
    );
  }
}
const styles = theme => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.unit
  }
});
export default withStyles(styles)(Header);
