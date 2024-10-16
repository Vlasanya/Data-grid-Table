"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridAggregation = exports.aggregationStateInitializer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _gridAggregationSelectors = require("./gridAggregationSelectors");
var _gridAggregationUtils = require("./gridAggregationUtils");
var _createAggregationLookup = require("./createAggregationLookup");
const aggregationStateInitializer = (state, props, apiRef) => {
  apiRef.current.caches.aggregation = {
    rulesOnLastColumnHydration: {},
    rulesOnLastRowHydration: {}
  };
  return (0, _extends2.default)({}, state, {
    aggregation: {
      model: props.aggregationModel ?? props.initialState?.aggregation?.model ?? {}
    }
  });
};
exports.aggregationStateInitializer = aggregationStateInitializer;
const useGridAggregation = (apiRef, props) => {
  apiRef.current.registerControlState({
    stateId: 'aggregation',
    propModel: props.aggregationModel,
    propOnChange: props.onAggregationModelChange,
    stateSelector: _gridAggregationSelectors.gridAggregationModelSelector,
    changeEvent: 'aggregationModelChange'
  });

  /**
   * API METHODS
   */
  const setAggregationModel = React.useCallback(model => {
    const currentModel = (0, _gridAggregationSelectors.gridAggregationModelSelector)(apiRef);
    if (currentModel !== model) {
      apiRef.current.setState((0, _gridAggregationUtils.mergeStateWithAggregationModel)(model));
      apiRef.current.forceUpdate();
    }
  }, [apiRef]);
  const applyAggregation = React.useCallback(() => {
    const aggregationLookup = (0, _createAggregationLookup.createAggregationLookup)({
      apiRef,
      getAggregationPosition: props.getAggregationPosition,
      aggregationFunctions: props.aggregationFunctions,
      aggregationRowsScope: props.aggregationRowsScope
    });
    apiRef.current.setState(state => (0, _extends2.default)({}, state, {
      aggregation: (0, _extends2.default)({}, state.aggregation, {
        lookup: aggregationLookup
      })
    }));
  }, [apiRef, props.getAggregationPosition, props.aggregationFunctions, props.aggregationRowsScope]);
  const aggregationApi = {
    setAggregationModel
  };
  (0, _xDataGridPro.useGridApiMethod)(apiRef, aggregationApi, 'public');

  /**
   * EVENTS
   */
  const checkAggregationRulesDiff = React.useCallback(() => {
    const {
      rulesOnLastRowHydration,
      rulesOnLastColumnHydration
    } = apiRef.current.caches.aggregation;
    const aggregationRules = props.disableAggregation ? {} : (0, _gridAggregationUtils.getAggregationRules)({
      columnsLookup: (0, _xDataGridPro.gridColumnLookupSelector)(apiRef),
      aggregationModel: (0, _gridAggregationSelectors.gridAggregationModelSelector)(apiRef),
      aggregationFunctions: props.aggregationFunctions
    });

    // Re-apply the row hydration to add / remove the aggregation footers
    if (!(0, _gridAggregationUtils.areAggregationRulesEqual)(rulesOnLastRowHydration, aggregationRules)) {
      apiRef.current.requestPipeProcessorsApplication('hydrateRows');
      applyAggregation();
    }

    // Re-apply the column hydration to wrap / unwrap the aggregated columns
    if (!(0, _gridAggregationUtils.areAggregationRulesEqual)(rulesOnLastColumnHydration, aggregationRules)) {
      apiRef.current.caches.aggregation.rulesOnLastColumnHydration = aggregationRules;
      apiRef.current.requestPipeProcessorsApplication('hydrateColumns');
    }
  }, [apiRef, applyAggregation, props.aggregationFunctions, props.disableAggregation]);
  (0, _xDataGridPro.useGridApiEventHandler)(apiRef, 'aggregationModelChange', checkAggregationRulesDiff);
  (0, _xDataGridPro.useGridApiEventHandler)(apiRef, 'columnsChange', checkAggregationRulesDiff);
  (0, _xDataGridPro.useGridApiEventHandler)(apiRef, 'filteredRowsSet', applyAggregation);

  /**
   * EFFECTS
   */
  React.useEffect(() => {
    if (props.aggregationModel !== undefined) {
      apiRef.current.setAggregationModel(props.aggregationModel);
    }
  }, [apiRef, props.aggregationModel]);
};
exports.useGridAggregation = useGridAggregation;