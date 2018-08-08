Promise = require("bluebird");
SafeMath = require("safemath");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

// Import the smart contracts
const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
	const MAX_GAS = 3000000;

	console.log(accounts);

    var first;
    var second;
    var owner;
	before("check accounts number", function() {
        assert.isAtLeast(accounts.length, 3, "not enough accounts");
        [owner, first, second] = accounts;
        console.log("Owner  " + owner);
        console.log("First beneficiary " + first);
        console.log("Second beneficiary " + second);
    });


    var ownerBalance;
    before("should get owner balance", function() {
        return web3.eth.getBalancePromise(owner)
        	.then(_balance => {
        		ownerBalance = _balance
				console.log("Owner balance " + ownerBalance);
        	});
	});

    var instance;
    beforeEach("should deploy Splitter and get the instance", function() {
        return Splitter.new({ from: owner, gas: MAX_GAS })
            .then(function(_instance) {
                instance = _instance;
            });
    });

    describe("Split", function() {

        var ownerCredit;
        var fistCredit;
        var secondCredit;    

        it("should fail if the first beneficiary is missing", function() {
            var splitValue = ownerBalance.dividedBy(40);
            return instance.split(0, second, {sender: owner, value: splitValue, gas: MAX_GAS})
                .catch(function(error) {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should fail if the second beneficiary is missing", function() {
            var splitValue = ownerBalance.dividedBy(40);
            return instance.split(first, 0, {sender: owner, value: splitValue, gas: MAX_GAS})
                .catch(function(error) {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should fail if the vaue is zero", function() {
            return instance.split(first, second, {sender: owner, value: 0, gas: MAX_GAS})
                .catch(function(error) {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should fail if owner doesn't have enough eth", function() {
            var splitValue = ownerBalance.plus(30);
            return instance.split(first, second, {sender: owner, value: splitValue, gas: MAX_GAS})
                .catch(function(error) {
                    assert.include(error.message, "sender doesn't have enough funds");
                });
        });

        it("should split eth ", function() {
            var splitValue = ownerBalance.dividedBy(40);
            var change = splitValue.modulo(2);
            var credit = splitValue.minus(change).dividedBy(2);

            return instance.split(first, second, {sender: owner, value: splitValue, gas: MAX_GAS})
                .then(function() {
                    return instance.credit(owner)
                }).then(function(value) {
                    assert.equal(value.toString(10), change.toString(10), "owner credit is wrong");
                    return instance.credit(first);
                }).then(function(value) {
                    assert.equal(value.toString(10), credit.toString(10), "first beneficiary credit is wrong");
                    return instance.credit(second);
                }).then(function(value) {
                    assert.equal(value.toString(10), credit.toString(10), "second beneficiary credit is wrong");
                });
        });
    });
});
