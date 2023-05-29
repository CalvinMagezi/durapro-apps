import { CashbackCodeType } from "@/typings";

const CheckRedeemed = (redeemed_codes: CashbackCodeType[]) => {
  if (redeemed_codes.length === 0) return 0;
  let count = 0;
  redeemed_codes.forEach((code) => {
    if (code.funds_disbursed === false) {
      count += 1;
    }
  });
  return count;
};

export default CheckRedeemed;
