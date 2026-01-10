import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VenueSelection } from "../venueSelection";
import * as swr from "swr";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

global.fetch = vi.fn();

const mockVenues = [
  {
    id: "vq1",
    venueId: "v1",
    ofmiId: "o1",
    capacity: 50,
    occupied: 10,
    venue: {
      id: "v1",
      name: "Sede Norte",
      address: "Calle Norte 1",
      state: "Nuevo León",
      googleMapsUrl: "http://maps.google.com",
    },
  },
  {
    id: "vq2",
    venueId: "v2",
    ofmiId: "o1",
    capacity: 20,
    occupied: 0,
    venue: {
      id: "v2",
      name: "Sede Sur",
      address: "Calle Sur 2",
      state: "CDMX",
      googleMapsUrl: null,
    },
  },
];

describe("VenueSelection Component", () => {
  it("renders loading state", () => {
    (swr.default as any).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    render(<VenueSelection ofmiEdition={1} />);
    expect(screen.getByText(/Cargando sedes/i)).toBeDefined();
  });

  it("renders venues sorted alphabetically by state by default", () => {
    (swr.default as any).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(<VenueSelection ofmiEdition={1} />);

    expect(screen.getByText("Sede de Participación")).toBeDefined();

    const select = screen.getByLabelText("Sede Disponible") as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options).toHaveLength(3);
    
    expect(options[1].text).toContain("CDMX - Sede Sur");
    expect(options[2].text).toContain("Nuevo León - Sede Norte");
  });

  it("shows venue details when selected", () => {
    (swr.default as any).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(<VenueSelection ofmiEdition={1} />);

    const select = screen.getByLabelText("Sede Disponible");
    
    fireEvent.change(select, { target: { value: "vq2" } });

    expect(screen.getByText("Detalles de la Sede")).toBeDefined();
    expect(screen.getByText(/Calle Sur 2/)).toBeDefined();
    
    expect(screen.queryByText("Ver en Google Maps")).toBeNull();
  });

  it("shows map link if available", () => {
    (swr.default as any).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(<VenueSelection ofmiEdition={1} />);
    const select = screen.getByLabelText("Sede Disponible");
    
    fireEvent.change(select, { target: { value: "vq1" } });

    expect(screen.getByText("Ver en Google Maps")).toBeDefined();
  });
});
