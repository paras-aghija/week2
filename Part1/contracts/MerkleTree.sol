//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {PoseidonT3} from "./Poseidon.sol"; //an existing library to perform Poseidon hash on solidity
import "./verifier.sol"; //inherits with the MerkleTreeInclusionProof verifier contract

contract MerkleTree is Verifier {
    uint256[] public hashes; // the Merkle tree in flattened array form
    uint256 public index = 0; // the current index of the first unfilled leaf
    uint256 public root; // the current Merkle root
    uint256 private size;

    constructor() {
        // [assignment] initialize a Merkle tree of 8 with blank leaves

        size = 8;
        for (uint256 t = 0; t < size; t++) {
            hashes.push(0);
        }
        uint256 x = size;
        uint256 i = 0;
        while (i + 1 != x) {
            hashes.push(PoseidonT3.poseidon([hashes[i], hashes[i + 1]]));
            i += 2;
            x++;
        }
        root = hashes[x - 1];
    }

    function insertLeaf(uint256 hashedLeaf) public returns (uint256) {
        // [assignment] insert a hashed leaf into the Merkle tree
        hashes[index] = hashedLeaf;

        uint256 start = 0;
        uint256 x = index;

        for (uint256 i = 1; i < size; i *= 2) {
            uint256 pos = start + x;
            start += size / i;
            x /= 2;
            uint256 pos2 = start + x;

            if (pos % 2 == 0) {
                hashes[pos2] = PoseidonT3.poseidon(
                    [hashes[pos], hashes[pos + 1]]
                );
            } else {
                hashes[pos2] = PoseidonT3.poseidon(
                    [hashes[pos - 1], hashes[pos]]
                );
            }
        }
        index++;
        root = hashes[hashes.length - 1];
        return root;
    }

    function verify(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public view returns (bool) {
        // [assignment] verify an inclusion proof and check that the proof root matches current root
        return root == input[0] && Verifier.verifyProof(a, b, c, input);
    }
}
//         14
//    12       13
//  8   9   10  11
// 0 1 2 3 4 5 6 7
