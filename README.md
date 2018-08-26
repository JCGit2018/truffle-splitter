# truffle-splitter
Truffle excercise projects

### Requirements

- there are 3 people: Alice, Bob and Carol.
- we can see the balance of the Splitter contract on the Web page.
- whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
- we can see the balances of Alice, Bob and Carol on the Web page.
- Alice can use the Web page to split her ether.

### Hypothesis:

- the constract belongs to Alice (the owner) so only she can send eth
- Actually Alice can split eth between any couple of beneficiary 
- anyone can see its balance 
- anyone can withdraw some ether from its amount in contract (exception if no ether available)).
- the splitting remainder when amonut to be splitten is odd remains to Alice (into the contract)

### Pending

- what about explicitly setting beneficiaries with a proper function insted in constructor?
- add some method to close this contract....
- consider log for contract creation
- increase tests and add some wrong scenario 
- how check event in test?
- how check expected exception in test?
- what about network where the contract is deployed?
- how unlock account?
- wrong parameters could be tested using call instead of transaction, to speed up tests?

### Missings (just for now?)

- web page

### Other
- used solidity on web for compilation check and first test
