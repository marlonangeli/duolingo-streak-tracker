import type { CardTheme } from "@/models/card";

export type CardThemeMeta = {
  background: string;
  border: string;
  chip: string;
  chipBorder: string;
  chipText: string;
  label: string;
  muted: string;
  surface: string;
  swatch: string;
  text: string;
};

export const CARD_THEME_ORDER: CardTheme[] = [
  "polar",
  "eel",
  "duo",
  "cardinal",
  "fox",
  "owl",
  "macaw",
  "butterfly",
];

export const CARD_THEME_META: Record<CardTheme, CardThemeMeta> = {
  duo: {
    label: "Duo",
    swatch: "#58CC02",
    background: "#58CC02",
    surface: "#89E219",
    text: "#FFFFFF",
    muted: "#D7FFB8",
    chip: "#1CB0F6",
    chipBorder: "#84D8FF",
    chipText: "#FFFFFF",
    border: "#43A000",
  },
  eel: {
    label: "Eel",
    swatch: "#4B4B4B",
    background: "#4B4B4B",
    surface: "#777777",
    text: "#F7F7F7",
    muted: "#DCDCDC",
    chip: "#777777",
    chipBorder: "#AFAFAF",
    chipText: "#F7F7F7",
    border: "#AFAFAF",
  },
  polar: {
    label: "Polar",
    swatch: "#F7F7F7",
    background: "#F7F7F7",
    surface: "#FFFFFF",
    text: "#4B4B4B",
    muted: "#777777",
    chip: "#FFFFFF",
    chipBorder: "#E5E5E5",
    chipText: "#4B4B4B",
    border: "#E5E5E5",
  },
  cardinal: {
    label: "Cardinal",
    swatch: "#FF4B4B",
    background: "#FF4B4B",
    surface: "#EA2B2B",
    text: "#FFFFFF",
    muted: "#FFD4D4",
    chip: "#FF7878",
    chipBorder: "#FFB2B2",
    chipText: "#FFFFFF",
    border: "#F5A4A4",
  },
  fox: {
    label: "Fox",
    swatch: "#FF9600",
    background: "#FF9600",
    surface: "#FFB100",
    text: "#FFFFFF",
    muted: "#FFF5D3",
    chip: "#E7A601",
    chipBorder: "#FFCE8E",
    chipText: "#FFFFFF",
    border: "#FFD77A",
  },
  owl: {
    label: "Owl",
    swatch: "#58CC02",
    background: "#58CC02",
    surface: "#58A700",
    text: "#FFFFFF",
    muted: "#D7FFB8",
    chip: "#58A700",
    chipBorder: "#A5ED6E",
    chipText: "#FFFFFF",
    border: "#A5ED6E",
  },
  macaw: {
    label: "Macaw",
    swatch: "#1CB0F6",
    background: "#1CB0F6",
    surface: "#1899D6",
    text: "#FFFFFF",
    muted: "#DDF4FF",
    chip: "#1453A3",
    chipBorder: "#84D8FF",
    chipText: "#FFFFFF",
    border: "#BBF2FF",
  },
  butterfly: {
    label: "Butterfly",
    swatch: "#6F4EA1",
    background: "#6F4EA1",
    surface: "#9069CD",
    text: "#FFFFFF",
    muted: "#FFAADE",
    chip: "#9069CD",
    chipBorder: "#CE82FF",
    chipText: "#FFFFFF",
    border: "#CE82FF",
  },
};
