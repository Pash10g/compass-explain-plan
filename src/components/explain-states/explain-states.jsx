import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ZeroState, StatusRow, ViewSwitcher } from 'hadron-react-components';
import { TextButton } from 'hadron-react-buttons';
import { ZeroGraphic } from 'components/zero-graphic';
import { ExplainBody } from 'components/explain-body';
import ImportPipeline from '../load-offline/modals/import-pipeline';
import INDEX_TYPES from 'constants/index-types';
import EXPLAIN_STATES from 'constants/explain-states';

import styles from './explain-states.less';

//IgalR
const util = require('util')

/**
 * Readonly warning for the status row.
 */
const READ_ONLY_WARNING = 'Explain plans on readonly views are not supported.';

/**
 * Outdated warning for the status row.
 */
const OUTDATED_WARNING = `The explain content is outdated and no longer in sync
with the documents view. Press "Explain" again to see the explain plan for
the current query.`;

/**
 * Header for zero state.
 */
const HEADER = 'Evaluate the performance of your query';

/**
 * Additional text for zero state.
 */
const SUBTEXT = 'Explain provides key execution metrics that help diagnose slow queries and optimize index usage.';

/**
 * Link to the explain plan documentation.
 */
const DOCUMENTATION_LINK = 'https://docs.mongodb.com/compass/master/query-plan/';

/**
 * The ExplainStates component.
 */
class ExplainStates extends Component {
  static displayName = 'ExplainStatesComponent';

  static propTypes = {
    isEditable: PropTypes.bool.isRequired,
    openLink: PropTypes.func.isRequired,
    explain: PropTypes.shape({
      nReturned: PropTypes.number.isRequired,
      totalKeysExamined: PropTypes.number.isRequired,
      totalDocsExamined: PropTypes.number.isRequired,
      executionTimeMillis: PropTypes.number.isRequired,
      inMemorySort: PropTypes.bool.isRequired,
      indexType: PropTypes.oneOf(INDEX_TYPES).isRequired,
      index: PropTypes.object,
      viewType: PropTypes.string.isRequired,
      rawExplainObject: PropTypes.object.isRequired,
      explainState: PropTypes.string.isRequired,
      error: PropTypes.object,
        
      isImportPipelineOpen: PropTypes.bool.isRequired,
      importPipelineOfflineText: PropTypes.string.isRequired
    }),
    fetchExplainPlan: PropTypes.func.isRequired,
    changeExplainPlanState: PropTypes.func.isRequired,
    openOfflineExplain: PropTypes.func.isRequired,
    closeOfflineExplain: PropTypes.func.isRequired,
    switchToJSONView: PropTypes.func.isRequired,
    query: PropTypes.any,
    treeStages: PropTypes.object.isRequired,
    appRegistry: PropTypes.object.isRequired,
    queryExecuted: PropTypes.func.isRequired,
    importPipelineError: PropTypes.string,
  }

  constructor(props) {
    super(props);
    const appRegistry = props.appRegistry.localAppRegistry;
    this.queryBarRole = appRegistry.getRole('Query.QueryBar')[0];
    this.queryBar = this.queryBarRole.component;
    this.queryBarStore = appRegistry.getStore(this.queryBarRole.storeName);
    this.queryBarActions = appRegistry.getAction(this.queryBarRole.actionName);
  }

  componentDidUpdate() {
    this.props.queryExecuted();
  }

  /**
   * On view switch handler.
   *
   * @param {String} label - The label.
   */
  onViewSwitch(label) {
    if (label === 'Visual Tree') {
      this.props.switchToTreeView();
    } else if (label === 'Raw JSON') {
      this.props.switchToJSONView();
    }
  }

  /**
   * Executes the explain plan.
   */
  onExecuteExplainClicked() {
    this.props.changeExplainPlanState(EXPLAIN_STATES.EXECUTED);
    this.props.fetchExplainPlan(this.queryBarStore.state);
  }

  /**
   * Checks if the zero state window should be displayed.
   *
   * @returns {Boolean}
   */
  checkIfZeroState() {
    return (
      this.props.explain.explainState === EXPLAIN_STATES.INITIAL ||
      !this.props.isEditable
    );
  }

  /**
   * Opens the documentation.
   */
  openDocumentation() {
    this.props.openLink(DOCUMENTATION_LINK);
  }

  /*
   * Opens offline explain modal
   */
  openOfflineExplainInput() {
    console.log('In openOfflineExplainInput');
    console.log(this.props.openOfflineExplain);
    this.props.openOfflineExplain();
  }
  
  /*
   * Close offline explain modal
   */
  closeOfflineExplainInput() {
     this.props.closeOfflineExplain();
  }

  /*
   * Close new offline explain
   */
  createNewOfflineExplain() {
      
  }

  /*
   * Text in import explain offline changed
   */
  offlineExplainTextChanged() {
      console.log("====> TEXT CHANGED: ");
  }
  
  /**
   * Render banner with information.
   *
   * @returns {React.Component} The component.
   */
  renderBanner() {
    if (!this.props.isEditable) {
      return (<StatusRow style="warning">{READ_ONLY_WARNING}</StatusRow>);
    }

    if (this.props.explain.explainState === EXPLAIN_STATES.OUTDATED) {
      return (<StatusRow style="warning">{OUTDATED_WARNING}</StatusRow>);
    }

    if (this.props.explain.error) {
      return (<StatusRow style="error">{this.props.explain.error.message}</StatusRow>);
    }
  }

  /**
   * Render the schema validation component zero state.
   *
   * @returns {React.Component} The component.
   */
  renderZeroState() {
    if (this.checkIfZeroState()) {
      return (
        <div key="zero-state" className={classnames(styles['zero-state-container'])} onDrop={this.onExecuteExplainClicked.bind(this)}>
          <ZeroGraphic />
          <ZeroState header={HEADER} subtext={SUBTEXT} >
            <div className={classnames(styles['zero-state-action'])}>
              <div>
                <TextButton
                  className={`btn btn-primary btn-lg ${
                    !this.props.isEditable ? 'disabled' : ''
                  }`}
                  text="Execute Explain"
                  clickHandler={this.onExecuteExplainClicked.bind(this)} />
              </div>
              <a
                className={classnames(styles['zero-state-link'])}
                onClick={this.openDocumentation.bind(this)}
              >
                Learn more about explain plans
              </a>
            </div>
          </ZeroState>
        </div>
      );
    }
  }

  /**
   * Render ExplainPlan component content.
   *
   * @returns {React.Component} The component.
   */
  renderContent() {
    if (!this.checkIfZeroState()) {
      return (
        <ExplainBody key="explain-body" {...this.props} />
      );
    }
  }

  /**
   * Renders QueryBar component.
   *
   * @returns {React.Component} The component.
   */
  renderQueryBar() {
    return (
      <this.queryBar
        store={this.queryBarStore}
        actions={this.queryBarActions}
        buttonLabel="Explain"
        onApply={this.onExecuteExplainClicked.bind(this)}
        onReset={this.props.changeExplainPlanState.bind(this, EXPLAIN_STATES.INITIAL)}
      />
    );
  }

  /**
   * Renders ViewSwitcher component.
   *
   * @returns {React.Component} The component.
   */
  renderViewSwitcher() {
    const activeViewTypeButton = this.props.explain.viewType === 'tree'
      ? 'Visual Tree'
      : 'Raw JSON';

    return (
      <div>
      <div className="action-bar">
      <TextButton
        className="btn btn-primary btn-xs open-insert"
        dataTestId="open-insert-document-modal-button"
        text="Import Offline Plan"
        tooltipId="document-is-not-writable"
        clickHandler={this.openOfflineExplainInput.bind(this)} />
      </div>
      <div className={classnames(styles['action-bar'])}>
        <ViewSwitcher
          label="View Details As"
          buttonLabels={['Visual Tree', 'Raw JSON']}
          activeButton={activeViewTypeButton}
          disabled={this.checkIfZeroState()}
          onClick={this.onViewSwitch.bind(this)}
        />
        </div>
      </div>
    );
  }

  /**
   * Renders ExplainPlan component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
      
    //IgalR
    console.log("Explain-States: Render - " + util.inspect(this.props));
    
    const importPipelineModal = (
      <ImportPipeline
        isOpen={this.props.explain.isImportPipelineOpen}
        closeImport={this.closeOfflineExplainInput.bind(this)}
        changeText={this.offlineExplainTextChanged.bind(this)}
        createNew={this.createNewOfflineExplain.bind(this)}
        error={this.props.importPipelineError}
        text={this.props.explain.importPipelineOfflineText}
      />
    );
    return (
      [
        <div key="controls-container" className={classnames(styles['controls-container'])}>
          {importPipelineModal}
          {this.renderBanner()}
          {this.renderQueryBar()}
          {this.renderViewSwitcher()}
        </div>,
        this.renderZeroState(),
        this.renderContent()
      ]
    );
  }
}

export default ExplainStates;
