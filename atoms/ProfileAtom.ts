import { ProfileType } from "@/typings";
import { atom } from "recoil";

export const profileAtom = atom({
  key: "profileAtom",
  default: null as null | ProfileType,
});

export const AuthAtom = atom({
  key: "AuthAtom",
  default: false,
});
