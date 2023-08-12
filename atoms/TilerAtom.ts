import { CashbackCodeType, TilerProfileType } from "@/typings";
import { atom } from "recoil";

interface TilerWithCodes {
  tiler: string;
  codes: CashbackCodeType[];
}

export const TilerAtom = atom({
  key: "TilerAtom",
  default: null as null | TilerProfileType,
});

export const CurrentTilerAtom = atom({
  key: "CurrentTilerAtom",
  default: null as null | TilerWithCodes,
});
