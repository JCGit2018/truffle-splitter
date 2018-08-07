pragma solidity ^0.4.24;


contract Splitter {
	event LogSplitted(address indexed first, address indexed second, uint256 amount);
	event LogTryWithdraw(address indexed beneficiary, uint256 amount);

	address                     public owner;
    mapping(address => uint256) public amount;

    modifier owned {
        require(msg.sender == owner);
        _;
    }

	constructor() public {
	    owner = msg.sender;
	}

	function split(address first, address second) public payable owned {
	    require(msg.value != 0);
	    require(first != second);
	    
        uint256 change = msg.value % 2;
        uint256 value = (msg.value - change) / 2;
  
        amount[first]  += value;
        amount[second]  += value;
        amount[msg.sender]  += change;

        emit LogSplitted(first, second, value);
	}
	
	function withdraw(uint256 value) public payable {
	    require(amount[msg.sender] >= value);
       	//uint256 withdrawn = amount[msg.sender];
		amount[msg.sender] -= value;
		
 		emit LogTryWithdraw(msg.sender, value);
        msg.sender.transfer(value);
	}
}
