# Proof of liquidity

Having liquidity only allows you to recover fees on the swap. What if we gave liquidity providers other privileges, such as a reduced fee on the different accounts the liquidity provider uses?

Thanks to the zkproof, the liquidity provider will be able to obtain fee reductions on all his accounts, without his accounts disclosing which liquidity provider he corresponds to.

## Prover Info
root = "0x042f2e2d80278cbf3c9845ca9d88a93676effcde80c42f8b858bf7fec768439b"  
user = "0x0807C544D38aE7729f8798388d89Be6502A1e8A8"  
requester = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  
index = "0" 
witness = ["0x00", "0x27b1d0839a5b23baf12a8d195b18ac288fcf401afb2f70b8a4b529ede5fa9fed", "0x21dbfd1d029bf447152fcf89e355c334610d1632436ba170f738107266a71550", "0x0bcd1f91cf7bdd471d0a30c58c4706f3fdab3807a954b8f5b5e3bfec87d001bb"] 

 vkHash: '0x84206bd577ca68a0e0728ef0ad8af2ceac389bf235dc69095a9e3e5b95621c03'

 Pool contract address = 0x723aB412d2371e601dCeAf6E284C13FEEBA573d0

### Installation
You can deploy the pool.sol directly from remix on base sepolia

Create 2 tokens maybe before or use 2 existant token, for the 
```
vkey = 0x84206bd577ca68a0e0728ef0ad8af2ceac389bf235dc69095a9e3e5b95621c03 
zkVerify = 0x0807C544D38aE7729f8798388d89Be6502A1e8A8
```

Set the root in his deployed contract, ideally you create it from existant liquidity provider but for test you can use information from Prover Info chapter

Launch the project in  dex-front
```
npm i
npm run dev
```
http://localhost:3000/backend 

from the project you can generate new proof, put the root use in the smartcontract and the user you want to register

you can now register this user in the contract method registerCoupon, the user will have lifetime reduction on fees
example of parameter
```
_user:0x0807C544D38aE7729f8798388d89Be6502A1e8A8
_domainId:2
_aggregationId:143
_merklePath:[]
_leafCount:1
_index:0
```