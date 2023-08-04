import { gql } from "@apollo/client";

export const GetUsersWithCodes = gql`
  query cashback_users_with_codes {
    cashback_usersList {
      redeemed_codes {
        _createdAt
        _id
        code
        disbursed_on
        funds_disbursed
        mm_confirmation
        product_name
        redeemed
        redeemed_by
        redeemed_on
      }
      _id
      _createdAt
      first_login
      phone_number
      role
      uid
    }
  }
`;
