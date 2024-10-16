/**
 * @mui/x-data-grid-premium v7.20.0
 *
 * @license MUI X Commercial
 * This source code is licensed under the commercial license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  LicenseInfo: true,
  GridColumnHeaders: true,
  useGridApiContext: true,
  useGridApiRef: true,
  useGridRootProps: true,
  GridColumnMenu: true,
  GRID_COLUMN_MENU_SLOTS: true,
  GRID_COLUMN_MENU_SLOT_PROPS: true
};
Object.defineProperty(exports, "GRID_COLUMN_MENU_SLOTS", {
  enumerable: true,
  get: function () {
    return _reexports2.GRID_COLUMN_MENU_SLOTS;
  }
});
Object.defineProperty(exports, "GRID_COLUMN_MENU_SLOT_PROPS", {
  enumerable: true,
  get: function () {
    return _reexports2.GRID_COLUMN_MENU_SLOT_PROPS;
  }
});
Object.defineProperty(exports, "GridColumnHeaders", {
  enumerable: true,
  get: function () {
    return _xDataGridPro.GridColumnHeaders;
  }
});
Object.defineProperty(exports, "GridColumnMenu", {
  enumerable: true,
  get: function () {
    return _reexports2.GridColumnMenu;
  }
});
exports.LicenseInfo = void 0;
Object.defineProperty(exports, "useGridApiContext", {
  enumerable: true,
  get: function () {
    return _reexports.useGridApiContext;
  }
});
Object.defineProperty(exports, "useGridApiRef", {
  enumerable: true,
  get: function () {
    return _reexports.useGridApiRef;
  }
});
Object.defineProperty(exports, "useGridRootProps", {
  enumerable: true,
  get: function () {
    return _reexports.useGridRootProps;
  }
});
require("./typeOverloads");
var _xLicense = require("@mui/x-license");
var _components = require("@mui/x-data-grid/components");
Object.keys(_components).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _components[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _components[key];
    }
  });
});
var _components2 = require("@mui/x-data-grid-pro/components");
Object.keys(_components2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _components2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _components2[key];
    }
  });
});
var _constants = require("@mui/x-data-grid/constants");
Object.keys(_constants).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _constants[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _constants[key];
    }
  });
});
var _hooks = require("@mui/x-data-grid/hooks");
Object.keys(_hooks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _hooks[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hooks[key];
    }
  });
});
var _hooks2 = require("@mui/x-data-grid-pro/hooks");
Object.keys(_hooks2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _hooks2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hooks2[key];
    }
  });
});
var _models = require("@mui/x-data-grid/models");
Object.keys(_models).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _models[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _models[key];
    }
  });
});
var _models2 = require("@mui/x-data-grid-pro/models");
Object.keys(_models2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _models2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _models2[key];
    }
  });
});
var _context = require("@mui/x-data-grid/context");
Object.keys(_context).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _context[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _context[key];
    }
  });
});
var _colDef = require("@mui/x-data-grid/colDef");
Object.keys(_colDef).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _colDef[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _colDef[key];
    }
  });
});
var _utils = require("@mui/x-data-grid/utils");
Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _utils[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _utils[key];
    }
  });
});
var _utils2 = require("@mui/x-data-grid-pro/utils");
Object.keys(_utils2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _utils2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _utils2[key];
    }
  });
});
var _DataGridPremium = require("./DataGridPremium");
Object.keys(_DataGridPremium).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _DataGridPremium[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _DataGridPremium[key];
    }
  });
});
var _hooks3 = require("./hooks");
Object.keys(_hooks3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _hooks3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hooks3[key];
    }
  });
});
var _models3 = require("./models");
Object.keys(_models3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _models3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _models3[key];
    }
  });
});
var _components3 = require("./components");
Object.keys(_components3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _components3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _components3[key];
    }
  });
});
var _xDataGridPro = require("@mui/x-data-grid-pro");
var _reexports = require("./typeOverloads/reexports");
var _reexports2 = require("./components/reexports");
/**
 * @deprecated Use `@mui/x-license` package instead:
 * @example import { LicenseInfo } from '@mui/x-license';
 */
class LicenseInfo extends _xLicense.LicenseInfo {}
exports.LicenseInfo = LicenseInfo;