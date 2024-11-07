import * as React from "react";
import { gridFilterModelSelector } from "@mui/x-data-grid";
import { GridApi } from "../typeOverloads/reexports";
import { useGridApiRef } from "../hooks/utils/useGridApiRef";
import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
import { DataGridPremiumProps } from "../models/dataGridPremiumProps";
import { render, act } from "@testing-library/react";

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe("<DataGrid /> - Filter panel", () => {
  const baselineProps: DataGridPremiumProps = {
    autoHeight: isJSDOM,
    disableVirtualization: true,
    rows: [],
    columns: [{ field: "brand" }],
  };
  let apiRef: React.MutableRefObject<GridApi>;
  function TestCase(props: Partial<DataGridPremiumProps>) {
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPremium apiRef={apiRef} {...baselineProps} {...props} />
      </div>
    );
  }

  it("should add an id and `operator` to the filter item created when opening the filter panel", () => {
    render(<TestCase />);
    act(() => apiRef.current.showFilterPanel("brand"));
    const model = gridFilterModelSelector(apiRef);
    expect(model.items).toHaveLength(1);
    expect(model.items[0].id).not.toEqual(null);
    expect(model.items[0].operator).not.toEqual(null);
  });
});
