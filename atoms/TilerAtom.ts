import { TilerProfileType } from "@/typings";
import { atom } from "recoil";

export const TilerAtom = atom({
  key: "TilerAtom",
  default: null as null | TilerProfileType,
});
