# truffle-splitter
Truffle excercise projects

### Requirements

- there are 3 people: Alice, Bob and Carol.
- we can see the balance of the Splitter contract on the Web page.
- whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
- we can see the balances of Alice, Bob and Carol on the Web page.
- Alice can use the Web page to split her ether.

### Hypothesis:

- the beneficiaries are set at contract creation time 
- the constract belongs to Alice (the owner) so only she can send eth
- as Bob and Carol can see their balance, they could withdraw ether whenever they want, so ethers are NOT send when Alice send them.
- the splitting remainder when Ether (or better wei...) are odd remains to Alice (into the contract)

### Pending

- limit the beneficiary just to 2? And when?
- coulde be better not to limit beneficiaries to only 2 and so use mapping... What at split time? It is not required...
- what about setting beneficiaries at creation time? drawback is that their address must be known whan the contract is created
- what about explicitly setting beneficiaries with a proper function? it is more expensive, but maybe safer (only 2 beneficiaries) and making simpler the split call....
- add some method to close this contract....

### Missings (just for now?)

- web page
- no logs
- amount checks (what if Alice sends 0 ether?)
- beneficiaries check
- no tests

### Other
- used solidity on web for compilation check and first test
- current splitter implementation allows the split between 2 beneficiaries not necessarily always the same 2...
