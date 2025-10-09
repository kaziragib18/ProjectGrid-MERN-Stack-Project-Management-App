import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("App", () => {
  it("renders the project title", () => {
    render(<h1>Welcome to ProjectGrid</h1>);
    expect(screen.getByText(/ProjectGrid/i)).toBeInTheDocument();
  });
});
