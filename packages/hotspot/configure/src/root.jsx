import Main from './main';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import { choiceUtils as utils } from '@pie-lib/config-ui';

class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      model: props.model,
      disableSidePanel: props.disableSidePanel
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
    const { disableSidePanel } = props;
    const { disableSidePanel: oldDisableProp } = this.props;

    if (disableSidePanel !== oldDisableProp) {
      this.setState({
        disableSidePanel
      });
    }
  }

  onRemoveShape = index => {
    const { model } = this.state;
    model.choices.splice(index, 1);
    this.updateModel(model);
  };

  modelChanged = (reset) => {
    this.props.onModelChanged(this.state.model, reset);
  };

  updateModel = (model, reset) => {
    this.setState({ model }, () => {
      this.modelChanged(reset);
    });
  };

  onCreateShape = () => {
    const { model } = this.state;
    model.choices.push({
      label: 'label',
      value: utils.firstAvailableIndex(model.choices.map(c => c.value), 0),
      feedback: {
        type: 'none'
      }
    });
    this.updateModel(model);
  };

  onPromptChanged = prompt => {
    const update = cloneDeep(this.state.model);
    update.prompt = prompt;
    this.updateModel(update);
  };

  onPartialScoringChanged = () => {
    const { model } = this.state;
    model.partialScoring = !model.partialScoring;
    this.updateModel(model);
  };

  onMultipleCorrectChanged = () => {
    const { model } = this.state;
    model.multipleCorrect = !model.multipleCorrect;
    model.shapes = model.shapes.map(shape => ({ ...shape, correct: false }));
    this.updateModel(model);
  };

  handleOnUpdateShapes = (shapes, mouseOver = false) => {
    const { model } = this.state;
    model.shapes = shapes;
    this.updateModel(model);
  };

  handleOnImageUpload = imageUrl => {
    const { model } = this.state;
    model.imageUrl = imageUrl;

    this.updateModel(model);
  };

  render() {
    const props = {
      model: this.state.model,
      configure: this.props.configure,
      disableSidePanel: this.state.disableSidePanel,
      onRemoveShape: this.onRemoveShape,
      onCreateShape: this.onCreateShape,
      onImageUpload: this.handleOnImageUpload,
      onPromptChanged: this.onPromptChanged,
      onUpdateShapes: this.handleOnUpdateShapes,
      onPartialScoringChanged: this.onPartialScoringChanged,
      onMultipleCorrectChanged: this.onMultipleCorrectChanged,
    };

    return <Main {...props} />;
  }
}

Root.propTypes = {
  configure: PropTypes.object,
  disableSidePanel: PropTypes.bool,
  model: PropTypes.object.isRequired,
  onModelChanged: PropTypes.func.isRequired
};

export default Root;
