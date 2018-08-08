pragma solidity ^0.4.24;

import { SafeMath } from "./SafeMath.sol";

contract Owned {
	event LogCreated(address indexed owner);

    address owner;

	constructor() public {
	    owner = msg.sender;
		emit LogCreated(owner);
	}

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

contract Splitter is Owned {
	event LogSplitted(address indexed payer, address indexed first, address indexed second, uint256 remainder, uint256 amount);
	event LogWithdrawn(address indexed beneficiary, uint256 amount);

    mapping(address => uint256) public credit;

	constructor() public {
	}

	function split(address first, address second) public payable onlyOwner {
	    require(first != address(0));
	    require(second != address(0));
	    require(msg.value != 0);
	    require(first != second);
	    
        uint256 change = msg.value % 2;
        uint256 value = (msg.value - change) / 2;
  
        credit[first]  = SafeMath.add(credit[first], value);
        credit[second] = SafeMath.add(credit[second], value);
        if (change > 0)
	        credit[msg.sender] = SafeMath.add(credit[msg.sender], change);
		
		emit LogSplitted(msg.sender, first, second, value, change);
	}
	
	function withdraw(uint256 value) public payable {
	    require(credit[msg.sender] >= value);
		credit[msg.sender] -= value;
		
 		emit LogWithdrawn(msg.sender, value);
        msg.sender.transfer(value);
	}
}
