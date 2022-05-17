const { poseidonContract } = require("circomlibjs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("MerkleTree", function () {
  let merkleTree;

  beforeEach(async function () {
    const PoseidonT3 = await ethers.getContractFactory(
      poseidonContract.generateABI(2),
      poseidonContract.createCode(2)
    );
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.deployed();

    const MerkleTree = await ethers.getContractFactory("MerkleTree", {
      libraries: {
        PoseidonT3: poseidonT3.address,
      },
    });
    merkleTree = await MerkleTree.deploy();
    await merkleTree.deployed();
  });

  it("Insert two new leaves and verify the first leaf in an inclusion proof", async function () {
    // for (var i = 0; i < 15; i++) {
    //   const node = (await merkleTree.hashes(i)).toString();
    //   console.log(node);
    // }
    // console.log();

    await merkleTree.insertLeaf(1);
    await merkleTree.insertLeaf(2);

    // for (var i = 0; i < 15; i++) {
    //   const node = (await merkleTree.hashes(i)).toString();
    //   console.log(node);
    // }

    const node9 = (await merkleTree.hashes(9)).toString();
    const node13 = (await merkleTree.hashes(13)).toString();
    const node0 = (await merkleTree.hashes(0)).toString();
    const node1 = (await merkleTree.hashes(1)).toString();
    // console.log(node9);

    const Input = {
      leaf: node0,
      path_elements: [node1, node9, node13],
      path_index: ["0", "0", "0"],
    };

    // console.log(Input);
    const { proof, publicSignals } = await groth16.fullProve(
      Input,
      "circuits/circuit_js/circuit.wasm",
      "circuits/circuit_final.zkey"
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const input = argv.slice(8);

    // console.log(input);

    expect(await merkleTree.verify(a, b, c, input)).to.be.true;

    // [bonus] verify the second leaf with the inclusion proof
  });

  it("Insert two new leaves and verify the second leaf in an inclusion proof", async function () {
    // for (var i = 0; i < 15; i++) {
    //   const node = (await merkleTree.hashes(i)).toString();
    //   console.log(node);
    // }
    // console.log();

    await merkleTree.insertLeaf(1);
    await merkleTree.insertLeaf(2);

    // for (var i = 0; i < 15; i++) {
    //   const node = (await merkleTree.hashes(i)).toString();
    //   console.log(node);
    // }

    const node9 = (await merkleTree.hashes(9)).toString();
    const node13 = (await merkleTree.hashes(13)).toString();
    const node0 = (await merkleTree.hashes(0)).toString();
    const node1 = (await merkleTree.hashes(1)).toString();
    // console.log(node9);

    const Input = {
      leaf: node1,
      path_elements: [node0, node9, node13],
      path_index: ["1", "0", "0"],
    };

    // console.log(Input);
    const { proof, publicSignals } = await groth16.fullProve(
      Input,
      "circuits/circuit_js/circuit.wasm",
      "circuits/circuit_final.zkey"
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const input = argv.slice(8);

    // console.log(input);

    expect(await merkleTree.verify(a, b, c, input)).to.be.true;

    // [bonus] verify the second leaf with the inclusion proof
  });
});
//        14       4
//    12      13   3
//  8   9   10  11 2
// 0 1 2 3 4 5 6 7 1
