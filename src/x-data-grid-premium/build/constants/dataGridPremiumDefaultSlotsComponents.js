"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DATA_GRID_PREMIUM_DEFAULT_SLOTS_COMPONENTS = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _internals = require("@mui/x-data-grid-pro/internals");
var _GridPremiumColumnMenu = require("../components/GridPremiumColumnMenu");
var _material = _interopRequireDefault(require("../material"));
const DATA_GRID_PREMIUM_DEFAULT_SLOTS_COMPONENTS = exports.DATA_GRID_PREMIUM_DEFAULT_SLOTS_COMPONENTS = (0, _extends2.default)({}, _internals.DATA_GRID_PRO_DEFAULT_SLOTS_COMPONENTS, _material.default, {
  columnMenu: _GridPremiumColumnMenu.GridPremiumColumnMenu
});