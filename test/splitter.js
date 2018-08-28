Promise = require("bluebird");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

web3.eth.expectedExceptionPromise = require("../utils/expectedException.js");

// Import the smart contracts
const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
    const MAX_GAS = 3000000;
    const AMOUNT = web3.toWei(0.007, 'ether'); // amount to give

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

//    var instance;
//    beforeEach("should deploy Splitter and get the instance", function() {
//        return Splitter.new({ from: owner, gas: MAX_GAS })
//            .then(function(_instance) {
//                instance = _instance;
//            });
//    });

    describe("Migration", function() {
        var instance;
        before("should deploy Splitter and get the instance", function() {
            return Splitter.new({ from: owner, gas: MAX_GAS })
                .then(function(_instance) {
                    instance = _instance;
                });
        });
        it("should start with proper values", function() {
            let deployed;
            return Splitter.deployed()
                .then(instance => {
                    deployed = instance;
                    return deployed.owner();
                })
                .then(_owner => {
                    assert.strictEqual(
                        _owner,
                        owner,
                        "should have creation owner");
                    return deployed.credit(owner)
                })
                .then(credit => {
                    assert.strictEqual(
                        credit.toString(10),
                        "0",
                        "owner should have 0 credit");
                    return deployed.credit(first)
                })
                .then(credit => {
                    assert.strictEqual(
                        credit.toString(10),
                        "0",
                        "first should have 0 credit");
                    return deployed.credit(second)
                })
                .then(credit => {
                    assert.strictEqual(
                        credit.toString(10),
                        "0",
                        "second should have 0 credit");
                });
        });
    });

    // in this way we can speed up test for wrong parameters?
    describe("Split as CALL", function() {
        var instance;
        before("should deploy Splitter and get the instance", function() {
            return Splitter.new({from: owner, gas: MAX_GAS })
                .then(function(_instance) {
                    instance = _instance;
                });
        });

        it("should fail if the first beneficiary is missing", function() {
            return instance.split.call(0, second, {from: owner, value: AMOUNT, gas: MAX_GAS})
                .catch(error  =>  {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should fail if the second beneficiary is missing", function() {
            return instance.split.call(first, 0, {from: owner, value: AMOUNT, gas: MAX_GAS})
                .catch(error  =>  {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });

        it("should fail if the value is zero", function() {
            return instance.split.call(first, second, {from: owner, value: 0, gas: MAX_GAS})
                .catch(error  =>  {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });
        it("should fail if the sender is not the owner ", function() {
            return instance.split.call(owner, second, {from: first, value: AMOUNT, gas: MAX_GAS})
                .catch(error  =>  {
                    assert.include(error.message, "VM Exception while processing transaction: revert");
                });
        });
    });


    describe("Split with transaction", function() {
        var instance;
        before("should deploy Splitter and get the instance", function() {
            return Splitter.new({ from: owner, gas: MAX_GAS })
                .then(function(_instance) {
                    instance = _instance;
                });
        });

        it("should fail if the first beneficiary is missing", function() {
            return web3.eth.expectedExceptionPromise(function() {
                    return instance.split(0, second, {from: owner, value: AMOUNT, gas: MAX_GAS})
                }, MAX_GAS)
        });

        it("should fail if the second beneficiary is missing", function() {
            return web3.eth.expectedExceptionPromise(function() {
                    return instance.split(first, 0, {from: owner, value: AMOUNT, gas: MAX_GAS})
                }, MAX_GAS)
        });

        it("should fail if the value is zero", function() {
            return web3.eth.expectedExceptionPromise(function() {
                    return instance.split(first, second, {from: owner, value: 0, gas: MAX_GAS})
                }, MAX_GAS)
        });

        it("should fail if the sender is not the owner", function() {
            return web3.eth.expectedExceptionPromise(function() {
                    return instance.split(owner, second, {from: first, value: AMOUNT, gas: MAX_GAS})
                }, MAX_GAS)
        });

        it("should split eth ", function() {
            var change = AMOUNT % 2;
            var credit = (AMOUNT - change) / 2;

            return instance.split(first, second, {from: owner, value: AMOUNT, gas: MAX_GAS})
                .then(txObject => {
                    assert.equal(txObject.logs.length, 1, "should have received 1 event");
                    assert.equal(txObject.logs[0].event, "LogSplitted", "should be LogSplitted event");
                    assert.equal(txObject.logs[0].args.first, first, "should be the first beneficiary");
                    assert.equal(txObject.logs[0].args.second, second, "should be the second beneficiary");
                    assert.equal(txObject.logs[0].args.remainder, change, "should be the remainder value");
                    assert.equal(txObject.logs[0].args.amount, credit, "should be the credit value");
                    return instance.credit(owner);
                }).then(value => {
                    assert.equal(value.toString(10), change.toString(10), "owner credit is wrong");
                    return instance.credit(first);
                }).then(value =>  {
                    assert.equal(value.toString(10), credit.toString(10), "first beneficiary credit is wrong");
                    return instance.credit(second);
                }).then(value =>  {
                    assert.equal(value.toString(10), credit.toString(10), "second beneficiary credit is wrong");
                });
        });
    });

    describe("Withdraw", function() {
        var instance;
        before("should deploy Splitter and get the instance", function() {
            return Splitter.new({ from: owner, gas: MAX_GAS })
                .then(function(_instance) {
                    instance = _instance;
                });
        });

        let change = AMOUNT % 2;
        let credit = (AMOUNT - change) / 2;

        it("should withdraw whole eth ", function() {
            //return instance.split(first, second, {from: owner, value: AMOUNT, gas: MAX_GAS})
            //    .then(() => function() {
            //        return instance.withdraw(credit, {from: first, gas: MAX_GAS});
            //    })
            return instance.split(first, second, {from: owner, value: AMOUNT, gas: MAX_GAS})
                .then(() => {
                    return instance.credit(first)
                })
                .then(value => {
                    assert.equal(value.toString(10), "" + credit, "first beneficiary credit is wrong");
                    return instance.withdraw(value, {from: first, gas: MAX_GAS})
                })
                .then(txObject => {
                    assert.equal(txObject.logs.length, 1, "should have received 1 event");
                    assert.equal(txObject.logs[0].event, "LogWithdrawn", "should be LogWithdrawn event");
                    assert.equal(txObject.logs[0].args.beneficiary, first, "should be the first beneficiary");
                    assert.equal(txObject.logs[0].args.amount.toString(10), "" + credit, "should be the whole credit value");
                    return instance.credit(first)
                }).then(function(value) {
                    assert.equal(value.toString(10), "0", "beneficiary credit is wrong");

                    return instance.withdraw(credit, {from: second, gas: MAX_GAS});
                }).then(txObject => {
                    assert.equal(txObject.logs.length, 1, "should have received 1 event");
                    assert.equal(txObject.logs[0].event, "LogWithdrawn", "should be LogWithdrawn event");
                    assert.equal(txObject.logs[0].args.beneficiary, second, "should be the second beneficiary");
                    assert.equal(txObject.logs[0].args.amount, credit, "should be the whole credit value");
                    return instance.credit(second)
                }).then(function(value) {
                    assert.equal(value.toString(10), "0", "beneficiary credit is wrong");

                    return instance.withdraw(change, {from: owner, gas: MAX_GAS});
                }).then(txObject => {
                    assert.equal(txObject.logs.length, 1, "should have received 1 event");
                    assert.equal(txObject.logs[0].event, "LogWithdrawn", "should be LogWithdrawn event");
                    assert.equal(txObject.logs[0].args.beneficiary, owner, "should be the owner beneficiary");
                    assert.equal(txObject.logs[0].args.amount, change, "should be the whole credit value");
                    return instance.credit(change)
                }).then(function(value) {
                    assert.equal(value.toString(10), "0", "owner credit is wrong");
                    return instance.credit(second);
                }).catch(function(error) {
                    console.log("ERROR:  " + error.message);
                });;
        });
    });
});
