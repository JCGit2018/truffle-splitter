pragma solidity ^0.4.24;

import { SafeMath } from "./SafeMath.sol";

contract Owned {
    address public owner;

    event LogCreated(address indexed owner);

    constructor() public {
        owner = msg.sender;
        emit LogCreated(owner);
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}
