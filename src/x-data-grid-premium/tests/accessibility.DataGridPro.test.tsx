import * as React from "react";
// import { expect } from 'chai';
import axe from "axe-core";
// import { DataGridPro } from "@mui/x-data-grid-pro";

import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { useBasicDemoData } from "./test/utils/basic-data-service";
// import { createRenderer } from '@mui/internal-test-utils';
import { render } from "@testing-library/react";

function logViolations(violations: any) {
  if (violations.length !== 0) {
    violations.forEach((violation: any) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(violation, null, 4));
    });
  }
}

describe("<DataGridPro /> - Accessibility", () => {
  beforeAll(function beforeHook() {
    if (!/chrome/i.test(window.navigator.userAgent)) {
      // Only run accessibility tests in Chrome, since it should behave the same in all browsers
     return;
    }
  });

  // const { render } = createRenderer();

  it("pinned columns should pass `aria-required-parent` rule", async () => {
    function TestCase() {
      const data = useBasicDemoData(1, 3);
      return (
        <div style={{ width: 302, height: 300 }}>
          <DataGridPremium
            {...data}
            columns={[
              { field: "id" },
              { field: "currencyPair" },
              { field: "price1M" },
            ]}
            pinnedColumns={{ left: ["id"], right: ["currencyPair"] }}
          />
        </div>
      );
    }

    render(<TestCase />);

    axe.configure({
      rules: [{ id: "aria-required-parent", enabled: true }],
      disableOtherRules: true,
    });

    const results = await axe.run();

    logViolations(results.violations);
    expect(results.violations.length).toEqual(0);
  });
});
