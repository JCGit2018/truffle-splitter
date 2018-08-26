pragma solidity ^0.4.24;

import { SafeMath } from "./SafeMath.sol";
import "./Owned.sol";

contract Splitter is Owned {
    using SafeMath for uint256;

    mapping(address => uint256) public credit;

    event LogSplitted(address indexed payer, address indexed first, address indexed second, uint256 remainder, uint256 amount);
    event LogWithdrawn(address indexed beneficiary, uint256 amount);

    constructor() public {
    }

    function split(address first, address second) public payable onlyOwner {
        require(first != address(0));
        require(second != address(0));
        require(msg.value != 0);
        require(first != second);

        uint256 change = msg.value % 2;
        uint256 value = (msg.value - change) / 2;

        credit[first]  = credit[first].add(value);
        credit[second] = credit[second].add(value);
        if (change > 0)
            credit[msg.sender] = credit[msg.sender].add(change);

        emit LogSplitted(msg.sender, first, second, change, value);
    }

    function withdraw(uint256 value) public payable {
        require(credit[msg.sender] >= value);
        credit[msg.sender] = credit[msg.sender].sub(value);

        emit LogWithdrawn(msg.sender, value);
        msg.sender.transfer(value);
    }
}
