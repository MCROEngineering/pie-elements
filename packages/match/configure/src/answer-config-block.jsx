import * as React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import AddRow from './add-row';
import Row from './row';
import { swap, withDragContext } from '@pie-lib/drag';
import debug from 'debug';
import lodash from 'lodash';
import EditableHTML, { DEFAULT_PLUGINS } from '@pie-lib/editable-html';

const log = debug('pie-elements:match:configure');

const styles = theme => ({
  container: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column'
  },
  rowContainer: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  rowItem: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    '&> div': {
      width: '150px',
      padding: '12px',
      textAlign: 'center'
    },
  },
  deleteIcon: {
    flex: 0.5,
    minWidth: '88px'
  },
  questionText: {
    flex: 2,
    display: 'flex',
    justifyContent: 'flex-start',
    '&> div': {
      width: '100%',
      padding: 0,
      maxWidth: 'unset',
      textAlign: 'left',
      minWidth: '350px'
    }
  },
  rowTable: {
    display: 'flex',
    flexDirection: 'column'
  },
  separator: {
    marginTop: theme.spacing.unit * 2,
    border: 0,
    borderTop: '2px solid lightgray',
    width: '100%'
  },
  headerInput: {
    '&> div': {
      fontWeight: 'bold'
    }
  }
});

class AnswerConfigBlock extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteRow: PropTypes.func.isRequired,
    onAddRow: PropTypes.func.isRequired,
    imageSupport: PropTypes.shape({
      add: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    })
  };

  moveRow = (from, to) => {
    const { model, onChange } = this.props;
    const newModel = { ...model };
    const rows = newModel.rows;

    log('[moveRow]: ', from, to);

    const update = swap(rows, from, to);

    log('update: ', update);

    newModel.rows = update;

    onChange(newModel);
  };

  onChange = (name, isBoolean) => ({ target }) => {
    const { model, onChange } = this.props;
    let value;

    if (isBoolean) {
      value = target.checked;
    } else {
      value = target.value;
    }

    lodash.set(model, name, value);
    onChange(model, name);
  };

  onHeaderChange = headerIndex => value => {
    const { model, onChange } = this.props;
    const newModel = { ...model };

    newModel.headers[headerIndex] = value;

    onChange(newModel);
  };

  render() {
    const {
      classes,
      model,
      onAddRow,
      imageSupport,
      configuration
    } = this.props;
    const { headers = {} } = configuration || {};

    const filteredDefaultPlugins = (DEFAULT_PLUGINS || [])
      .filter(p => p !== 'table' && p !== 'bulleted-list' && p !== 'numbered-list');
    const labelPlugins = {
      audio: { disabled: true },
      video: { disabled: true }
    };

    return (
      <div className={classes.container}>
        <Typography type="body1" component="div">
          Click on the labels to edit or remove. Set the correct answers by
          clicking each correct answer per row.
        </Typography>
        <div className={classes.rowTable}>
          <div className={classes.rowContainer}>
            {headers.settings &&
            (model.headers || []).map((header, idx) => (
                <div
                  key={idx}
                  className={cx(classes.rowItem, {
                    [classes.questionText]: idx === 0
                  })}
                >
                  <EditableHTML
                    onChange={this.onHeaderChange(idx)}
                    markup={header}
                    className={classes.headerInput}
                    label={'column label'}
                    activePlugins={filteredDefaultPlugins}
                    pluginProps={labelPlugins}
                    autoWidthToolbar
                  />
                </div>
              ))}
            <div className={classes.deleteIcon}>
              <Button disabled>
                <div />
              </Button>
            </div>
          </div>
          <hr className={classes.separator} />
          {model.rows.map((row, idx) => (
            <Row
              key={idx}
              model={model}
              row={row}
              idx={idx}
              onDeleteRow={this.props.onDeleteRow}
              onChange={this.props.onChange}
              onMoveRow={this.moveRow}
              imageSupport={imageSupport}
              enableImages={model.enableImages}
            />
          ))}
          <AddRow onAddClick={onAddRow} />
        </div>
      </div>
    );
  }
}

export default withDragContext(withStyles(styles)(AnswerConfigBlock));
