use dep::std::{self, ops::Sub};

fn main(
    root: pub Field,
    user: pub Field,
    // for hackathon we pass the requester, in real scenario we need to verify the requester by signature
    requester: Field,
    index: Field,
    witness: [Field; 4],
) {
    let calculated_root: Field = compute_merkle_root(requester, index, witness);
    assert(calculated_root == root, "Incorrect root");
    assert(user != 0, "User cannot be zero");
}

fn compute_merkle_root(leaf: Field, index: Field, hash_path: [Field]) -> Field {
    let n = hash_path.len();
    let index_bits: [u1; 4] = index.to_le_bits();
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };

        current = std::hash::pedersen_hash([hash_left, hash_right]);
    }
    current
}

#[test]
fn test_main() {
    let witness0 = std::hash::pedersen_hash([0, 0]);
    let witness1 = std::hash::pedersen_hash([witness0, witness0]);
    let witness2 = std::hash::pedersen_hash([witness1, witness1]);
    let witness: [Field; 4] = [0, witness0, witness1, witness2];
    let user: Field = 0x0807C544D38aE7729f8798388d89Be6502A1e8A8;
    let requester: Field = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    let root = getMerkleRoot(requester);

    println(root);
    println(witness);
    println(witness0);
    println(witness1);
    println(witness2);

    main(root, user, requester, 0, witness);
}

#[test(should_fail_with = "Incorrect root")]
fn test_merkle() {
    let witness: [Field; 4] = [0, 0, 0, 0];
    let user: Field = 0x0807C544D38aE7729f8798388d89Be6502A1e8A8;
    let requester: Field = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    let root = getMerkleRoot(requester);


    main(root.sub(1), user, requester, 0, witness);
}

// not preety but just for test
fn getMerkleRoot(user: Field) -> Field {
    let mut level0: [Field; 16] = [0; 16];
    level0[0] = user;

    let mut level1: [Field; 8] = [0; 8];
    for i in 0..8 {
        level1[i] = std::hash::pedersen_hash([level0[2 * i], level0[2 * i + 1]]);
    }

    let mut level2: [Field; 4] = [0; 4];
    for i in 0..4 {
        level2[i] = std::hash::pedersen_hash([level1[2 * i], level1[2 * i + 1]]);
    }

    let mut level3: [Field; 2] = [0; 2];
    for i in 0..2 {
        level3[i] = std::hash::pedersen_hash([level2[2 * i], level2[2 * i + 1]]);
    }

    let root: Field = std::hash::pedersen_hash([level3[0], level3[1]]);

    root
}
