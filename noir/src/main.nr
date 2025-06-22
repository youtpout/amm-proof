use dep::std::{self};

fn main(
    coupon: pub Field,
    user: pub Field,
    once: pub Field,
    fee: pub Field,
    secret0: Field,
    secret1: Field,
) {
    let hash_secret: Field = std::hash::hash_to_field([secret0, secret1]);
    let expected_secret: Field = 0x29cc38a38450970d467f7e60428805a67bd687eff454e0cf8ef773ae2c210fe7;
    assert(hash_secret == expected_secret, "Incorrect secret");

    let hash_data: Field = std::hash::hash_to_field([user, once, fee, expected_secret]);
    println(hash_data);
    assert(hash_data == coupon, "Incorrect coupon");
}

#[test]
fn test_main() {
    let secret0= 1337;
    let secret1: Field = 42;
    let expected_secret: Field = std::hash::hash_to_field([1337, 42]);

    let user: Field = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    let once: Field = 1;
    // 0,1% fees
    let fee: Field = 100;

    let coupon: Field = std::hash::hash_to_field([user, once, fee, expected_secret]);

    main(coupon, user, once, fee, secret0, secret1);

}

#[test(should_fail_with = "Incorrect secret")]
fn test_secret() {
    let secret0= 1337;
    let secret1: Field = 42;
    let expected_secret: Field = std::hash::hash_to_field([secret0, secret1]);

    let user: Field = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    let once: Field = 1;
    // 0,1% fees
    let fee: Field = 100;

    let coupon: Field = std::hash::hash_to_field([user, once, fee, expected_secret]);

    main(coupon, user, once, fee, 12, secret1);

}


#[test(should_fail_with = "Incorrect coupon")]
fn test_coupon() {
    let secret0= 1337;
    let secret1: Field = 42;
    let expected_secret: Field = std::hash::hash_to_field([13377, 42]);

    let user: Field = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    let once: Field = 1;
    // 0,1% fees
    let fee: Field = 100;

    let coupon: Field = std::hash::hash_to_field([user, 0, fee, expected_secret]);

    main(coupon, user, once, fee, secret0, secret1);

}