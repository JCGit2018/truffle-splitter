pragma solidity ^0.4.24;


contract Splitter {
	event LogSplitted(address indexed first, address indexed second, uint256 amount);
	event LogWithdraw(address indexed beneficiary, uint256 amount);

    struct Beneficiary {
        address addr;
        uint256 amount;
    }
	address public owner;
	uint256 private amount;

    Beneficiary firstBeneficiary;
    Beneficiary secondBeneficiary;

    modifier owned {
        require(msg.sender == owner);
        _;
    }

	constructor(address first, address second) public {
	    require(first != second);

	    owner = msg.sender;

        firstBeneficiary.addr  = first;
        secondBeneficiary.addr = second;
	}

	function split() public payable owned {
	    require(msg.value != 0);
	    
        uint256 change = msg.value % 2;
        uint256 value = (msg.value - change) / 2;
  
        firstBeneficiary.amount  += value;
        secondBeneficiary.amount += value;
        amount += change;

        emit LogSplitted(firstBeneficiary.addr, secondBeneficiary.addr, value);
	}
	
	function withdraw() public payable {
       	uint256 withdrawn = 0;
	   	if (firstBeneficiary.addr == msg.sender) {
	   		withdrawn = firstBeneficiary.amount;
	    	firstBeneficiary.amount = 0;
	   	} else if (secondBeneficiary.addr == msg.sender) {
		    withdrawn = secondBeneficiary.amount;
		    secondBeneficiary.amount = 0;
	   	} else if (owner == msg.sender) {
	        withdrawn = amount;
	        amount = 0;
	   	} else {
	        revert("No Eth for you!");
	  	}
        
        require(withdrawn > 0);
        
 		emit LogWithdraw(msg.sender, withdrawn);
        msg.sender.transfer(withdrawn);
	}

	function getAmount() public view returns(uint256 out) {
	   if (firstBeneficiary.addr == msg.sender) {
	       out = firstBeneficiary.amount;
	   } else if (secondBeneficiary.addr == msg.sender) {
	       out = secondBeneficiary.amount;
	   } else if (owner == msg.sender) {
	       out = amount;
	   }
    
        return out;
	}
}
