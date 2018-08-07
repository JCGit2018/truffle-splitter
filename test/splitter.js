Promise = require("bluebird");
const getBalancePromise = Promise.promisify(web3.eth.getBalance);

// Import the smart contracts
const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
	const MAX_GAS = 3000000;

	console.log(accounts);

	before("check accounts number", function() {
        assert.isAtLeast(accounts.length, 3, "not enough accounts");
    });

	var instance;
    before("should get a Splitter instance", function() {
        return Splitter.deployed()
            .then(function(_instance) {
                instance = _instance;
            });
    });

    var first;
    var second;
    var owner;
    before("should get owner and benificiaries", function() {
        return instance.owner()
            .then(_owner => owner = _owner)
            .then(function() {
			    for (var i = 0; i < accounts.length; i++) {
			    	if (owner != accounts[i] && typeof(first) == "undefined")
			    		first = accounts[i];
			    	else if (owner != accounts[i] && typeof(second) == "undefined")
			    		second = accounts[i];
			    }
        	})
        	.then(function() {
				console.log("Owner  " + owner);
				console.log("First  " + first);
				console.log("Second " + second);
        	});
    });

    var ownerBalance;
    before("should get owner balance", function() {
        return getBalancePromise(owner)
        	.then(_balance => {
        		ownerBalance = _balance
				console.log("Owner balance " + ownerBalance);
        	});
	});

    var ownerAmount;
    it("should get amount for owner", function() {
        return instance.amount(owner)
            .then(function(value) {
            	ownerAmount = value;
				console.log("Amount for " + owner + " is " + value);
            });
    });

    var fistAmount;
    it("should get amount for first beneficiary", function() {
        return instance.amount(first)
            .then(function(value) {
            	fistAmount = value;
				console.log("Amount for " + first + " is " + value);
            });
    });

    var secondAmount;    
    it("should get amount for second beneficiary", function() {
        return instance.amount(second)
            .then(function(value) {
            	secondAmount = value;
				console.log("Amount for " + second + " is " + value);
            });
    });


    it("should split eth ", function() {
	    var splitValue = ownerBalance / 3;
        return instance.split(first, second, {sender: owner, value: splitValue, gas: MAX_GAS});
    });

    it("should check owner balance", function() {
        return getBalancePromise(owner)
        	.then(_balance => {
        		var payed = ownerBalance - _balance;
				console.log("Owner new balance " + _balance);
				console.log("Owner payed " + payed);
        	});
	});

    it("should check amount for owner", function() {
        return instance.amount(owner)
            .then(function(value) {
            	var delta =  value - ownerAmount;
				console.log("Amount for " + owner + " increased by " + delta);
            });
    });

    it("should check amount for first beneficiary", function() {
        return instance.amount(first)
            .then(function(value) {
            	var delta =  value - fistAmount;
				console.log("Amount for " + first + " increased by " + delta);
            });
    });

    it("should check amount for second beneficiary", function() {
        return instance.amount(second)
            .then(function(value) {
            	var delta =  value - secondAmount;
				console.log("Amount for " + second + " increased by " + delta);
            });
    });

});
