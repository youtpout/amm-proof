// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
        counter.setNumber(0);
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }

     function testHash() public {
        bytes32  PROVING_SYSTEM_ID = keccak256(abi.encodePacked("ultraplonk"));
        bytes32  VERSION_HASH = sha256(abi.encodePacked(""));
       bytes32 leaf = keccak256(abi.encodePacked(PROVING_SYSTEM_ID, vkey, VERSION_HASH, keccak256(abi.encodePacked(_hash))));

        assertEq(counter.number(), x);
    }
}
